# Base image for building the frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all frontend files
COPY . .

# Build the React application
RUN npm run build

# Final lightweight image using Nginx to serve the static files
FROM nginx:alpine

# Copy custom Nginx configuration to handle React Router navigation
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
