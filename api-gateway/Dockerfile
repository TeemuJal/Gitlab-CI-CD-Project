FROM node:10.22.1-alpine3.9

# Install curl
RUN apk update && apk add \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Install docker   
ENV DOCKER_CHANNEL stable
ENV DOCKER_VERSION 19.03.6
RUN curl -fsSL "https://download.docker.com/linux/static/${DOCKER_CHANNEL}/x86_64/docker-${DOCKER_VERSION}.tgz" \
  | tar -xzC /usr/local/bin --strip=1 docker/docker

WORKDIR /api-gateway
COPY . .
RUN npm install --silent
