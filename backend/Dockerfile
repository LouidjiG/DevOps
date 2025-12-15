# Étape de construction (Build)
FROM node:20 AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (y compris les devDependencies pour le build)
RUN npm ci

# Copier le reste du code source
COPY . .

# Construire l'application (TypeScript vers JavaScript)
RUN npm run build

# Étape de production
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour la production
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Copier les fichiers compilés depuis l'étape de build
COPY --from=builder /app/dist ./dist
# On copie aussi les fichiers nécessaires pour les migrations si besoin (à ajuster selon structure)
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src/seeders ./src/seeders 
# Note: Le code source TypeScript n'est pas nécessaire en prod, mais les scripts de migration le sont peut-être.

# Créer un utilisateur non-root pour la sécurité
USER node

# Exposer le port que l'application utilise
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/index.js"]
