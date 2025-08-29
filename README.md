# Life Link – Backend Starter (Node.js + Express + Prisma)

A clean API to store **Donors**, **Hospitals**, and run **matching** by blood type + distance + recency.

## Quick start

### 1) Install
```bash
npm i
cp .env.example .env
# edit DATABASE_URL and JWT_SECRET
```

### 2) Run Postgres
Use your own Postgres or start one quickly:
```bash
docker run -d --name lifelink-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=lifelink -p 5432:5432 postgres:16
```

### 3) Prisma migrate & generate
```bash
npm run prisma:migrate
npm run prisma:generate
```

### 4) Dev server
```bash
npm run dev
# GET http://localhost:3000/v1/health -> { ok: true }
```

> **Auth**: endpoints expect a `Bearer <JWT>` with payload `{ id, role }`. Plug your auth later; for now you can craft a token with any JWT tool for testing.

## Endpoints (excerpt)

- `POST /v1/donors` — create donor profile (role: DONOR/ADMIN)
- `GET /v1/donors/me` — get donor profile
- `POST /v1/hospitals` — create hospital (role: HOSPITAL/ADMIN)
- `GET /v1/hospitals/me` — get hospital profile
- `POST /v1/requests` — hospital creates a request
- `GET /v1/requests/:id/matches` — get top donor matches

### Sample JWT (testing only)
Header: `{ "alg": "HS256", "typ": "JWT" }`  
Payload examples:
```json
{ "id":"<uuid>", "role":"DONOR" }
{ "id":"<uuid>", "role":"HOSPITAL" }
{ "id":"<uuid>", "role":"ADMIN" }
```
Sign with `JWT_SECRET` from your `.env`.

## Matching logic
- **Compatibility**: blood group compatibility map
- **Distance**: Haversine between donor and hospital (km)
- **Recency**: last donation date penalizes very recent donors
- **Score**: `100 - distanceKm - recencyDays/9`, filtered by `radiusKm`

Switch to **PostGIS** later for faster large-radius queries.

## Production notes
- Add real auth (password/OTP), input validation (zod already included)
- Add rate limits, CORS allowlist, request tracing
- Mask PII, consent for notifications, audit logs
- Backups & encryption at rest

---

MIT © You
