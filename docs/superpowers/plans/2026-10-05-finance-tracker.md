# Finance Tracker (FinanceFlow) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi pelacak keuangan personal *mobile-first* (FinanceFlow) dengan backend Go, database PostgreSQL, dan antarmuka web bergaya iOS Liquid Glass (terverifikasi anti-slop).

**Architecture:** Arsitektur fullstack terdistribusi dengan clean architecture pada backend Go (`handler -> service -> repository`), database PostgreSQL dengan transaksi atomik untuk integritas saldo, serta frontend SPA (Vite + React + Tailwind) yang dikemas dalam Docker Compose.

**Tech Stack:** Go 1.23, PostgreSQL 16, pgx/v5, React 18 / Vite, Tailwind CSS, Docker & Docker Compose.

**Spec:** `docs/superpowers/specs/2026-10-05-finance-tracker-design.md`

## Global Constraints

- Semua nilai nominal uang disimpan dan dikalkulasi dalam bilangan bulat `BIGINT` (Rupiah integer penuh tanpa desimal).
- Mutasi saldo akun akibat transaksi wajib dieksekusi di dalam PostgreSQL DB Transaction (`BEGIN ... COMMIT`).
- Akun bertipe `PAYLATER` memiliki batas kredit (`credit_limit`), tanggal jatuh tempo (`due_day_of_month`), dan saldo negatif mencerminkan kewajiban/utang aktif.
- Antarmuka web mematuhi aturan `anti-slop` (tanpa gradien kosmik generik, glassmorphism dibatasi maksimal 2 elemen, dock navigasi 5-kolom simetris dengan tombol tambah di posisi 50% tengah).
- Seluruh commit Git wajib menggunakan standar Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`, `chore:`).

## Review Focus

1. **Integer Overflow & Negative Sign Handling:** Memastikan perhitungan pengurangan saldo pada pengeluaran Paylater tidak menghasilkan kesalahan konversi tanda minus.
2. **Transaction Reversal on Deletion:** Menghapus transaksi harus membalikkan saldo akun ke posisi semula secara tepat.
3. **Monthly Date Filtering:** Validasi format parameter bulan (`YYYY-MM`) dan penentuan batas tanggal awal/akhir bulan tanpa terpengaruh perbedaan zona waktu.
4. **Division by Zero:** Perhitungan persentase tabungan (*savings rate*) dan persentase kategori harus mengembalikan 0% jika total pemasukan atau total pengeluaran bernilai 0.
5. **Touch Target Accessibility:** Seluruh tombol navigasi dan aksi pada frontend harus memiliki area sentuh minimal 44x44px sesuai standar `antislop-human`.

---

### Task 1: Project Scaffolding & Database Migration Schema

**Files:**
- Create: `backend/go.mod`
- Create: `backend/migrations/000001_init_schema.up.sql`
- Create: `backend/migrations/000001_init_schema.down.sql`
- Create: `docker-compose.dev.yml`
- Create: `.gitignore`

**Interfaces:**
- Consumes: None
- Produces: Skema tabel `accounts`, `categories`, `transactions` di PostgreSQL.

- [ ] **Step 1: Write initial database migration SQL**
Buat `backend/migrations/000001_init_schema.up.sql` dengan skema tabel `accounts`, `categories`, `transactions`, foreign keys, dan index.

- [ ] **Step 2: Create docker-compose.dev.yml for PostgreSQL**
Konfigurasi service `postgres:16-alpine` dengan volume dan script inisialisasi migrasi database.

- [ ] **Step 3: Initialize Go module**
Jalankan `go mod init github.com/akhdan/finance-tracker/backend` dan tambahkan dependensi `github.com/jackc/pgx/v5` dan `github.com/go-chi/chi/v5`.

- [ ] **Step 4: Verify PostgreSQL startup & schema**
Jalankan `docker-compose -f docker-compose.dev.yml up -d` dan verifikasi tabel terbentuk dengan `docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d financetrack -c "\dt"`.

- [ ] **Step 5: Commit**
```bash
git add backend/go.mod backend/migrations/ docker-compose.dev.yml .gitignore
git commit -m "chore: initialize project scaffolding and postgres migrations"
```

---

### Task 2: Models & Account Service with Balance Calculation (TDD)

**Files:**
- Create: `backend/internal/model/account.go`
- Create: `backend/internal/repository/account_repository.go`
- Create: `backend/internal/service/account_service.go`
- Create: `backend/internal/service/account_service_test.go`

**Interfaces:**
- Consumes: PostgreSQL schema `accounts`
- Produces: `AccountService` interface (`CreateAccount`, `GetAccounts`, `UpdateBalance`, `CalculateTotals`)

- [ ] **Step 1: Write the failing test for AccountService**
Buat `account_service_test.go` yang menguji:
- Pembuatan akun baru (Bank, E-Wallet, Paylater).
- Perhitungan total saldo likuid (menjumlahkan saldo Bank + E-Wallet, tidak termasuk Paylater).
- Perhitungan total utang Paylater (menghitung total saldo negatif dari akun Paylater).

- [ ] **Step 2: Run test to verify it fails**
Jalankan: `cd backend && go test ./internal/service/...`
Expected: FAIL (types / methods undefined)

- [ ] **Step 3: Implement Account models and AccountService**
Implementasikan struct `Account` di `account.go`, interface `AccountRepository` di `account_repository.go`, dan logika kalkulasi di `account_service.go`.

- [ ] **Step 4: Run test to verify it passes**
Jalankan: `cd backend && go test -v ./internal/service/... -run TestAccount`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add backend/internal/model/account.go backend/internal/repository/account_repository.go backend/internal/service/
git commit -m "feat(backend): implement account model and service with TDD"
```

---

### Task 3: Transaction Service with Atomic Balance Updates (TDD)

**Files:**
- Create: `backend/internal/model/transaction.go`
- Create: `backend/internal/repository/transaction_repository.go`
- Create: `backend/internal/service/transaction_service.go`
- Create: `backend/internal/service/transaction_service_test.go`

**Interfaces:**
- Consumes: `AccountService`, `AccountRepository`
- Produces: `TransactionService` interface (`CreateTransaction`, `ListTransactions`, `DeleteTransaction`)

- [ ] **Step 1: Write the failing test for TransactionService**
Buat `transaction_service_test.go` yang menguji:
- Pencatatan transaksi `EXPENSE` mengurangi `current_balance` akun terkait.
- Pencatatan transaksi `INCOME` menambah `current_balance` akun terkait.
- Penghapusan transaksi membalikkan saldo (`reversal`) secara akurat.
- Penolakan transaksi dengan nominal $\le$ 0.

- [ ] **Step 2: Run test to verify it fails**
Jalankan: `cd backend && go test -v ./internal/service/... -run TestTransaction`
Expected: FAIL

- [ ] **Step 3: Implement Transaction models and TransactionService**
Implementasikan struct `Transaction` dan `TransactionInput`, serta logika mutasi saldo pada `transaction_service.go`.

- [ ] **Step 4: Run test to verify it passes**
Jalankan: `cd backend && go test -v ./internal/service/... -run TestTransaction`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add backend/internal/model/transaction.go backend/internal/repository/transaction_repository.go backend/internal/service/transaction*
git commit -m "feat(backend): implement transaction service with balance mutation"
```

---

### Task 4: Monthly Summary & Category Breakdown Service (TDD)

**Files:**
- Create: `backend/internal/model/summary.go`
- Create: `backend/internal/service/summary_service.go`
- Create: `backend/internal/service/summary_service_test.go`

**Interfaces:**
- Consumes: `TransactionRepository`, `AccountRepository`
- Produces: `SummaryService` interface (`GetMonthlySummary(month string) (*MonthlySummary, error)`)

- [ ] **Step 1: Write the failing test for SummaryService**
Buat `summary_service_test.go` yang menguji:
- Perhitungan `TotalIncome`, `TotalExpense`, dan `NetCashflow`.
- Perhitungan `SavingsRatePercentage` (menghindari division by zero jika income = 0).
- Agregasi pengeluaran per kategori beserta persentasenya.
- Akumulasi tagihan Paylater yang jatuh tempo pada bulan tersebut.

- [ ] **Step 2: Run test to verify it fails**
Jalankan: `cd backend && go test -v ./internal/service/... -run TestSummary`
Expected: FAIL

- [ ] **Step 3: Implement Summary models and SummaryService**
Implementasikan struct `MonthlySummary`, `CategoryBreakdown`, dan kalkulasi agregasi di `summary_service.go`.

- [ ] **Step 4: Run test to verify it passes**
Jalankan: `cd backend && go test -v ./internal/service/... -run TestSummary`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add backend/internal/model/summary.go backend/internal/service/summary*
git commit -m "feat(backend): implement monthly summary calculation service"
```

---

### Task 5: HTTP Handlers & Router Setup (TDD)

**Files:**
- Create: `backend/internal/handler/account_handler.go`
- Create: `backend/internal/handler/transaction_handler.go`
- Create: `backend/internal/handler/summary_handler.go`
- Create: `backend/internal/handler/router.go`
- Create: `backend/internal/handler/handler_test.go`

**Interfaces:**
- Consumes: `AccountService`, `TransactionService`, `SummaryService`
- Produces: `http.Handler` routing `/api/accounts`, `/api/transactions`, `/api/summary`

- [ ] **Step 1: Write the failing tests for API endpoints**
Buat `handler_test.go` menggunakan `httptest.NewServer` / `httptest.NewRecorder` untuk menguji:
- `GET /api/accounts` mengembalikan JSON 200 OK.
- `POST /api/transactions` memproses request valid (201 Created) dan menolak nominal negatif (400 Bad Request).
- `GET /api/summary?month=2026-10` mengembalikan rekap bulanan yang valid.

- [ ] **Step 2: Run test to verify it fails**
Jalankan: `cd backend && go test -v ./internal/handler/...`
Expected: FAIL

- [ ] **Step 3: Implement Handlers & chi Router**
Implementasikan handler fungsi, parser JSON payload, respon helper JSON, dan routing di `router.go`.

- [ ] **Step 4: Run test to verify it passes**
Jalankan: `cd backend && go test -v ./internal/handler/...`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add backend/internal/handler/
git commit -m "feat(backend): implement REST API handlers and routing"
```

---

### Task 6: PostgreSQL Database Repositories & Server Entrypoint

**Files:**
- Create: `backend/internal/repository/postgres_account_repo.go`
- Create: `backend/internal/repository/postgres_transaction_repo.go`
- Create: `backend/internal/repository/postgres_summary_repo.go`
- Create: `backend/cmd/server/main.go`
- Create: `backend/Dockerfile`

**Interfaces:**
- Consumes: PostgreSQL connection pool (`*pgxpool.Pool`)
- Produces: Running HTTP Server on `:8080`

- [ ] **Step 1: Implement Postgres Repositories with SQL transactions**
Tulis implementasi query database untuk akun, mutasi transaksi atomik, dan query agregasi SQL bulanan.

- [ ] **Step 2: Implement cmd/server/main.go**
Koneksikan pgx connection pool dari environment variable `DATABASE_URL`, jalankan migrasi otomatis, daftarkan router, dan siapkan graceful shutdown.

- [ ] **Step 3: Build backend binary & test integration**
Jalankan `cd backend && go build -o bin/server cmd/server/main.go` dan verifikasi binary berhasil terkompilasi tanpa error.

- [ ] **Step 4: Write Backend Dockerfile**
Buat multi-stage Dockerfile berbasis `golang:1.23-alpine` (builder) dan `alpine:3.20` (runner).

- [ ] **Step 5: Commit**
```bash
git add backend/internal/repository/postgres* backend/cmd/ backend/Dockerfile
git commit -m "feat(backend): implement postgres repositories and server entrypoint"
```

---

### Task 7: Mobile-First Frontend Scaffolding & iOS Liquid Glass Components

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/src/index.css`
- Create: `frontend/src/components/DynamicIsland.tsx`
- Create: `frontend/src/components/HeroBalanceCard.tsx`
- Create: `frontend/src/components/BottomNavigationDock.tsx`

**Interfaces:**
- Consumes: Tailwind CSS custom tokens (iOS Slate, Apple Green, Coral Red, Amber)
- Produces: Komponen antarmuka mobile iOS Liquid Glass (teruji anti-slop).

- [ ] **Step 1: Initialize Vite React TypeScript frontend**
Inisialisasi aplikasi frontend di folder `frontend/` dengan Tailwind CSS dan Lucide Icons.

- [ ] **Step 2: Configure iOS Liquid Glass theme tokens in Tailwind**
Atur tema warna `#0f1015`, surface `#16171d`, dan utility glassmorphism terkontrol (`backdrop-blur-md`).

- [ ] **Step 3: Implement Symmetrical 5-Column BottomNavigationDock**
Tulis komponen dock navigasi bawah dengan layout grid 5 kolom presisi (`Mutasi`, `Budget`, `(+)`, `Rekap`, `Akun`).

- [ ] **Step 4: Implement HeroBalanceCard & DynamicIsland**
Tulis komponen ringkasan saldo likuid dengan format angka tabular dan indikator pemasukan/pengeluaran solid.

- [ ] **Step 5: Verify build & visual check**
Jalankan `npm run build` di folder `frontend/` untuk memastikan tidak ada kesalahan kompilasi TypeScript atau CSS.

- [ ] **Step 6: Commit**
```bash
git add frontend/
git commit -m "feat(frontend): initialize mobile-first react frontend with ios liquid glass ui"
```

---

### Task 8: Frontend State Management & API Integration

**Files:**
- Create: `frontend/src/services/api.ts`
- Create: `frontend/src/types/finance.ts`
- Create: `frontend/src/components/TransactionList.tsx`
- Create: `frontend/src/components/AccountCarousel.tsx`
- Create: `frontend/src/components/QuickAddModal.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: REST API backend (`/api/accounts`, `/api/transactions`, `/api/summary`)
- Produces: Alur kerja penuh pencatatan transaksi dan rekapitulasi bulanan pada tampilan mobile.

- [ ] **Step 1: Define TypeScript interfaces & API client**
Tulis tipe data TypeScript untuk `Account`, `Transaction`, `MonthlySummary`, dan helper `fetch` client ke backend API.

- [ ] **Step 2: Implement QuickAddModal (+) Form**
Buat modal interaktif untuk memilih tipe (Pemasukan/Pengeluaran), memasukkan nominal, memilih akun (Bank/E-Wallet/Paylater), memilih kategori, dan mengirim transaksi ke backend.

- [ ] **Step 3: Implement TransactionList & AccountCarousel**
Tampilkan riwayat mutasi dengan badge akun dan visualisasi saldo akun/paylater.

- [ ] **Step 4: Integrate Monthly Summary View**
Hubungkan view Rekap dengan API `/api/summary` untuk menampilkan breakdown kategori dan rasio tabungan.

- [ ] **Step 5: Verify build**
Jalankan `cd frontend && npm run build` untuk memvalidasi kelengkapan tipe data.

- [ ] **Step 6: Commit**
```bash
git add frontend/src/
git commit -m "feat(frontend): integrate state management, quick add modal, and api client"
```

---

### Task 9: Production Docker Compose Orchestration & Verification

**Files:**
- Create: `frontend/Dockerfile`
- Create: `frontend/nginx.conf`
- Create: `docker-compose.yml`
- Create: `README.md`

**Interfaces:**
- Consumes: Backend Dockerfile, Frontend Dockerfile, PostgreSQL
- Produces: Single-command deployment (`docker compose up -d`)

- [ ] **Step 1: Write Frontend Dockerfile & Nginx config**
Siapkan multi-stage build untuk React SPA yang di-serve oleh Nginx Alpine dengan proxy passthrough ke `/api/`.

- [ ] **Step 2: Write top-level docker-compose.yml**
Gabungkan tiga service: `postgres` (port 5432), `backend` (Go API port 8080), dan `frontend` (Nginx web port 3000).

- [ ] **Step 3: Start full stack and run End-to-End verification**
Jalankan `docker compose up -d --build`.
Verifikasi endpoint backend `curl -s http://localhost:8080/api/accounts` dan akses frontend di `http://localhost:3000`.

- [ ] **Step 4: Write documentation in README.md**
Dokumentasikan cara menjalankan aplikasi, arsitektur sistem, dan panduan API.

- [ ] **Step 5: Commit**
```bash
git add docker-compose.yml frontend/Dockerfile frontend/nginx.conf README.md
git commit -m "feat(deploy): orchestrate fullstack containerization and complete documentation"
```
