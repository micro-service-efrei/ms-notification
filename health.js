const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  console.log('Health check endpoint called');
  res.status(200).json({ status: 'OK' });
});

app.get('/health/rabbitmq', async (req, res) => {
  try {
    const messageQueue = req.app.get('messageQueue');
    if (!messageQueue || !messageQueue.isConnected()) {
      return res.status(503).json({ 
        status: 'ERROR',
        message: 'RabbitMQ connection is not established'
      });
    }
    res.status(200).json({ 
      status: 'OK',
      message: 'RabbitMQ connection is healthy'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR',
      message: error.message 
    });
  }
});

module.exports = app;