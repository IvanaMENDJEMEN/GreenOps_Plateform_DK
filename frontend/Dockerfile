# --- ÉTAPE 1 : COMPILATION ---
FROM node:23-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Cette commande crée un dossier "dist" contenant le site web optimisé et nettoyé
RUN npm run build

# --- ÉTAPE 2 : PRODUCTION ---
FROM nginx:alpine
# On copie les fichiers compilés de l'étape précédente dans le dossier public de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
