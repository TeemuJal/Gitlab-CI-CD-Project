FROM node:10.22.1-alpine3.9
WORKDIR /original
COPY . .
RUN chmod +x utils/wait-for-it.sh
RUN apk update && apk add bash coreutils
RUN npm install --silent
