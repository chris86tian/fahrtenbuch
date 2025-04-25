FROM node:18-alpine as build

WORKDIR /app

# Kopiere package.json und installiere Abhängigkeiten
COPY package*.json ./
RUN npm ci

# Kopiere .env Datei für Build-Zeit-Umgebungsvariablen
COPY .env ./

# Kopiere den Rest des Codes
COPY . .

# Baue die App
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

# Erstelle ein Skript, um Umgebungsvariablen in die index.html einzufügen
RUN echo '#!/bin/sh\n\
sed -i "s|<!-- ENV_PLACEHOLDER -->|<script>\
window.ENV = {\
  VITE_SUPABASE_URL: \"${VITE_SUPABASE_URL}\",\
  VITE_SUPABASE_ANON_KEY: \"${VITE_SUPABASE_ANON_KEY}\"\
};\
</script>|g" /usr/share/nginx/html/index.html\n\
exec "$@"' > /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
