# Portfolio — Reginald M.R.G.

Website portofolio pribadi. Dibuat dengan **Vite + Vanilla JavaScript**, tanpa framework.

Dibuat supaya seluruh isi website bisa diubah sendiri **tanpa menyentuh kode**, lewat fitur *Custom Mode* (mode developer).

---

## Daftar Isi

1. [Menjalankan di komputer sendiri](#1-menjalankan-di-komputer-sendiri)
2. [Masuk ke Custom Mode](#2-masuk-ke-custom-mode)
3. [Mengubah isi website](#3-mengubah-isi-website)
4. [Mempublikasikan ke internet](#4-mempublikasikan-ke-internet-via-vercel)
5. [Tombol di Toolbar](#5-tombol-di-toolbar)
6. [Struktur folder](#6-struktur-folder)
7. [Yang perlu diketahui](#7-yang-perlu-known)
8. [Masalah yang sering muncul](#8-masalah-yang-sering-muncul)

---

## 1. Menjalankan di komputer sendiri

**Kebutuhan:** Node.js versi **20.19+** atau **22.12+**
Cek dulu di terminal:

```powershell
node -v
```

Buka terminal di folder project ini, lalu jalankan:

```powershell
npm install     # hanya sekali, saat pertama kali
npm run dev
```

Lalu buka **http://localhost:5173/**

Untuk menghentikan server: tekan `Ctrl + C` di terminal.

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan server untuk pengembangan |
| `npm run build` | Buat versi produksi ke folder `dist/` |
| `npm run preview` | Cek hasil build di http://localhost:4173/ |

---

## 2. Masuk ke Custom Mode

Custom Mode adalah mode untuk mengedit seluruh isi website secara visual.

### Cara cepat

1. Ketik angka **`2710`** di halaman mana saja
2. Muncul dialog → ketik **`2710`** lagi
3. Klik **Unlock**

### Cara tidak mencolok

1. Klik tombol bulat **CV** di pojok kanan bawah
2. **Tahan `Ctrl`** lalu klik kiri
3. Ketik **`2710`** → **Unlock**

> Tahan `Ctrl` membuat tombolnya berubah dari **CV** menjadi **⚙** dan tulisan popup-nya jadi **Administrator**. Tanpa `Ctrl`, klik biasa justru mengunduh CV.

### Keluar

Klik tombol merah **Exit** di toolbar bawah tengah.

> ⚠️ Semua perubahan **tersimpan otomatis di browser ini saja**. Kalau browser di-clear atau ganti perangkat, isinya hilang. Selalu **Export** (lihat Bagian 4).

---

## 3. Mengubah isi website

### Penting: dua bahasa

Tombol **EN / ID** di header menentukan bahasa yang sedang diedit.

- Tekan **EN** → mengedit versi **bahasa Inggris**
- Tekan **ID** → mengedit versi **bahasa Indonesia**

Kedua versi tersimpan terpisah, jadi mengedit bahasa Indonesia tidak merusak versi Inggris.

### Halaman **Work** — daftar karya

| Yang ingin diubah | Cara |
|---|---|
| Tambah karya baru | Klik **+ Work** di baris kategori |
| Ganti / pasang foto | Klik kotak abu-abunya → pilih file dari komputer |
| Judul karya | Klik langsung teksnya, lalu ketik |
| Tahun | Klik angka tahunnya |
| Pindah kategori | Pilih dari dropdown di bawah kartu |
| Tampilkan di dinding utama | Centang kotak **Wall** |
| **Pasang video** | Klik tombol **+ Video** di bawah kartu |
| Hapus karya | Klik **Delete** |

> **Karya tanpa foto dan tanpa video tidak akan tayang** ke pengunjung — dan otomatis tidak muncul di dinding utama juga. Ini disengaja: supaya halaman tidak penuh kotak kosong.

#### Tentang Video

Karya bisa punya video (atau animasi) selain foto.

- **Saat kursor di atas kartu** → video mulai diputar sendiri, tanpa suara
- **Saat kursor pergi** → video berhenti dan kembali ke awal
- **Saat diklik** → muncul di layar besar, lengkap dengan kontrol play/pause
- Kalau ada foto, fotonya jadi **poster** (gambar sebelum video diputar)

**Cara memasang video:**

1. Klik **+ Video** → pilih file video dari komputer
2. Website otomatis mencatat nama filenya, muncul pesan:
   > Video set to "/work/namafile.mp4" — now copy your file into the public/work folder.
3. **Salin file video itu ke folder `public/work/`** di project kamu

> ⚠️ **Kenapa file videonya harus disalin manual, bukan otomatis?**
>
> File video biasanya berukuran **beberapa sampai puluhan megabyte**, sedangkan penyimpanan browser hanya **5 MB**. Kalau videonya ikut disimpan di dalam website, website akan rusak dan isinya hilang.
>
> Jadi videonya disimpan sebagai file terpisah di dalam project — persis seperti cara gambar di folder `public/`.

Format yang didukung browser: **MP4 (H.264)** paling aman, dan **WebM** juga bisa. Untuk animasi (After Effects, Lottie), export dulu ke MP4.

---

## Tombol pojok kanan bawah

Ada dua tombol melayang di pojok kanan bawah:

| Tombol | Fungsi |
|---|---|
| **↑ Back to Top** | Menggulir halaman ke atas. Saat kursor mendekat, tombol ini melebar jadi pil bertuliskan "BACK TO TOP". |
| **CV** | Mengunduh CV. **Tahan `Ctrl`** lalu klik → berubah jadi gerigi untuk membuka Custom Mode. |

Ukuran Back to Top sekitar ¾ ukuran tombol CV, dan keduanya selalu sejajar. Di HP keduanya menyesuaikan otomatis dan tidak saling tumpang tindih.

### Halaman **Experience** — rekam jejak

| Yang ingin diubah | Cara |
|---|---|
| Tambah pengalaman | Klik **+ Experience** |
| Isi posisi/jabatan | Klik kolom **title** |
| Isi nama perusahaan | Klik kolom **org** |
| Isi masa kerja | Klik kolom **period** (contoh: `2022 — Present`) |
| Isi deskripsi | Klik kolom **desc** |
| Pasang foto (opsional) | Klik kotak putus-putus di kanan |
| Hapus | Klik **Delete** |

> **Selama `title` masih kosong, entri itu belum tayang.** Begitu diketik judulnya, langsung muncul untuk pengunjung.

### Halaman **About** — tentang saya

| Yang ingin diubah | Cara |
|---|---|
| Foto pribadi | Klik area foto di kanan judul |
| Paragraf pembuka | Klik teks panjangnya |
| Daftar Fields / Clients / Info | Klik per baris |
| Layanan | Klik judul atau deskripsi layanan |
| Email | Klik alamat emailnya |
| Instagram / Behance | Klik teksnya; kolom URL-nya ada di bawah |
| Tambah baris baru | Klik **+ Item** |
| Hapus baris | Klik tombol **×** di sebelahnya |

### Warna

Tiga kotak warna di toolbar:

- **Background** — warna latar
- **Text** — warna tulisan
- **Border** — warna garis

> Selama tidak diubah, website tetap putih (mengikuti pengaturan sistem).

### Bagian bawah

- **Ticker** (teks berjalan) — klik kata-katanya
- **Footer** — scroll ke paling bawah, klik teksnya

---

## 4. Mempublikasikan ke Internet (via Vercel)

### Konsepnya

Semua edit kamu tersimpan di **localStorage browser** — itu hanya ada di laptop kamu, **tidak** ikut ter-upload.

Yang benar-benar tayang ke pengunjung hanyalah satu file:

```
public/content.json
```

Jadi setiap kali selesai mengedit, kamu perlu melakukan 4 langkah ini:

### Langkah export

1. Selesai mengedit → klik **Exit**
2. Buka lagi → ketik `2710` → **Unlock**
3. Klik **Export** → file `content.json` masuk ke folder **Downloads**
4. **Pindahkan file itu ke folder `public/`** di dalam project ini

```
E:\proyek-web\web-pertama\public\content.json
```

> ⚠️ Harus **di dalam folder `public/`**. Kalau ditaruh di root project, tidak akan ikut ter-deploy.

### Langkah deploy

5. Upload ulang / push ke GitHub lalu Vercel
6. Buka website Vercel → tekan **Ctrl + Shift + R** (hard refresh)

### Soal file CV

Taruh file PDF CV kamu di folder `public/` dengan nama persis:

```
E:\proyek-web\web-pertama\public\cv.pdf
```

Kalau mau nama lain, ubah nilainya di `src/content.js` pada bagian:

```js
cv: {
  label: 'Download CV',
  href: '/cv.pdf',
},
```

---

## 5. Tombol di Toolbar

| Tombol | Fungsi |
|---|---|
| **Save** | Simpan ke browser saja (**tidak** tayang) |
| **Export** | Unduh `content.json` — **ini yang dipakai untuk deploy** |
| **Import** | Muat `content.json` dari komputer (untuk restore / pindah perangkat) |
| **Reset** | Hapus semua isi lokal, kembalikan ke bawaan |
| **Exit** | Keluar dari Custom Mode |

---

## 6. Struktur Folder

```
web-pertama/
├── index.html          Struktur halaman (header, halaman, footer)
├── src/
│   ├── main.js         Logika utama: render halaman, router, bahasa
│   ├── content.js      SEMUA isi website + terjemahan Indonesia
│   ├── editor.js       Custom Mode (kode developer, upload, edit)
│   ├── state.js        State kecil (mode edit, kategori aktif)
│   └── style.css       Seluruh tampilan
├── public/
│   ├── content.json    ← hasil Export (yang tayang ke pengunjung)
│   ├── cv.pdf          ← file CV kamu
│   ├── work/           ← tempat foto & VIDEO tambahan
│   └── favicon.svg
├── dist/               Hasil build (otomatis dibuat)
└── package.json
```

---

## 7. Yang Perlu Diketahui

### Foto otomatis dikompres

Saat kamu upload foto, sistem otomatis:
- Memperkecil maksimal **1400px**
- Disimpan sebagai **WebP** (jauh lebih kecil dari PNG)
- Menampilkan ukuran hasilnya (misal *"Image updated — 320 KB"*)

Kalau muncul peringatan **"Browser storage is full"**, segera klik **Export** — isi browser sudah hampir penuh dan perubahan terbaru bisa hilang.

### Halaman & navigasi

| Alamat | Halaman |
|---|---|
| `#/` | Beranda (dinding media) |
| `#/work` | Semua karya |
| `#/work/<kategori>` | Karya per kategori |
| `#/experience` | Pengalaman |
| `#/about` | Tentang |

### Di HP

Tampilan otomatis menyesuaikan. Menu berubah jadi tombol **Menu** yang membuka daftar.

---

## 8. Masalah yang Sering Muncul

**Perubahan saya tidak muncul di Vercel**
→ Lupa melakukan **Export** + memindahkan `content.json` ke `public/`, lalu deploy ulang.

**Vercel masih menampilkan data lama**
→ Hard refresh: tekan **Ctrl + Shift + R**. Kalau masih, coba buka di **jendela penyamaran** (incognito).

**Karya saya tidak muncul**
→ Foto atau videonya belum diisi. Karya tanpa media tidak tayang.

**Pengalaman saya tidak muncul**
→ `title` masih kosong. Entri butuh judul.

**File `content.json` tidak ikut ter-deploy**
→ Pastikan file-nya **di dalam folder `public/`**, bukan di root project.

**Mau mulai dari nol**
→ Custom Mode → **Reset**.

**Mau pindah ke komputer lain**
→ Di komputer lama: **Export**. Di komputer baru: salin project + `content.json` ke `public/`, lalu **Import**.

---

## Ringkasan Alur Kerja

```
Buka localhost:5173
        ↓
Ketik 2710 → Unlock
        ↓
Edit teks, upload foto, atur warna
        ↓
Exit
        ↓
Masuk lagi → 2710 → Unlock → Export
        ↓
Pindahkan content.json ke public/
        ↓
Deploy ke Vercel → Ctrl+Shift+R
```