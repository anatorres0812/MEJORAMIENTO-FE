# Construcción Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Servir Angular y reenviar /api al backend existente
FROM nginx:alpine
COPY nginx-TorresAna.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/gestion-academica-20973/browser/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
