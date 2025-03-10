FROM node:hydrogen-alpine AS build
WORKDIR /app

COPY . .

RUN echo "{}" >> ./data/config.json
RUN npm install
RUN npm run build

FROM oven/bun:alpine AS production
WORKDIR /app

COPY --from=build /app/server server
COPY --from=build /app/dist dist

ENV PORT=80
EXPOSE 80
ENTRYPOINT [ "bun", "server/entry.bun.js" ]