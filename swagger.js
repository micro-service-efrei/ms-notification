
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Service de Notification',
      version: '1.0.0',
      description: 'API de gestion des notifications pour la bibliothèque',
      contact: {
        name: 'Support API',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Serveur de développement'
      }
    ],
    tags: [
      {
        name: 'Notifications',
        description: 'Endpoints de gestion des notifications'
      },
      {
        name: 'Santé',
        description: 'Endpoints de surveillance de santé'
      }
    ],
    paths: {
      '/notify': {
        post: {
          tags: ['Notifications'],
          summary: 'Envoyer une notification',
          description: 'Envoie une notification par email',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/NotificationRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Notification envoyée avec succès',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SuccessResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Requête invalide',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Erreur serveur',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/health': {
        get: {
          tags: ['Santé'],
          summary: 'Vérifier la santé du service',
          description: 'Vérifie l\'état général du service de notification',
          responses: {
            '200': {
              description: 'Service en bon état',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/HealthResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/health/rabbitmq': {
        get: {
          tags: ['Santé'],
          summary: 'Vérifier la connexion RabbitMQ',
          description: 'Vérifie l\'état de la connexion avec RabbitMQ',
          responses: {
            '200': {
              description: 'Connexion RabbitMQ établie',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/RabbitMQHealthResponse'
                  }
                }
              }
            },
            '503': {
              description: 'Problème de connexion RabbitMQ',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/RabbitMQErrorResponse'
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        NotificationRequest: {
          type: 'object',
          required: ['to', 'subject', 'message', 'type'],
          properties: {
            to: {
              type: 'string',
              format: 'email',
              description: 'Adresse email du destinataire'
            },
            subject: {
              type: 'string',
              description: 'Sujet de la notification'
            },
            message: {
              type: 'string',
              description: 'Contenu HTML du message'
            },
            type: {
              type: 'string',
              enum: ['book.created', 'book.updated', 'book.deleted'],
              description: 'Type de notification'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Notification sent successfully'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Failed to send notification'
            },
            message: {
              type: 'string',
              example: 'Error details'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            }
          }
        },
        RabbitMQHealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            message: {
              type: 'string',
              example: 'RabbitMQ connection is healthy'
            }
          }
        },
        RabbitMQErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'ERROR'
            },
            message: {
              type: 'string',
              example: 'RabbitMQ connection is not established'
            }
          }
        }
      }
    }
  },
  apis: ['./server.js', './health.js']
};

const specs = swaggerJsdoc(options);
module.exports = specs;