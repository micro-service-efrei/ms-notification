const NotificationService = require("./notificationService");
const healthApp = require("./health");

const start = async () => {
  try {
    const notificationService = new NotificationService();
    await notificationService.initialize();

    const PORT = process.env.PORT || 3002;
    healthApp.listen(PORT, () => {
      console.log(`Service de notification démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur au démarrage:", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (error) => {
  console.error("Erreur non gérée:", error);
  process.exit(1);
});

start();

// health.js
const express = require("express");
const app = express();

app.get("/health", (req, res) => {
  const messageQueue = app.get("messageQueue");
  const isConnected = messageQueue && messageQueue.isConnected();

  res.status(200).json({
    status: "ok",
    rabbitMQ: isConnected ? "connected" : "disconnected",
  });
});

module.exports = app;
