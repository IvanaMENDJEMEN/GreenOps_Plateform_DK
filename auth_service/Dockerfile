FROM node:20-alpine
#  AJOUT SÉCURITÉ : On installe openssl et libc6-compat requis par le moteur de Prisma
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
EXPOSE 8003
CMD ["npm", "start"]