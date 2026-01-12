FROM node:23-alpine AS build

WORKDIR /app

# Copier package.json et installer deps
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build


FROM nginx:alpine AS production

RUN apk add --no-cache openssl

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir /certs && chmod 777 /certs

RUN openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /certs/key.pem \
    -out /certs/certs.pem \
    -subj "/C=FR/ST=./L=./O=./OU=./CN=localhost"

RUN chmod 777 /certs/key.pem /certs/certs.pem

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

