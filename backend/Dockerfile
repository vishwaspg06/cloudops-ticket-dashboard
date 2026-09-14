FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && npm ci --omit=dev \
    && npm rebuild sqlite3 --build-from-source \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY server.js ./

EXPOSE 5000

CMD ["node", "server.js"]