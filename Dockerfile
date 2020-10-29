FROM node:14.15-slim

WORKDIR /app/

ADD ./src/ src/
ADD ./index.js index.js
ADD ./package-lock.json package-lock.json
ADD ./package.json package.json
RUN npm i

WORKDIR /app/docker/
ADD ./docker/ ./
RUN npm i
RUN mkdir out

# ENTRYPOINT ["/usr/local/bin/npm", "start"]
