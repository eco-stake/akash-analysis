FROM node:16-alpine

# Create app directory

#RUN mkdir app
WORKDIR /app

RUN apk --no-cache --virtual build-dependencies add python3 make g++

COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 3080
CMD [ "node", "/app/dist/server.js" ]