const amqp = require("amqplib");

class MessageQueue {
  constructor() {
    this.channel = null;
    this.connection = null;
  }

  async connect() {
    const maxRetries = 5;
    const retryInterval = 5000;
    let currentRetry = 0;

    while (currentRetry < maxRetries) {
      try {
        console.log(
          `Tentative de connexion ${currentRetry + 1}/${maxRetries} à RabbitMQ`
        );
        this.connection = await amqp.connect(process.env.RABBITMQ_URL);
        this.channel = await this.connection.createChannel();

        // Déclarer l'exchange
        await this.channel.assertExchange("book_events", "topic", {
          durable: true,
        });

        // Déclarer la queue
        const { queue } = await this.channel.assertQueue("book_notifications", {
          durable: true,
        });

        this.connection.on("error", (err) => {
          console.error("Erreur de connexion RabbitMQ:", err);
          this.reconnect();
        });

        console.log("Connecté à RabbitMQ avec succès");
        return;
      } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        currentRetry++;
        if (currentRetry === maxRetries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }

  async reconnect() {
    console.log("Tentative de reconnexion à RabbitMQ...");
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (err) {
      console.error("Erreur lors de la fermeture de la connexion:", err);
    }
    await this.connect();
  }

  isConnected() {
    return (
      this.connection !== null &&
      this.channel !== null &&
      this.connection.connection.serverProperties !== null
    );
  }

  async consume(eventType, callback) {
    if (!this.isConnected()) {
      console.log("Consumer non connecté, tentative de connexion...");
      await this.connect();
    }

    console.log(
      `Configuration du consumer pour ${eventType} sur la queue book_notifications`
    );

    try {
      // Vérifier que la queue existe
      await this.channel.assertQueue("book_notifications", { durable: true });

      // Re-bind explicite
      await this.channel.bindQueue(
        "book_notifications",
        "book_events",
        eventType
      );
      console.log(
        `Binding créé: book_notifications -> book_events avec key ${eventType}`
      );

      await this.channel.consume(
        "book_notifications",
        async (msg) => {
          if (msg) {
            try {
              console.log("Message brut reçu:", msg.content.toString());
              const content = JSON.parse(msg.content.toString());
              console.log("Type d'événement attendu:", eventType);
              console.log("Type d'événement reçu:", content.eventType);

              if (content.eventType === eventType) {
                await callback(content.data);
                this.channel.ack(msg);
              } else {
                console.log(`Event type non correspondant, ignoré`);
                this.channel.ack(msg); // ou nack selon votre logique
              }
            } catch (error) {
              console.error("Erreur de traitement:", error);
              this.channel.nack(msg, false, true);
            }
          }
        },
        { noAck: false }
      );
    } catch (error) {
      console.error("Erreur lors de la configuration du consumer:", error);
      throw error;
    }
  }
}

module.exports = MessageQueue;
