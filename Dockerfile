FROM node:14.15-slim

WORKDIR /app/osm-public-transport-export/

ADD ./src/ src/
ADD ./index.js index.js
ADD ./package-lock.json package-lock.json
ADD ./package.json package.json

RUN npm i

ADD ./start_with_env.js start_with_env.js
RUN mkdir out

CMD ["/usr/local/bin/npm", "start"]
