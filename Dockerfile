FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --include=optional
COPY apps/web apps/web
RUN npm run build

FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --omit=dev --workspace=@makerlink/api --include-workspace-root
COPY apps/api/src apps/api/src
COPY docs/database/001-create-makerlink-schema.sql docs/database/
COPY --from=build /app/apps/web/dist apps/web/dist
USER node
CMD ["npm", "start"]
