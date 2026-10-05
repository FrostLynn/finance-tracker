# Finance Tracker (FinanceFlow) Design Specification

**Date:** 2026-10-05  
**Author:** Akhdan & Raphael  
**Status:** Approved for Implementation  
**Location:** `/home/akhdan/Projects/finance-tracker`

---

## 1. Overview & Goal

FinanceFlow adalah aplikasi pelacak keuangan personal berbasis *mobile-first* yang berfokus pada kemudahan pencatatan transaksi kas masuk/keluar, pengelolaan multi-sumber dana (rekening bank, e-wallet, dan instrumen utang/Paylater), serta penyajian rekapitulasi bulanan yang akurat dan bebas dari distorsi data.

### Success Criteria:
1. Pencatatan transaksi selesai dalam hitungan detik dengan antarmuka mobile yang ergonomis.
2. Pelacakan saldo likuid terpisah secara tegas dari tagihan kewajiban Paylater.
3. Rekap bulanan menghitung arus kas bersih (*net cashflow*) dan distribusi kategori tanpa kesalahan pembulatan angka desimal.
4. Desain antarmuka mematuhi estetika iOS Liquid Glass dengan penegakan disiplin *anti-slop* (keterbacaan kontras tinggi, bebas glow/gradien generik).

---

## 2. Technology Stack & Infrastructure

- **Database:** PostgreSQL 16
  - Integritas data ACID, foreign keys, dan transaksi atomik.
  - Tipe data nominal moneter menggunakan `BIGINT` (Rupiah integer penuh tanpa desimal).
- **Backend:** Go 1.22+
  - Router/HTTP: Go standard library `net/http` atau lightweight router (Go Chi).
  - Driver DB: `pgx/v5` dengan connection pooling.
  - Arsitektur berlapis: `Handler -> Service -> Repository`.
- **Frontend:** Vite + React + Tailwind CSS
  - Desain *mobile-first viewport* (390px - 430px base).
  - Materialitas iOS Liquid Glass terverifikasi *anti-slop*.
  - Simetris 5-kolom dock navigasi bawah dengan central Quick Add (+) button.
- **DevOps & Containerization:**
  - Multi-stage `Dockerfile` untuk backend Go dan frontend static bundle.
  - `docker-compose.yml` untuk orkestrasi PostgreSQL, Backend API, dan Frontend Nginx reverse proxy.
- **Version Control:** Git lokal dengan standar Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`, `chore:`).

---

## 3. Database Schema

### Table: `accounts`
Menyimpan sumber dana likuid maupun instrumen utang kredit.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | ID unik akun |
| `name` | `VARCHAR(100)` | NOT NULL | Nama akun (misal: "BCA Tabungan", "SPayLater") |
| `type` | `VARCHAR(20)` | NOT NULL | ENUM/Check: `'BANK'`, `'EWALLET'`, `'PAYLATER'`, `'CASH'` |
| `current_balance`| `BIGINT` | NOT NULL, DEFAULT 0 | Saldo aktif (negatif untuk utang Paylater) |
| `credit_limit` | `BIGINT` | DEFAULT 0 | Batas kredit (khusus tipe `PAYLATER`) |
| `due_day_of_month`| `INT` | CHECK (`due_day_of_month` BETWEEN 1 AND 31) | Tanggal jatuh tempo bulanan Paylater |
| `created_at` | `TIMESTAMPTZ`| NOT NULL, DEFAULT `NOW()` | Waktu pembuatan |
| `updated_at` | `TIMESTAMPTZ`| NOT NULL, DEFAULT `NOW()` | Waktu modifikasi |

### Table: `categories`
Menyimpan pos kategori pengeluaran dan pemasukan.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | ID unik kategori |
| `name` | `VARCHAR(100)` | NOT NULL | Nama kategori (misal: "Makan & Minum", "Gaji") |
| `type` | `VARCHAR(10)` | NOT NULL | ENUM/Check: `'EXPENSE'`, `'INCOME'` |
| `icon` | `VARCHAR(50)` | NOT NULL, DEFAULT `'tag'` | Simbol/identifier ikon visual |
| `created_at` | `TIMESTAMPTZ`| NOT NULL, DEFAULT `NOW()` | Waktu pembuatan |

### Table: `transactions`
Menyimpan setiap mutasi dana masuk maupun keluar.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | ID transaksi |
| `account_id` | `UUID` | NOT NULL, REFERENCES `accounts(id)` ON DELETE RESTRICT | Akun asal/tujuan dana |
| `category_id`| `UUID` | NOT NULL, REFERENCES `categories(id)` ON DELETE RESTRICT | Kategori mutasi |
| `amount` | `BIGINT` | NOT NULL, CHECK (`amount` > 0) | Nominal selalu positif (dalam Rupiah) |
| `type` | `VARCHAR(10)` | NOT NULL | ENUM/Check: `'INCOME'`, `'EXPENSE'` |
| `description`| `VARCHAR(255)`| NOT NULL | Catatan transaksi |
| `transaction_date`| `DATE` | NOT NULL | Tanggal terjadinya transaksi |
| `created_at` | `TIMESTAMPTZ`| NOT NULL, DEFAULT `NOW()` | Waktu pencatatan di sistem |

---

## 4. API Endpoints Specification

Base URL: `/api`

### 4.1 Accounts
- `GET /api/accounts`
  - Response: `200 OK` — list of accounts, balances, and calculated `total_liquid_balance` & `total_paylater_debt`.
- `POST /api/accounts`
  - Body: `{ "name": "GoPay", "type": "EWALLET", "current_balance": 350000 }`
  - Response: `201 Created`
- `PUT /api/accounts/:id`
  - Body: `{ "name": "BCA Utama", "type": "BANK", "current_balance": 8200000 }`
  - Response: `200 OK`

### 4.2 Categories
- `GET /api/categories`
  - Response: `200 OK` — list of categories grouped by `EXPENSE` / `INCOME`.
- `POST /api/categories`
  - Body: `{ "name": "Elektronik", "type": "EXPENSE", "icon": "cpu" }`
  - Response: `201 Created`

### 4.3 Transactions
- `GET /api/transactions?month=2026-10&account_id=&category_id=&limit=50&offset=0`
  - Response: `200 OK` — pagination array of transactions with joined account name and category info.
- `POST /api/transactions`
  - Body: `{ "account_id": "uuid", "category_id": "uuid", "amount": 35000, "type": "EXPENSE", "description": "Nasi Padang", "transaction_date": "2026-10-05" }`
  - Business Logic:
    - Menjalankan DB Transaction (`BEGIN`).
    - Insert baris transaksi baru.
    - Update `accounts.current_balance`:
      - Jika `EXPENSE`: `current_balance = current_balance - amount`.
      - Jika `INCOME`: `current_balance = current_balance + amount`.
    - `COMMIT`.
  - Response: `201 Created`
- `DELETE /api/transactions/:id`
  - Menjalankan pembalikan saldo akun (*reversal*) dan menghapus baris transaksi di dalam DB Transaction.
  - Response: `200 OK`

### 4.4 Monthly Summary
- `GET /api/summary?month=2026-10`
  - Menghitung agregasi data untuk periode bulan yang diminta:
    - `total_income`: Sum amount where type = 'INCOME' in selected month.
    - `total_expense`: Sum amount where type = 'EXPENSE' in selected month.
    - `net_cashflow`: `total_income - total_expense`.
    - `savings_rate_percentage`: `(net_cashflow / total_income) * 100` (jika income > 0).
    - `active_paylater_bill`: Total saldo negatif dari seluruh akun bertipe `PAYLATER`.
    - `category_breakdown`: List kategori pengeluaran, total nominal, persentase pengeluaran, dan jumlah transaksi.
  - Response: `200 OK`

---

## 5. UI/UX Design System (iOS Liquid Glass + Anti-Slop)

1. **Warna Dasar & Kontras:**
   - Background: Deep Slate `#0f1015` (Solid, matte, berwibawa).
   - Card Surfaces: Solid Charcoal `#16171d` dengan 1px border `#262832` (kontras tajam, rasio WCAG AAA untuk teks).
   - Teks Utama: `#ffffff`, Teks Sekunder: `#8e8e93`, Teks Tersier: `#636366`.
   - Angka & Moneter: Selalu menggunakan CSS `font-variant-numeric: tabular-nums` dengan warna fungsional:
     - Hijau Apple `#30d158` untuk uang masuk.
     - Merah Apple `#ff453a` untuk uang keluar.
     - Kuning Amber `#ffd60a` untuk kewajiban Paylater.
2. **Dosis Glassmorphism Terkontrol (Anti-Slop R-10):**
   - Efek frosted glass blur dibatasi maksimal 2 elemen:
     - `Hero Card` saldo likuid di bagian paling atas (`backdrop-filter: blur(25px)`).
     - `Floating Bottom Dock` kapsul navigasi melayang (`backdrop-filter: blur(30px)`).
3. **Floating Dock Navigasi Simetris 5-Kolom:**
   - Grid layout simetris: `grid-template-columns: 1fr 1fr 64px 1fr 1fr`.
   - Kiri: Tab Mutasi & Tab Budget.
   - Tengah (50% presisi): Tombol Aksi Cepat `(+)` dengan diameter 52px.
   - Kanan: Tab Rekap & Tab Akun.

---

## 6. Testing & Quality Strategy

1. **Unit Testing (TDD - Red-Green-Refactor):**
   - Testing formula perhitungan saldo dan pembalikan transaksi.
   - Testing agregasi ringkasan bulanan (*net cashflow*, rasio tabungan, breakdown kategori).
   - Validasi error input (nominal $\le$ 0, akun tidak ditemukan, tanggal tidak valid).
2. **Integration Testing:**
   - Uji transaksi atomik database dengan rollback saat kegagalan simpan.
3. **Anti-Slop Delivery Gate:**
   - Memastikan tidak ada komentar kode generik AI atau log berlebih (`antislop-code`).
   - Memastikan aksesibilitas kontras teks dan minimum tap target 44px (`antislop-human` & `antislop-layoutmobile`).

---

## 7. Delivery Plan

- **Phase 1:** Inisialisasi struktur project Go, modul DB PostgreSQL, skema migrasi, dan unit test service.
- **Phase 2:** Implementasi REST API (Accounts, Transactions, Categories, Summary) dengan TDD.
- **Phase 3:** Pembangunan Frontend Mobile SPA (Vite + Tailwind CSS) sesuai desain iOS Liquid Glass.
- **Phase 4:** Integrasi Docker Compose, verifikasi pengujian end-to-end, dan commit Git.
