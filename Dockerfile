FROM node:latest

WORKDIR /app

COPY ./build/ /app/
COPY ./node_modules /app/node_modules
ENTRYPOINT ["node", "/app/index.js"]