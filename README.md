# Alyson AI Backend

Production-grade backend for **Alyson AI — Local News Intelligence & Content Automation Platform**.

## Stack

- Node.js + TypeScript + Express
- PostgreSQL + Prisma ORM
- Redis + BullMQ (queues/workers)
- JWT Auth + RBAC + Zod validation
- AI orchestration (OpenAI, Claude, DeepSeek) with fallback routing
- Scraping (RSS, Reddit JSON, BBC/Reuters/web extraction via Cheerio/Puppeteer)
- Email campaigns (Salesforce Marketing Cloud + GMass integrations)
- Swagger/OpenAPI docs

## Modules

- Auth
- Cities
- Articles CMS
- AI generation + confidence scoring
- Moderation workflows
- Ranking engine (CTR/clicks/engagement/revenue/freshness)
- Analytics/event tracking
- Integrations management (encrypted secrets)
- Subscribers
- Email campaigns/newsletters
- Scraping management
- Settings
- Queue jobs/workers

## Project Structure

```txt
src/
  api/routes/
  controllers/
  services/
  repositories/
  middleware/
  jobs/
  validators/
  utils/
  config/
  docs/
prisma/
```

## Setup

1. Copy env:
   ```bash
   cp .env.example .env
   ```
2. Install deps:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Run migrations:
   ```bash
   npm run prisma:migrate
   ```
5. Seed data:
   ```bash
   npm run seed
   ```
6. Start:
   ```bash
   npm run dev
   ```

Swagger UI: `http://localhost:8080/docs`

## Docker

```bash
docker compose up --build
```

## API Response Contract

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": "string",
  "code": "string"
}
```
