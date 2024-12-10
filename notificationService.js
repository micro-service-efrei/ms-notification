const MessageQueue = require("./services/messageQueue");
const Mailjet = require("node-mailjet");
require("dotenv").config();
const express = require("express");
const healthApp = require("./health");

class NotificationService {
  constructor() {
    this.mailjet = Mailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_API_SECRET
    );
    this.messageQueue = new MessageQueue();
    console.log("Service de notification créé avec Mailjet configuré");
  }

  async initialize() {
    try {
      console.log("Initialisation du service de notification...");

      await this.messageQueue.connect();
      console.log("Connexion RabbitMQ établie");

      await this.setupEventListeners();

      healthApp.set("messageQueue", this.messageQueue);

      console.log("Service de notification initialisé avec succès");
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
      throw error;
    }
  }

  async setupEventListeners() {
    console.log("Configuration des listeners...");
    const events = [
      {
        type: "book.created",
        handler: this.sendNewBookNotification.bind(this),
      },
      {
        type: "book.updated",
        handler: this.sendBookUpdateNotification.bind(this),
      },
      {
        type: "book.deleted",
        handler: this.sendBookDeletionNotification.bind(this),
      },
    ];

    for (const event of events) {
      console.log(`Configuration du consumer pour ${event.type}`);
      await this.messageQueue.consume(event.type, async (data) => {
        console.log(`Événement ${event.type} reçu:`, data);
        await event.handler(data);
      });
      console.log(`Consumer configuré pour ${event.type}`);
    }
  }

  async sendNewBookNotification(book) {
    const mailData = {
      Messages: [
        {
          From: {
            Email: process.env.SENDER_EMAIL,
            Name: process.env.SENDER_NAME,
          },
          To: [
            {
              Email: process.env.NOTIFICATION_EMAIL,
              Name: "Admin Bibliothèque",
            },
          ],
          Subject: "Nouveau livre ajouté à la bibliothèque",
          HTMLPart: `
          <h2>Un nouveau livre a été ajouté</h2>
          <p><strong>Titre:</strong> ${book.title}</p>
          <p><strong>Auteur:</strong> ${book.author}</p>
          <p><strong>Catégories:</strong> ${book.categories.join(", ")}</p>
          <p><strong>Date de publication:</strong> ${new Date(
            book.publishedDate
          ).toLocaleDateString()}</p>
          <p><strong>Description:</strong> ${book.description}</p>
        `,
        },
      ],
    };

    await this.sendEmail(mailData);
  }

  async sendBookUpdateNotification(book) {
    const mailData = {
      Messages: [
        {
          From: {
            Email: process.env.SENDER_EMAIL,
            Name: process.env.SENDER_NAME,
          },
          To: [
            {
              Email: process.env.NOTIFICATION_EMAIL,
              Name: "Admin Bibliothèque",
            },
          ],
          Subject: "Livre mis à jour dans la bibliothèque",
          HTMLPart: `
          <h2>Un livre a été mis à jour</h2>
          <p><strong>Titre:</strong> ${book.title}</p>
          <p><strong>Auteur:</strong> ${book.author}</p>
          <p><strong>Catégories:</strong> ${book.categories.join(", ")}</p>
          <p><strong>Date de publication:</strong> ${new Date(
            book.publishedDate
          ).toLocaleDateString()}</p>
          <p><strong>Description:</strong> ${book.description}</p>
        `,
        },
      ],
    };

    await this.sendEmail(mailData);
  }

  async sendBookDeletionNotification(bookId) {
    const mailData = {
      Messages: [
        {
          From: {
            Email: process.env.SENDER_EMAIL,
            Name: process.env.SENDER_NAME,
          },
          To: [
            {
              Email: process.env.NOTIFICATION_EMAIL,
              Name: "Admin Bibliothèque",
            },
          ],
          Subject: "Livre supprimé de la bibliothèque",
          HTMLPart: `
          <h2>Un livre a été supprimé</h2>
          <p>Le livre avec l'ID ${bookId} a été supprimé de la bibliothèque.</p>
        `,
        },
      ],
    };

    await this.sendEmail(mailData);
  }

  async sendEmail(mailData) {
    try {
      console.log('Tentative d\'envoi d\'email avec les données:', JSON.stringify(mailData, null, 2));
      const result = await this.mailjet
        .post("send", { version: "v3.1" })
        .request(mailData);
      
      console.log('Réponse Mailjet:', JSON.stringify(result.body, null, 2));
      console.log("Email envoyé avec succès");
      return result;
    } catch (error) {
      console.error("Erreur détaillée lors de l'envoi de l'email:", {
        message: error.message,
        statusCode: error.statusCode,
        response: error.response ? error.response.body : null
      });
      throw error;
    }
  }
}

module.exports = NotificationService;
