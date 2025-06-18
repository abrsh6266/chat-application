FROM node:20-alpine3.19 AS build
WORKDIR /app

# Add build dependencies with retry logic and alternative mirror
RUN echo "https://mirror.clarkson.edu/alpine/v3.19/main" > /etc/apk/repositories && \
    echo "https://mirror.clarkson.edu/alpine/v3.19/community" >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
        python3 \
        make \
        g++ \
        build-base \
        linux-headers

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 

FROM node:20-alpine3.19
WORKDIR /app

# Add runtime dependencies with retry logic and alternative mirror
RUN echo "https://mirror.clarkson.edu/alpine/v3.19/main" > /etc/apk/repositories && \
    echo "https://mirror.clarkson.edu/alpine/v3.19/community" >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
        python3 \
        make \
        g++ \
        build-base

COPY --from=build /app/package*.json ./
RUN npm install --omit=dev 
COPY --from=build /app/dist ./dist
RUN npm install -g pm2
COPY ecosystem.config.js .

# Handle .env file
RUN if [ -f .env.example ]; then cp .env.example .env; fi

EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]