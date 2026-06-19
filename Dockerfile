FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_OPTIONS="--no-network-family-autoselection --dns-result-order=ipv4first"

CMD ["npm", "start"]
