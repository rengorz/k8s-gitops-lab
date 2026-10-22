FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine
ARG APP_VERSION=dev
ENV NODE_ENV=production PORT=3000 APP_VERSION=$APP_VERSION
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
# Numeric UID of the "node" user so kubelet can verify runAsNonRoot.
USER 1000
EXPOSE 3000
CMD ["node", "src/server.js"]
