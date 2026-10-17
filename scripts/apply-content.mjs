/**
 * Terapkan "content baru.json" sebagai content.json, bersihkan sisa GIS,
 * lalu tulis terjemahan Indonesia yang lengkap.
 *
 * Jalankan: node scripts/apply-content.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = JSON.parse(readFileSync(join(root, 'public', 'content baru.json'), 'utf8'))

/* ---------- 1. Bersihkan sisa GIS ---------- */

// kategori "gis" -> "animation" (label sudah diubah di file baru)
src.categories = src.categories.map((c) => (c.id === 'gis' ? { ...c, id: 'animation' } : c))
const rename = { gis: 'animation' }
src.works = src.works.map((w) => ({
  ...w,
  cat: rename[w.cat] || w.cat,
}))

// marquee disusun ulang dari kategori, tanpa GIS
src.marquee = src.categories.map((c) => c.label)

// catatan yang masih menyebut pemetaan / penelitian lingkungan
src.contact.note =
  'Available for design, illustration, animation, video & photo editing projects. Replies within 1–2 business days.'
src.experienceSection.note = 'Roles, organisations, and competitions across visual design and creative media.'
src.wall.line3 = 'Animate & Edit'
src.brand.tunnel = 'Creative Studio'
src.footer.left = '© {year} Reginald M.R.G. — Creative Studio'

// deskripsi kategori tanpa GIS
const CAT_DESC = {
  'graphic-design': 'Brand identity, packaging, posters, and visual assets for print and digital.',
  illustration: 'Digital illustration, character design, editorial work, and custom artwork.',
  'video-editing': 'Video editing, motion graphics, color grading, and sound design.',
  animation: 'Logo animation, product animation, and motion graphics.',
  'photo-editing': 'Retouching, manipulation, and color grading for product and editorial photos.',
}
src.categories = src.categories.map((c) => ({ ...c, desc: CAT_DESC[c.id] || c.desc }))

/* ---------- 2. Terjemahan Indonesia ---------- */
const t = {
  // Brand
  'brand.name': 'Reginald M.R.G.',
  'brand.mark': '®',
  'brand.tunnel': 'Studio Kreatif',

  // Home
  'wall.eyebrow': 'Karya Pilihan — Tuban, Indonesia',
  'wall.line1': 'Desain',
  'wall.line2': 'Ilustrasi',
  'wall.line3': 'Animasi & Edit',
  'wall.link': 'Lihat Semua Karya',

  // Halaman Works
  'workSection.label': 'Karya Pilihan',
  'workSection.title': 'Semua Karya',
  'workSection.note': 'Campuran dari lima bidang. Pilih kategori untuk melihat keseluruhan karyanya.',

  // Halaman Experience
  'experienceSection.label': 'Pengalaman',
  'experienceSection.title': 'Rekam Jejak',
  'experienceSection.note': 'Peran, organisasi, dan kompetisi di bidang desain visual serta media kreatif.',

  // Kategori
  'categories.0.label': 'Graphic Design',
  'categories.0.desc':
    'Identitas merek, kemasan, poster, dan aset visual untuk cetak maupun digital.',
  'categories.1.label': 'Illustration',
  'categories.1.desc':
    'Ilustrasi digital, desain karakter, karya editorial, dan ilustrasi khusus.',
  'categories.2.label': 'Video Editing',
  'categories.2.desc': 'Penyuntingan video, motion graphics, color grading, dan sound design.',
  'categories.3.label': 'Animation',
  'categories.3.desc': 'Animasi logo, animasi produk, dan motion graphics.',
  'categories.4.label': 'Photo Editing',
  'categories.4.desc': 'Retouch, manipulasi, dan color grading untuk foto produk maupun editorial.',

  // About
  'about.label': 'Tentang',
  'about.lead':
    'Saya seorang Graphic Designer, Illustrator, Animator, Video Editor, dan Photo Editor. Kalau kamu butuh desain, ilustrasi, animasi, video, atau retouch foto yang bagus, langsung hubungi saya saja.',
  'about.cols.0.label': 'Bidang',
  'about.cols.0.items.0': 'Graphic Design & Branding',
  'about.cols.0.items.1': 'Ilustrasi Digital',
  'about.cols.0.items.2': 'Video Editing & Motion',
  'about.cols.0.items.3': 'Photo Editing & Retouching',
  'about.cols.1.label': 'Perangkat',
  'about.cols.1.items.0': 'Adobe Illustrator',
  'about.cols.1.items.1': 'Adobe Photoshop',
  'about.cols.1.items.2': 'Adobe Premiere Pro',
  'about.cols.1.items.3': 'Adobe After Effects',
  'about.cols.1.items.4': 'DaVinci Resolve',
  'about.cols.1.items.5': 'Canva & Krita',
  'about.cols.1.items.6': 'CapCut & Medibang',
  'about.cols.2.label': 'Info',
  'about.cols.2.items.0': 'Bahasa Indonesia / English',
  'about.cols.2.items.1': 'Open For Freelance & Full-time',
  'about.cols.2.items.2': 'Tuban, Jawa Timur, Indonesia',

  // Layanan
  'servicesSection.label': 'Layanan',
  'services.0.title': 'Graphic Design',
  'services.0.desc':
    'Feed · poster, tipografi. Photoshop · infografis · pembuatan mockup · dan lainnya.',
  'services.1.title': 'Video Editing',
  'services.1.desc':
    'Penyuntingan, motion graphics, color grading & sound design. Premiere Pro · After Effects · DaVinci Resolve · dan lainnya.',
  'services.2.title': 'Photo Editing',
  'services.2.desc':
    'Retouch, manipulasi & color grading untuk foto produk dan editorial. Lightroom · Photoshop · dan lainnya.',
  'services.3.title': 'Illustration',
  'services.3.desc':
    'Gaya anime · ilustrasi digital · buku anak · cover buku · logo · icon · maskot · dan lainnya.',
  'services.4.title': 'Animation',
  'services.4.desc': 'Animasi logo · animasi produk · After Effects · dan lainnya.',

  // Kontak
  'contact.label': 'Kontak',
  'contact.title': 'Mari bekerja sama.',
  'contact.email': 'reginaldguzherra@gmail.com',
  'contact.note':
    'Tersedia untuk proyek desain, ilustrasi, animasi, video, dan photo editing. Balasan dalam 1–2 hari kerja.',
  'contact.socials.0.label': 'Instagram',
  'contact.socials.1.label': 'WhatsApp',

  // Footer & CV
  'footer.left': '© {year} Reginald M.R.G. — Studio Kreatif',
  'footer.center': 'Tuban, Jawa Timur, Indonesia',
  'footer.back': 'Kembali ke atas ↑',
  'cv.label': 'Unduh CV',

  // Experience (urutan harus sama dengan content.json -> experience)
  'experience.0.title': 'Kepala Divisi Media dan Branding',
  'experience.0.org': 'Himpunan Mahasiswa Ilmu Lingkungan (HIMAPSILI) UNS',
  'experience.0.period': 'Feb 2025 – Des 2025',
  'experience.0.desc':
    'Membuat logo kabinet dengan Adobe Illustrator & Photoshop. Merancang desain jaket himpunan. Merekam dan menyunting company profile dengan CapCut & After Effects. Mengoordinasikan program kerja staf divisi.',

  'experience.1.title': 'Staff Divisi Media dan Branding',
  'experience.1.org': 'Himpunan Mahasiswa Ilmu Lingkungan (HIMAPSILI) UNS',
  'experience.1.period': 'Feb 2024 – Nov 2024',
  'experience.1.desc':
    'Membuat logo kabinet, desain jaket, dan company profile. Mendokumentasikan kegiatan dan mengoordinasikan program kerja divisi.',

  'experience.2.title': 'Chief Product Officer',
  'experience.2.org': 'Tescopave — Universitas Sebelas Maret',
  'experience.2.period': 'Jun 2025 – Mar 2026',
  'experience.2.desc':
    'Membangun website penyajian informasi Tescopave. Mengelola akun Instagram dan membuat konten publikasi.',

  'experience.3.title': 'Koordinator Divisi Media',
  'experience.3.org': 'ENVICUP (Environmental Cup) 2.0 — UNS',
  'experience.3.period': 'Mei 2025 – Sep 2025',
  'experience.3.desc':
    'Membuat logo ENVICUP dengan Adobe Illustrator. Merekam dan menyunting video teaser & trailer dengan Premiere Pro & CapCut. Menyusun publikasi Instagram dan mengoordinasikan jobdesk.',

  'experience.4.title': 'Koordinator Divisi Media',
  'experience.4.org': 'OXYGENE — UNS',
  'experience.4.period': 'Mei 2024 – Sep 2024',
  'experience.4.desc':
    'Membuat logo OXYGENE dengan Adobe Illustrator dan mascot dengan Medibang. Menyunting video teaser, trailer, dan after movie dengan CapCut.',

  'experience.5.title': 'Staff Divisi Aksi',
  'experience.5.org': "SDG's Center UNS",
  'experience.5.period': 'Mar 2024 – Des 2024',
  'experience.5.desc':
    'Menyusun konsep kegiatan aksi, menjadi ketua pelaksana Project SABI 17(I), serta mengelola program sosial dan lingkungan.',

  'experience.6.title': 'Staff Sosial dan Lingkungan',
  'experience.6.org': 'Badan Eksekutif Mahasiswa (BEM) FMIPA UNS',
  'experience.6.period': 'Mei 2024 – Nov 2024',
  'experience.6.desc':
    'Membuat konsep Video MIPA PEDIA, menyunting dengan CapCut, dan mendokumentasikan acara sosial.',

  'experience.7.title': 'Staff Divisi Media',
  'experience.7.org': 'Diesnatalis FMIPA X DUTA FMIPA UNS',
  'experience.7.period': 'Agu 2024 – Sep 2024',
  'experience.7.desc':
    'Membuat poster publikasi, mendokumentasikan acara, dan menyusun publikasi Instagram.',

  'experience.8.title': 'Koordinator Divisi Media',
  'experience.8.org': "Project SABI (Small Act Big Impact) 17(I) — SDG's Center UNS",
  'experience.8.period': 'Apr 2024 – Mei 2024',
  'experience.8.desc':
    'Menyusun konsep dan rundown proyek, mengoordinasikan anggota, serta membuka donasi program.',
}

src.translations = { id: t }

writeFileSync(join(root, 'public', 'content.json'), JSON.stringify(src, null, 2))

console.log('content.json ditulis ulang')
console.log('  works      :', src.works.length)
console.log('  categories :', src.categories.map((c) => `${c.id}=${c.label}`).join(', '))
console.log('  experience :', src.experience.length)
console.log('  marquee    :', src.marquee.join(', '))
console.log('  translations:', Object.keys(t).length, 'entri')