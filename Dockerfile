# Usa la última versión LTS de Node.js en su variante ligera (Alpine)
FROM node:lts-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Instala git para evitar errores en comandos que lo requieran
RUN apk add --no-cache git

# Instala el CLI de Angular globalmente
RUN npm install -g @angular/cli

# Expone el puerto por defecto de Angular
EXPOSE 4200

# Ejecuta el servidor de desarrollo exponiendo el host
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]