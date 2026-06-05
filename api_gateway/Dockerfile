# 1. On part de l'image officielle Nginx (version ultra-légère alpine)
FROM nginx:alpine

# 2. On supprime la configuration d'usine par défaut de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# 3. On copie notre fichier nginx.conf personnalisé à l'endroit prévu par Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# 4. On expose le port 80 (l'unique porte d'entrée publique de notre projet)
EXPOSE 80

# Nginx démarre automatiquement en arrière-plan, pas besoin de spécifier de CMD complexe ici