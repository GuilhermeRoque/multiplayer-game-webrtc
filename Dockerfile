FROM node:16-buster-slim
WORKDIR /root
COPY package*.json ./
COPY ./cliente ./cliente
COPY ./views ./views
COPY ./index.js ./index.js
RUN npm ci
EXPOSE 3000
CMD ["node", "index.js"]