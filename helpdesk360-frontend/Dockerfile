# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production - בלי SSR
RUN npm run build -- --configuration production --output-hashing=all

# Debug stage - בואו נראה מה נבנה
RUN ls -la dist/
RUN find dist/ -name "*.html" -type f

# Production stage
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy ALL dist content
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set permissions
RUN chmod -R 755 /usr/share/nginx/html

# Debug - show what we copied
RUN ls -la /usr/share/nginx/html/
RUN find /usr/share/nginx/html/ -name "*.html" -type f

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
