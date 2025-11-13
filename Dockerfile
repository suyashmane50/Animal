# Use official Node.js image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all backend source code (including views, routes, uploads, etc.)
COPY . .

# Expose the backend port
EXPOSE 3000

# Start the Node.js server
CMD ["node", "server.js"]
