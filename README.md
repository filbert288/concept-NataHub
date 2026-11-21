# NataHub (concept)

Prototipe workspace operasional untuk UMKM: otomasi workflow, inbox terpadu, fulfillment & packing,
inventori & opname, supplier & restock, laporan bisnis, dan penggunaan AI.

## Menjalankan

Buka `index.html` di browser, atau jalankan server statis:

```bash
python3 -m http.server 8000
```

Butuh internet untuk Tailwind (CDN) dan Google Fonts. Login menerima email/WA dan sandi apa saja (demo).

## Struktur

| File | Isi |
|---|---|
| `index.html` | Kerangka: gerbang login + dashboard |
| `style.css` | Gaya dashboard dan override warna brand |
| `auth.css` | Gaya login/daftar (dibatasi ke `#auth`) |
| `tailwind-config.js` | Warna dan font Tailwind |
| `js/core.js` | Navigasi, toast, canvas workflow, node, state inti |
| `js/opname.js` | Opname, sinkron toko, tambah produk, filter |
| `js/supplier.js` | Supplier, rating, PO, AI matchmaker |
| `js/fulfillment.js` | Kanban packing, QC, manifest handover |
| `js/inbox.js` | Unified inbox, draf AI, auto-reply WhatsApp |
| `js/ai-usage.js` | Top-up QRIS, log penggunaan AI |
| `js/auth.js` | Login dan alur daftar 3 langkah |

## Catatan

Semua data masih contoh (mock) di sisi browser. Angka laporan, stok, dan status integrasi belum
terhubung ke backend atau marketplace sungguhan.
