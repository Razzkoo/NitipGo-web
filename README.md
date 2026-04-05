# Nitipgo

Platform jasa titip (jastip) berbasis web yang menghubungkan **customer** yang ingin mengirim barang dengan **traveler** yang sedang bepergian ke tujuan yang sama. Dibangun dengan React + TypeScript di sisi frontend dan Laravel di sisi backend.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Struktur Peran (Role)](#struktur-peran-role)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Instalasi & Menjalankan Proyek](#instalasi--menjalankan-proyek)
- [Variabel Environment](#variabel-environment)
- [Skrip yang Tersedia](#skrip-yang-tersedia)

---

## Fitur Utama

### Customer
- Menelusuri daftar trip traveler yang tersedia
- Membuat pesanan pengiriman barang
- Melacak status pesanan secara real-time
- Pembayaran & konfirmasi pesanan
- Riwayat pesanan & trip
- Live chat dengan traveler
- Memberikan rating & ulasan

### Traveler
- Mendaftarkan trip (rute, tanggal, kapasitas)
- Mengelola pesanan masuk (terima / tolak / batalkan)
- Dashboard pendapatan & dompet (withdraw)
- Boost trip menggunakan fitur iklan
- Riwayat trip & pesanan

### Admin
- Manajemen pengguna (customer & traveler)
- Manajemen transaksi & sengketa
- Manajemen rute
- Pengaturan booster & iklan
- Manajemen rating
- Dompet admin & laporan keuangan

### Umum
- Autentikasi JWT (login, register, Google OAuth)
- Peta interaktif berbasis Leaflet
- Notifikasi real-time
- Tampilan responsif (mobile-first)
- Tema terang/gelap

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
| HTTP Client | Axios |
| Grafik | Recharts |
| Notifikasi | Sonner, SweetAlert2 |
| Testing | Vitest, Testing Library |
| Backend | Laravel (API terpisah) |

---

## Struktur Peran (Role)

```
Pengguna
├── Guest       — Halaman publik (beranda, daftar trip, FAQ, cara kerja)
├── Customer    — Membuat & melacak pesanan
├── Traveler    — Mendaftarkan trip & mengelola pesanan masuk
└── Admin       — Manajemen platform secara keseluruhan
```

---

## Struktur Proyek

```
src/
├── assets/          # Gambar, ikon, provider assets
├── components/
│   ├── layout/      # Layout utama (Header, Footer, DashboardLayout, dll.)
│   ├── map/         # Komponen peta Leaflet
│   └── ui/          # Komponen UI reusable (shadcn/ui)
├── context/         # React Context (OrderContext, dll.)
├── lib/
│   ├── api.ts       # Konfigurasi Axios + interceptor token
│   ├── auth.ts      # Helper autentikasi
│   └── storage.ts   # Helper localStorage
├── pages/
│   ├── admin/       # Halaman admin (users, transactions, routes, dll.)
│   ├── auth/        # Login, Register, Google Callback
│   ├── dashboard/   # Dashboard per peran
│   ├── legal/       # Syarat & Ketentuan, Kebijakan Privasi
│   ├── notifications/
│   ├── order/       # Alur pemesanan (buat, detail, tracking, pembayaran)
│   ├── profile/     # Profil per peran
│   ├── settings/    # Pengaturan akun
│   └── traveler/    # Halaman khusus traveler (trip, dompet, dll.)
└── App.tsx          # Konfigurasi routing utama
```

---

## Prasyarat

- **Node.js** >= 18
- **npm** >= 9
- Backend Laravel berjalan di `http://localhost:8000` (atau sesuai `.env`)

---

## Instalasi & Menjalankan Proyek

```sh
# 1. Clone repository
git clone <YOUR_GIT_URL>
cd web-nitipgo

# 2. Install dependensi
npm install

# 3. Salin file environment dan sesuaikan
cp .env.example .env

# 4. Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173` secara default.

---

## Variabel Environment

Buat file `.env` di root proyek:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Skrip yang Tersedia

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build produksi |
| `npm run build:dev` | Build mode development |
| `npm run preview` | Preview hasil build |
| `npm run lint` | Menjalankan ESLint |
| `npm run test` | Menjalankan unit test (Vitest) |
| `npm run test:watch` | Menjalankan test dalam mode watch |
