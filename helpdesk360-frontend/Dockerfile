# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build -- --configuration production

# Production stage
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built app (שים לב לנתיב!)
COPY --from=build /app/dist/helpdesk360-frontend/browser/ /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Optional: Copy env files
COPY --from=build /app/src/environments/ /usr/share/nginx/html/environments/

EXPOSE 80

COPY --from=build /app/dist/helpdesk360-frontend/browser/ /usr/share/nginx/html/
RUN chmod -R 755 /usr/share/nginx/html


CMD ["nginx", "-g", "daemon off;"]
