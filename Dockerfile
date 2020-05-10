FROM node:latest

WORKDIR /app

# Create directory for database file
CMD [ "mkdir", "/db" ]

# Copy project files
COPY ./build/ /app/
COPY ./node_modules /app/node_modules

ENTRYPOINT ["node", "/app/index.js"]