# שלב 1: Build Angular app
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build --prod

# שלב 2: Serve with Nginx
FROM nginx:1.25-alpine

# מחיקת קונפיג ברירת מחדל
RUN rm -rf /etc/nginx/conf.d/default.conf

# העתקת הקונפיג החדש
COPY nginx.conf /etc/nginx/conf.d/default.conf

# העתקת קבצי Angular build לתיקיית ה־html של Nginx
COPY --from=build /app/dist/helpdesk360-frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
