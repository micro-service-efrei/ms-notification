// server.js
const NotificationService = require("./notificationService");
const healthApp = require("./health");
const express = require("express");
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');

const start = async () => {
  try {
    const app = express();
    const notificationService = new NotificationService();
    await notificationService.initialize();

    // Add middleware
    app.use(express.json());
    
    // Ajouter Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

    // Health check routes
    app.use(healthApp);

    // Add notification routes
    app.post('/notify', async (req, res) => {
      try {
        const { to, subject, message, type } = req.body;
        
        // Validate request
        if (!to || !subject || !message || !type) {
          return res.status(400).json({
            error: 'Missing required fields',
            required: ['to', 'subject', 'message', 'type']
          });
        }

        // Prepare email data
        const mailData = {
          Messages: [{
            From: {
              Email: process.env.SENDER_EMAIL,
              Name: process.env.SENDER_NAME
            },
            To: [{
              Email: to
            }],
            Subject: subject,
            HTMLPart: message
          }]
        };

        // Send email using the notification service instance
        await notificationService.sendEmail(mailData);
        
        res.json({
          success: true,
          message: 'Notification sent successfully'
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
        res.status(500).json({
          error: 'Failed to send notification',
          message: error.message
        });
      }
    });

    // Add error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    });

    // Add 404 handling
    app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`
      });
    });

    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
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