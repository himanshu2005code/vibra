# EventSphere

Premium movie & live event booking platform for India — movies, concerts, comedy, sports, and experiences with real-time seat selection, payments, and QR ticketing.

## Architecture

```
eventsphere/
├── apps/
│   ├── api/          # NestJS REST API + Socket.IO seat engine
│   └── web/          # Next.js 15 (App Router) + PWA
├── packages/
│   ├── database/     # Prisma schema & migrations
│   └── shared/       # Shared types & constants
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind, Framer Motion, Zustand, TanStack Query |
| Backend | NestJS, Prisma, PostgreSQL, Redis, Socket.IO, JWT |
| Payments | Razorpay, Stripe, UPI, Wallet |
| Search | Meilisearch (Postgres fallback) |
| DevOps | Docker, GitHub Actions, K8s-ready |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (for Postgres, Redis, Meilisearch)

### 1. Clone & install

```bash
cd eventsphere
cp .env.example .env
npm install
```

### 2. Start infrastructure

```bash
docker compose up postgres redis meilisearch -d
```

### 3. Database setup

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Run dev servers

```bash
npm run dev
```

- **Web:** http://localhost:3000
- **API:** http://localhost:4000
- **Swagger:** http://localhost:4000/api/docs

### Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Customer | user@eventsphere.in | Password123! |
| Organizer | organizer@eventsphere.in | Password123! |
| Admin | admin@eventsphere.in | Password123! |

OTP (dev): any phone → code `123456`

## Core flows

### Seat booking (WebSocket)

1. Client joins `showtime:{id}` room via Socket.IO `/seats`
2. `POST /bookings/lock` — atomic seat lock with Redis mutex + 5min TTL
3. Payment → seat status `BOOKED`
4. QR ticket generated with HMAC signature

### API modules

- `auth` — JWT, OTP, refresh tokens, RBAC
- `movies` / `events` — discovery & showtimes
- `bookings` — seat map, lock, confirm
- `payments` — Razorpay/Stripe webhooks
- `recommendations` — collaborative + content-based + trending
- `search` — global search with suggestions
- `admin` / `organizer` — dashboards

## Environment

See [.env.example](.env.example) for all variables.

## Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for AWS, CloudFront, Kubernetes, and monitoring setup.

## Testing

```bash
npm run test              # unit tests
npm run test:e2e -w @eventsphere/web  # Playwright (after install)
```

## License

Proprietary — EventSphere placeholder.
