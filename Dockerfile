FROM node:14-alpine AS builder

COPY . /build

WORKDIR /build

RUN yarn install && \
  yarn build

FROM node:14-alpine AS app

WORKDIR /app

COPY --from=builder /build/package.json ./package.json
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/.next ./.next
COPY --from=builder /build/public ./public

EXPOSE 3000
CMD ["yarn", "start"]
