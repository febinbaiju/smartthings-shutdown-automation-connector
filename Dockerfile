FROM node:20-slim

ENV NODE_OPTIONS="--no-network-family-autoselection --dns-result-order=ipv4first"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
