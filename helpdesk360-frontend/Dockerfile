# Stage 1: Build the Angular application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --quiet

# Copy application source
COPY . .

# Build the application for production
RUN npm run build -- --configuration=production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

COPY . .
# Copy custom nginx configuration
# COPY nginx.conf /etc/nginx/nginx.conf

# # Copy built application from build stage
# COPY --from=build /app/dist/helpdesk360-frontend/browser /usr/share/nginx/html

# # Copy env.js template and startup script
# COPY env.js.template /usr/share/nginx/html/assets/env.js.template
# COPY docker-entrypoint.sh /docker-entrypoint.sh

# Make startup script executable
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Start nginx with environment variable substitution
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
