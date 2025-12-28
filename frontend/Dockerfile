# Étape 1 : Construction (Build)
FROM node:20 AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci

# Copie du code source
COPY . .

# Construction de l'application (génère le dossier dist)
RUN npm run build

# Étape 2 : Serveur Web (Nginx)
FROM nginx:alpine

# Copie de la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers statiques générés par le build vers le dossier de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposition du port 80
EXPOSE 80

# Démarrage de Nginx (c'est la commande par défaut de l'image nginx, mais on peut l'expliciter)
CMD ["nginx", "-g", "daemon off;"]
