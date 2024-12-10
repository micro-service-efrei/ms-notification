# Service de Notification - Microservice

## 📚 Vue d'ensemble

Service de notification faisant partie d'une architecture microservices pour une bibliothèque. Ce service gère l'envoi de notifications par email lors d'opérations CRUD sur les livres.

## 🚀 Fonctionnalités

- Gestion des notifications par email via Mailjet
- Intégration avec RabbitMQ pour la communication événementielle
- Support de plusieurs types d'événements :
  - `book.created` : Notification lors de l'ajout d'un nouveau livre
  - `book.updated` : Notification lors de la mise à jour d'un livre
  - `book.deleted` : Notification lors de la suppression d'un livre
- Points de contrôle de santé (healthcheck) pour le monitoring
- Configuration via variables d'environnement
- Conteneurisation Docker

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- Docker et Docker Compose
- Compte Mailjet pour l'envoi d'emails
- RabbitMQ

## ⚙️ Installation

1. Cloner le repository :

git clone

2. Installer les dépendances :

npm install

3. Configurer les variables d'environnement :

cp .env.example .env

# Éditer .env avec vos propres valeurs

## 🔧 Configuration

Variables d'environnement requises :

PORT=3002
MAILJET_API_KEY=votre_clé_api
MAILJET_API_SECRET=votre_secret_api
SENDER_EMAIL=email_expediteur
SENDER_NAME=nom_expediteur
RABBITMQ_URL=amqp://rabbitmq:5672
RABBITMQ_QUEUE_NAME=book_events
NOTIFICATION_EMAIL=email_destinataire

## 🏃‍♂️ Lancement

Avec Docker :

- docker-compose up -d
  Sans Docker :
- npm start

## 🔍 Surveillance

Points de contrôle disponibles :

/health : État général du service
/health/rabbitmq : État de la connexion RabbitMQ

## 🏗️ Architecture

Le service utilise :

- Express.js pour les endpoints de santé
- RabbitMQ pour la communication événementielle
- Mailjet pour l'envoi d'emails
- Docker pour la conteneurisation
- Structure des événements :

```{
  "eventType": "book.created",
  "data": {
    "title": "Titre du livre",
    "author": "Auteur",
    "categories": ["Catégorie1", "Catégorie2"],
    "publishedDate": "2023-01-01",
    "description": "Description du livre"
  }
}
```

## 🔒 Sécurité

- Utilisation de variables d'environnement pour les informations sensibles
- Validation des événements avant traitement
- Gestion des erreurs et retry automatique pour RabbitMQ

## 📝 Logs
Le service fournit des logs détaillés pour :

- La connexion à RabbitMQ
- Le traitement des événements
- L'envoi d'emails
- Les contrôles de santé
