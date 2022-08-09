FROM node:16-alpine

# Create app directory

#RUN mkdir app
WORKDIR /app

# Bundle app source
COPY . .

RUN apk --no-cache --virtual build-dependencies add python3 make g++

RUN npm ci
RUN npm run build

EXPOSE 3080
CMD [ "node", "/app/dist/server.js" ]