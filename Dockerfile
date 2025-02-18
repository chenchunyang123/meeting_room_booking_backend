FROM node:20.18-alpine as build-stage

WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# production stage
FROM node:20.18-alpine as production-stage

COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install --legacy-peer-deps

EXPOSE 3001

CMD ["node", "/app/main.js"]