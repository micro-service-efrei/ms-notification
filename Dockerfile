FROM node:18-alpine

WORKDIR /usr/src/app

# Ajout des outils nécessaires
RUN apk add --no-cache curl netcat-openbsd

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3002

# Modification de la commande de démarrage
CMD ["node", "server.js"]