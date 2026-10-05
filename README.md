# FinanceFlow — Personal Finance Tracker

A lightweight, mobile-first personal finance tracking application designed with **iOS Liquid Glass aesthetics** and built for DevOps engineers.

![CI](https://github.com/FrostLynn/finance-tracker/actions/workflows/ci.yml/badge.svg)

---

## Architecture Overview

```
                                 +-----------------------+
                                 |   Mobile / Web Client |
                                 |  (React 18 + Vite SPA)|
                                 +-----------+-----------+
                                             |
                                             | HTTP :3000 (Nginx Reverse Proxy)
                                             v
+------------------------+       +-----------+-----------+
|    PostgreSQL 16 DB    | <---> |     Go REST Backend   |
| (Persistent Volume)    | :5432 |    (Chi Router + pgx) | :8085
+------------------------+       +-----------------------+
```

- **Separated Database Architecture:** PostgreSQL runs in its own dedicated Docker Compose environment (`deploy/docker-compose.db.yml`) to ensure persistent data and zero accidental downtime during application redeployments.
- **Go Backend:** High-performance REST API with atomic database transactions (`BEGIN ... COMMIT`) to guarantee balance mutation integrity.
- **Mobile-First React Frontend:** Styled using Tailwind CSS following the iOS Human Interface Guidelines and certified under strict `anti-slop` rules (high-contrast text, tabular numerals, 5-column symmetrical navigation dock).
- **Automated CI/CD:** GitHub Actions workflow (`.github/workflows/ci.yml`) runs unit tests, linter (`go vet`), and builds production static bundles on every push and pull request.

---

## Quick Start (DevOps / Local Setup)

### 1. Start the PostgreSQL Database
```bash
docker compose -f deploy/docker-compose.db.yml up -d
```
The database will automatically initialize tables and seed default categories and sample accounts.

### 2. Start the Application (Backend & Frontend)
```bash
docker compose -f deploy/docker-compose.app.yml up -d --build
```

### 3. Access the Application
- **Frontend Web UI:** Open [http://localhost:3000](http://localhost:3000)
- **Backend Health Check:** [http://localhost:8085/health](http://localhost:8085/health)
- **API Documentation / Summary:** `GET /api/summary?month=YYYY-MM`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server healthcheck |
| `GET` | `/api/accounts` | List accounts, balances, and liquid/debt totals |
| `POST` | `/api/accounts` | Create new account (Bank, E-Wallet, Paylater, Cash) |
| `GET` | `/api/categories` | List transaction categories |
| `GET` | `/api/transactions?month=YYYY-MM` | List transactions with monthly filter |
| `POST` | `/api/transactions` | Record transaction & mutate balance atomically |
| `DELETE` | `/api/transactions/:id` | Delete transaction & rollback balance |
| `GET` | `/api/summary?month=YYYY-MM` | Monthly cashflow, savings rate, & category breakdown |

---

## Running Tests Locally

### Backend Unit & Service Tests
```bash
cd backend
go test -v -race ./...
```

### Frontend Build
```bash
cd frontend
npm ci
npm run build
```

---

## License
MIT License. Built by Akhdan & Raphael.
