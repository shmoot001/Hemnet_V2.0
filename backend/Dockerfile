FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src
COPY .env.example ./.env
CMD ["npm", "start"]
