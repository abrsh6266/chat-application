FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build 

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev 
COPY --from=build /app/dist ./dist
RUN npm install -g pm2
COPY ecosystem.config.js .
COPY .env.example ./.env

EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]