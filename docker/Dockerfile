FROM node:20-alpine

# Instalar certificados SSL y herramientas necesarias
RUN apk add --no-cache ca-certificates && update-ca-certificates

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
