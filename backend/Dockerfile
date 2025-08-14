# Backend (Express)
FROM node:20-alpine

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source
COPY . .

ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
