FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

# Kopiere die gebaute App
COPY --from=build /app/dist /usr/share/nginx/html
# Kopiere die nginx-Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Erstelle eine einfache Healthcheck-Seite
RUN echo "OK" > /usr/share/nginx/html/health

# Erstelle eine Fehlerseite
RUN echo "<html><body><h1>Error</h1><p>The application encountered an error. Please try again later.</p></body></html>" > /usr/share/nginx/html/50x.html

EXPOSE 80

# Füge ein Startup-Skript hinzu
COPY --from=build /app/docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
