# Nitipgo — Frontend

Platform jasa titip (jastip) berbasis web yang menghubungkan **customer** yang ingin mengirim/membeli barang titipan dengan **traveler** yang sedang bepergian ke tujuan yang sama. Dibangun dengan React + TypeScript (frontend) dan Laravel (backend API terpisah).

---

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Peran](#struktur-peran)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Cara Menyalin & Menjalankan Proyek](#cara-menyalin--menjalankan-proyek)
- [Variabel Environment](#variabel-environment)
- [Skrip yang Tersedia](#skrip-yang-tersedia)
- [Alur Pembayaran (Midtrans Snap)](#alur-pembayaran-midtrans-snap)
- [Catatan Pengembangan](#catatan-pengembangan)

---

## Fitur

### Customer
- Menelusuri daftar trip traveler yang tersedia
- Membuat pesanan pengiriman / pembelian barang
- Melacak status pesanan secara real-time
- Pembayaran order via Midtrans Snap (Transfer Bank, E-Wallet, Kartu Kredit)
- Riwayat pesanan & trip
- Live chat dengan traveler
- Memberikan rating & ulasan
- Mengajukan laporan / sengketa (dispute)

### Traveler
- Mendaftarkan trip (rute, tanggal, kapasitas bawa)
- Mengelola pesanan masuk (terima / tolak / batalkan)
- Dashboard pendapatan & dompet (withdraw ke rekening bank)
- **Boost profil** — tampil di urutan teratas pencarian via Midtrans Snap
- Membalas laporan / sengketa dari customer
- Riwayat trip & pesanan

### Admin
- Manajemen pengguna (customer & traveler)
- Manajemen transaksi & laporan keuangan (dompet admin)
- Manajemen sengketa (dispute) — Tinjau & Selesaikan dengan keputusan (refund / partial refund / release payment)
- Manajemen rute perjalanan
- Pengaturan paket booster & iklan traveler
- Manajemen rating
- Notifikasi platform

### Umum
- Autentikasi JWT (login, register, lupa password, Google OAuth)
- Peta interaktif berbasis Leaflet
- Notifikasi per peran (customer / traveler / admin)
- Tampilan responsif (mobile-first)
- Animasi halus dengan Framer Motion

---

## Teknologi

| Kategori | Teknologi |
|---|---|
| Framework UI | React 18, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| State & Data Fetching | TanStack Query (React Query) |
| Routing | React Router DOM v6 |
| Form | React Hook Form + Zod |
| Peta | Leaflet + React Leaflet |
| Animasi | Framer Motion |
| HTTP Client | Axios (dengan interceptor JWT + refresh token) |
| Grafik | Recharts |
| Notifikasi UI | Sonner, SweetAlert2 |
| Pembayaran | Midtrans Snap (popup) |
| Testing | Vitest, Testing Library |
| Backend | Laravel (API terpisah, tidak ada di repo ini) |

---

## Struktur Peran

```
Pengguna
├── Guest       — Beranda, daftar trip, FAQ, cara kerja, kontak
├── Customer    — Membuat & melacak pesanan, chat, rating, laporan
├── Traveler    — Mendaftarkan trip, kelola pesanan, dompet, boost, laporan
└── Admin       — Manajemen platform secara keseluruhan
```

---

## Struktur Proyek

```
src/
├── assets/                   # Gambar & aset statis
├── components/
│   ├── layout/               # Layout utama
│   │   ├── DashboardLayout   # Layout sidebar dashboard (semua peran)
│   │   ├── MainLayout        # Layout halaman publik
│   │   ├── Header            # Navbar publik
│   │   └── Footer
│   ├── map/                  # Komponen peta Leaflet
│   └── ui/                   # Komponen reusable (shadcn/ui + custom)
│       ├── CountUp           # Animasi angka naik
│       ├── EmptyState        # Tampilan data kosong
│       ├── StatusBadge       # Badge status warna dinamis
│       └── ...shadcn components
├── context/
│   └── OrderContext          # Konteks alur pemesanan
├── lib/
│   ├── api.ts                # Konfigurasi Axios + interceptor JWT refresh
│   ├── auth.ts               # Helper autentikasi (get/set/clear token)
│   └── storage.ts            # Helper localStorage
├── pages/
│   ├── admin/                # Halaman admin
│   │   ├── AdminWallet       # Dompet & keuangan admin
│   │   ├── Booster           # Kelola paket booster traveler
│   │   ├── Advertisement     # Kelola iklan
│   │   ├── Disputes          # Sengketa — tinjau & selesaikan
│   │   ├── Rating            # Manajemen rating
│   │   ├── Routes            # Manajemen rute
│   │   ├── Transactions      # Daftar transaksi
│   │   ├── Travelers         # Daftar traveler
│   │   └── Users             # Daftar customer
│   ├── auth/
│   │   ├── Login
│   │   ├── Register
│   │   ├── RegisterTraveler
│   │   ├── ForgotPassword
│   │   └── GoogleCallback
│   ├── dashboard/
│   │   ├── AdminDashboard
│   │   ├── CustomerDashboard
│   │   ├── CustomerHistory
│   │   ├── CustomerTrip
│   │   ├── CustomerTripDetail
│   │   └── TravelerDashboard
│   ├── legal/                # Syarat & Ketentuan, Kebijakan Privasi
│   ├── notifications/        # Notifikasi per peran
│   ├── order/                # Alur pemesanan customer
│   │   ├── NewOrder          # Buat pesanan baru
│   │   ├── Order             # Detail pesanan + pembayaran Midtrans
│   │   ├── OrderDetail
│   │   ├── OrderList
│   │   ├── OrderTracking
│   │   ├── OrderPayment
│   │   ├── OrderCancelled
│   │   └── OrderRejected
│   ├── profile/              # Profil per peran
│   ├── settings/
│   │   ├── CustomerSettings
│   │   └── TravelerSettings  # Notif, pembayaran, keamanan + Boost profil
│   └── traveler/             # Halaman khusus traveler
│       ├── NewTrip           # Daftarkan trip baru
│       ├── TripList          # Daftar trip saya
│       ├── TripDetail        # Detail trip + kelola pesanan masuk
│       ├── OrderDetail       # Detail pesanan traveler
│       ├── Wallet            # Dompet & saldo
│       ├── WalletHistory     # Riwayat saldo
│       ├── WalletWithdraw    # Penarikan saldo
│       ├── PaymentBoost      # Pembayaran boost via Midtrans Snap
│       └── Report            # Laporan / balas sengketa
├── App.tsx                   # Konfigurasi routing + protected routes
└── main.tsx                  # Entry point
```

---

## Prasyarat

Pastikan tools berikut sudah terinstal sebelum memulai:

| Tool | Versi minimum |
|---|---|
| Node.js | >= 18 |
| npm | >= 9 |
| Git | versi terbaru |
| Backend Laravel | berjalan di `http://localhost:8000` |

> Backend (Laravel) tidak termasuk di repo ini. Pastikan backend sudah berjalan dan dapat diakses sebelum menjalankan frontend.

---

## Cara Menyalin & Menjalankan Proyek

### 1. Clone repository

```sh
git clone <URL_REPOSITORY> web-nitipgo
cd web-nitipgo
```

> Ganti `<URL_REPOSITORY>` dengan URL repo Git yang diberikan (HTTPS atau SSH).

### 2. Install dependensi

```sh
npm install
```

Tunggu hingga semua paket selesai diunduh. Proses ini memerlukan koneksi internet.

### 3. Buat file environment

Buat file `.env` di root proyek (sejajar dengan `package.json`):

```sh
# Windows (Command Prompt)
copy NUL .env

# Windows (Git Bash / PowerShell)
touch .env
```

Lalu isi dengan konten berikut (sesuaikan URL jika backend berjalan di port berbeda):

```env
VITE_API_URL=http://localhost:8000/api
```

### 4. Jalankan development server

```sh
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`. Buka URL tersebut di browser.

### 5. (Opsional) Build untuk produksi

```sh
npm run build
```

Hasil build tersimpan di folder `dist/`. Untuk preview hasil build:

```sh
npm run preview
```

---

## Variabel Environment

| Variabel | Keterangan | Contoh Nilai |
|---|---|---|
| `VITE_API_URL` | Base URL API Laravel | `http://localhost:8000/api` |

> Semua variabel frontend **harus** diawali `VITE_` agar dapat dibaca oleh Vite. Variabel tanpa prefix `VITE_` tidak akan tersedia di browser.

---

## Skrip yang Tersedia

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Menjalankan development server dengan Hot Module Replacement |
| `npm run build` | Build produksi (output ke `dist/`) |
| `npm run build:dev` | Build mode development (tanpa minifikasi) |
| `npm run preview` | Preview hasil build secara lokal |
| `npm run lint` | Menjalankan ESLint untuk cek kualitas kode |
| `npm run test` | Menjalankan unit test sekali (Vitest) |
| `npm run test:watch` | Menjalankan test dalam mode watch (otomatis re-run saat file berubah) |

---

## Alur Pembayaran (Midtrans Snap)

Proyek ini menggunakan **Midtrans Snap** sebagai payment gateway. Snap adalah popup pembayaran yang di-embed langsung di halaman tanpa redirect keluar.

### Cara kerja

1. User klik **Bayar** — frontend memanggil endpoint API backend (`/traveler/boosters/buy` atau `/orders/{id}/pay`)
2. Backend membuat transaksi di Midtrans dan mengembalikan `snap_token` + `client_key`
3. Frontend memuat script Snap secara dinamis (jika belum ada) dan memanggil `window.snap.pay(token, callbacks)`
4. Popup Midtrans terbuka — user memilih metode pembayaran (Transfer Bank, E-Wallet, Kartu Kredit) di dalam popup
5. Callback `onSuccess` / `onPending` / `onError` / `onClose` menentukan langkah selanjutnya

### Konfigurasi backend yang diperlukan

Backend Laravel harus mengembalikan response berikut dari endpoint buy/pay:

```json
{
  "data": {
    "payment_id": 123,
    "snap_token": "xxxx-xxxx-xxxx",
    "client_key": "SB-Mid-client-xxxxxxxx"
  }
}
```

### Environment sandbox vs produksi

Script Snap yang digunakan secara default adalah **sandbox**:
```
https://app.sandbox.midtrans.com/snap/snap.js
```

Untuk produksi, ganti ke:
```
https://app.midtrans.com/snap/snap.js
```

---

## Catatan Pengembangan

### Autentikasi JWT

- Token disimpan di `localStorage` via `src/lib/auth.ts`
- Axios interceptor di `src/lib/api.ts` secara otomatis menyertakan `Authorization: Bearer <token>` di setiap request
- Jika token expired (401), interceptor otomatis melakukan refresh token dan mengulang request

### Protected Routes

Route per peran dilindungi di `App.tsx`. Jika user belum login atau perannya tidak sesuai, akan di-redirect ke halaman login.

### Struktur Role Guard

```
/              → Guest (publik)
/login         → Guest only (redirect ke dashboard jika sudah login)
/customer/*    → Customer only
/traveler/*    → Traveler only
/admin/*       → Admin only
```

### Konvensi Kode

- Komponen: **PascalCase** (`TravelerSettings.tsx`)
- Fungsi helper: **camelCase** (`formatRupiah`, `fetchDisputes`)
- Konstanta konfigurasi: **camelCase objek** (`statusCfg`, `priorityCfg`)
- Animasi Framer Motion yang dipakai bersama didefinisikan di **luar komponen** (module-level) agar tidak re-create setiap render
