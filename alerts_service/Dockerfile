# 1. On part d'une image Linux officielle très légère contenant Node.js (version 20)
FROM node:23-alpine

# 2. AJOUT SÉCURITÉ : On installe openssl et libc6-compat requis par le moteur de Prisma
RUN apk add --no-cache openssl libc6-compat

# 2. On définit le dossier de travail À L'INTÉRIEUR du conteneur
WORKDIR /app

# 3. On copie d'abord les fichiers qui listent les dépendances (package.json)
# On fait cela en premier pour optimiser le cache de Docker
COPY package*.json ./

# 4. On installe les dépendances listées dans le package.json
RUN npm install

# 5. On copie le dossier de configuration Prisma
COPY prisma ./prisma/

# 6. ÉTAPE ESSENTIELLE : On demande à Prisma de générer sa boîte à outils JavaScript
RUN npx prisma generate

# 7. On copie tout le reste du code source (src, etc.) du projet dans le conteneur
COPY . .

# 8. On indique le port que ce conteneur va utiliser en interne
EXPOSE 8001

# 9. La commande qui s'exécutera AUTOMATIQUEMENT quand le conteneur démarrera
CMD ["npm", "start"]