FROM oven/bun:debian AS build
WORKDIR /app

COPY . .

RUN bun install
RUN bun run build

FROM oven/bun:alpine AS production
WORKDIR /app

RUN mkdir data && echo "{}" >> ./data/config.json
COPY --from=build /app/server server
COPY --from=build /app/dist dist

ENV PORT=80
EXPOSE 80
CMD ["bun", "server/entry.bun.js"]