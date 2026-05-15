# EventSphere Deployment Guide

## AWS Production Architecture

```
Route 53 → CloudFront (CDN) → ALB
                              ├── ECS/EKS: web (Next.js)
                              ├── ECS/EKS: api (NestJS)
                              └── RDS PostgreSQL (Multi-AZ)
ElastiCache Redis | Meilisearch | S3 (media) | SES (email)
```

## Steps

### 1. Database

- Provision **RDS PostgreSQL 16** with read replica for analytics
- Run `npm run db:migrate:deploy` in CI/CD pipeline
- Enable automated backups & point-in-time recovery

### 2. Redis

- **ElastiCache Redis 7** cluster mode for seat locks & API cache
- Set `REDIS_URL` in API secrets

### 3. API (NestJS)

```bash
docker build -f apps/api/Dockerfile -t eventsphere-api .
# Push to ECR, deploy to ECS Fargate or EKS
```

- Min 2 tasks behind ALB
- WebSocket sticky sessions for Socket.IO
- Auto-scale on CPU > 70% (target: 100k concurrent via horizontal scaling)

### 4. Frontend (Next.js)

```bash
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.eventsphere.in \
  -t eventsphere-web .
```

- Deploy to Vercel **or** ECS with standalone output
- CloudFront cache static assets, `/_next/static/*`

### 5. Secrets (AWS Secrets Manager)

- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `RAZORPAY_KEY_*`, `STRIPE_*`
- `DATABASE_URL`, `REDIS_URL`

### 6. Monitoring

| Tool | Purpose |
|------|---------|
| Prometheus + Grafana | API latency, booking rate, seat lock contention |
| Sentry | Error tracking (set `SENTRY_DSN`) |
| CloudWatch | Logs & alarms |

### 7. CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on PR:
- Migrate → Build → Test → Docker build on `main`

Add deploy job with OIDC to AWS or use ArgoCD for GitOps.

## Performance targets

- API p95 < 200ms (Redis cache for home/movies)
- Lighthouse > 90 (SSR + image optimization)
- Seat lock: Redis mutex + DB transaction for double-booking prevention

## Security checklist

- [ ] Helmet headers (enabled)
- [ ] Rate limiting (Throttler 100/min)
- [ ] Razorpay webhook signature verification
- [ ] OTP throttling (60s per phone)
- [ ] PCI: never store card data; use provider tokens only
