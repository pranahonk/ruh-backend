FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Copy all scripts before installing dependencies
COPY scripts ./scripts/

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "src/index.js"]
