FROM node:24-slim

WORKDIR /app
RUN npm install -g bun

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
# `prisma generate` doesn't connect, but prisma.config.ts needs DATABASE_URL to be set.
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate \
  && bun run build

EXPOSE 3000

# Apply migrations, seed the sample data (idempotent), then start the API.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]
