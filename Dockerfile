FROM node:14.15-slim

ENV SOUTH_BOUND=-17.57727 WEST_BOUND=-66.376555 NORTH_BOUND=-17.276198 EAST_BOUND=-65.96397

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

ENTRYPOINT ["/usr/local/bin/npm", "start"]
