FROM node:20-alpine3.17
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
RUN npm ci && npm cache clean --force
COPY . /app
CMD node dispatchbot.js


