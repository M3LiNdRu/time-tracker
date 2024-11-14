FROM node:alpine as base

WORKDIR /app

COPY package.json ./
COPY api.js ./

RUN npm install

CMD ["node", "./api.js"]