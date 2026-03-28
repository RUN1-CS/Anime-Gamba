# Node 20 Alpine for WS server
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY src/ ./src/

# Expose WS port (internal)
EXPOSE 3000

# Run Node WS server
CMD ["node", "src/index.js"]