FROM node:20-alpine AS build
WORKDIR /app

# Add build dependencies
RUN apk update && apk add --no-cache \
    python3 \
    make \
    g++ \
    build-base \
    linux-headers

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 

FROM node:20-alpine
WORKDIR /app

# Add runtime dependencies
RUN apk update && apk add --no-cache \
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