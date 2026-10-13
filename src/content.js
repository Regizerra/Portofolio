// ============================================================
//  ALL WEBSITE CONTENT IS SET HERE.
//  You normally don't need to edit this file by hand —
//  use "Custom Mode" on the site (type code 2710) and edit
//  visually. When you're done click "Export" to download
//  content.json, drop that file into the  public/
//  folder so every visitor (e.g. on Vercel) sees your changes.
// ============================================================

export const defaultContent = {
  // Empty = the default white theme.
  // If you change colors in Custom Mode the values are stored here
  // (bg = background, ink = text, line = borders).
  theme: {},

  brand: {
    name: 'Your Name',
    mark: '\u00ae',
    tunnel: 'Creative Studio',
  },

  // Caption above the media wall (home page)
  wall: {
    eyebrow: 'Selected Work — Jakarta, Indonesia',
    line1: 'Design',
    line2: 'Illustrate',
    line3: 'Map & Edit',
    link: 'View All Work',
  },

  marquee: [
    'Graphic Design',
    'Illustration',
    'GIS & Mapping',
    'Video Editing',
    'Photo Retouching',
    'Branding',
  ],

  workSection: {
    label: 'Selected Work',
    title: 'All Work',
    note: 'A mix of five disciplines. Pick a category to see the full set.',
  },

  experienceSection: {
    label: 'Experience',
    title: 'Track Record',
    note: 'Roles, collaborations, and the path that got here. Entries appear once you give them a title.',
  },

  // Isi experience lewat Custom Mode: klik "+ Experience", lalu ketik judulnya.
  // Selama title kosong, entri itu tidak akan tampil untuk pengunjung.
  // period: contoh "2023 — Present" atau "Jan 2024 · Des 2024"
  experience: [],

  categories: [
    {
      id: 'graphic-design',
      label: 'Graphic Design',
      desc: 'Brand identity, packaging, posters, and visual assets for print and digital.',
    },
    {
      id: 'illustration',
      label: 'Illustration',
      desc: 'Digital illustration, character design, editorial work, and custom artwork.',
    },
    {
      id: 'video-editing',
      label: 'Video Editing',
      desc: 'Video editing, motion graphics, color grading, and sound design.',
    },
    {
      id: 'gis',
      label: 'GIS',
      desc: 'Spatial data analysis, thematic maps, cartography, and remote sensing.',
    },
    {
      id: 'photo-editing',
      label: 'Photo Editing',
      desc: 'Retouching, manipulation, and color grading for product and editorial photos.',
    },
  ],

  // img: put the file in public/work/ then set  "/work/filename.jpg"
  //       (or just click the thumbnail and pick the file in Custom Mode)
  // video: video/motion file. Put it in public/work/ and use "/work/filename.mp4"
  //        — videos are far too large to be embedded, so they stay as file paths.
  // img: null  -> the work is not published yet, so visitors won't see it
  //             (it still shows in Custom Mode so you can add the image)
  // featured: true -> shows on the home media wall
  works: [
    { title: 'Local Coffee Brand Identity', cat: 'graphic-design', year: 2025, img: null, video: null, featured: true },
    { title: 'Skincare Product Packaging', cat: 'graphic-design', year: 2025, img: null, video: null, featured: true },
    { title: 'Music Festival Poster', cat: 'graphic-design', year: 2024, img: null, video: null, featured: true },
    { title: 'Editorial Illustration Series', cat: 'illustration', year: 2025, img: null, video: null, featured: true },
    { title: 'Mascot Character Illustration', cat: 'illustration', year: 2024, img: null, video: null, featured: true },
    { title: "Children's Book Cover", cat: 'illustration', year: 2024, img: null, video: null, featured: true },
    { title: 'Corporate Profile Video', cat: 'video-editing', year: 2025, img: null, video: null, featured: true },
    { title: 'Campaign Reels Content', cat: 'video-editing', year: 2024, img: null, video: null, featured: true },
    { title: 'Annual Event Aftermovie', cat: 'video-editing', year: 2024, img: null, video: null, featured: true },
    { title: 'Land Use Thematic Map', cat: 'gis', year: 2025, img: null, video: null, featured: true },
    { title: 'Flood Data Visualization', cat: 'gis', year: 2024, img: null, video: null, featured: true },
    { title: 'Interactive Tourism Map', cat: 'gis', year: 2024, img: null, video: null, featured: true },
    { title: 'Product Photo Retouching', cat: 'photo-editing', year: 2025, img: null, video: null, featured: true },
    { title: 'Editorial Photo Color Grading', cat: 'photo-editing', year: 2024, img: null, video: null, featured: true },
    { title: 'Vintage Photo Restoration', cat: 'photo-editing', year: 2023, img: null, video: null, featured: true },
  ],

  about: {
    label: 'About',
    photo: null,
    lead:
      'A multidisciplinary visual creator working between the illustration canvas, spatial maps, and the video timeline. For me, good design is not just beautiful \u2014 it has to carry a message clearly.',
    cols: [
      {
        label: 'Fields',
        items: [
          'Graphic Design & Branding',
          'Digital Illustration',
          'GIS & Spatial Mapping',
          'Video Editing & Motion',
          'Photo Editing & Retouching',
        ],
      },
      {
        label: 'Selected Clients',
        items: ['Local Coffee Shop', 'Architecture Studio', 'Research Institute', 'Fashion Brand', 'Tech Startup'],
      },
      {
        label: 'Info',
        items: ['Jakarta, Indonesia', 'Indonesia / English', 'Freelance & Full-time'],
      },
    ],
  },

  servicesSection: { label: 'Services' },
  services: [
    {
      title: 'Graphic Design & Illustration',
      desc: 'Logo & brand identity, packaging, posters, digital illustration, typography. Photoshop \u00b7 Illustrator \u00b7 InDesign \u00b7 Procreate.',
    },
    {
      title: 'GIS & Mapping',
      desc: 'Spatial data analysis, thematic maps, cartography & remote sensing. ArcGIS \u00b7 QGIS \u00b7 Google Earth Engine.',
    },
    {
      title: 'Video Editing',
      desc: 'Editing, motion graphics, color grading & sound design. Premiere Pro \u00b7 After Effects \u00b7 DaVinci Resolve.',
    },
    {
      title: 'Photo Editing',
      desc: 'Retouching, manipulation & color grading for product and editorial photos. Lightroom \u00b7 Photoshop.',
    },
  ],

  contact: {
    label: 'Contact',
    title: "Let's work together.",
    email: 'email@you.com',
    note: 'Available for design, illustration, mapping, video & photo editing projects. Replies within 1\u20132 business days.',
    socials: [
      { label: 'Instagram', url: 'https://www.instagram.com/' },
      { label: 'Behance', url: 'https://www.behance.net/' },
    ],
  },

  // Letakkan file CV (PDF) di folder public/ lalu isi path-nya di sini.
  cv: {
    label: 'Download CV',
    href: '/cv.pdf',
  },

  footer: {
    left: '\u00a9 {year} Your Name \u2014 Creative Studio',
    center: 'Jakarta, Indonesia',
    back: 'Back to top \u2191',
  },
}

/* ============================================================
   BAHASA INDONESIA
   Dipakai saat pengunjung menekan tombol "ID".
   Kalau ada teks yang belum diterjemahkan, sistem otomatis
   memakai versi bahasa Inggris.
   ============================================================ */

export const idContent = {
  wall: {
    eyebrow: 'Karya Pilihan — Jakarta, Indonesia',
    line1: 'Desain',
    line2: 'Ilustrasi',
    line3: 'Petakan & Edit',
    link: 'Lihat Semua Karya',
  },

  marquee: [
    'Desain Grafis',
    'Ilustrasi',
    'GIS & Pemetaan',
    'Video Editing',
    'Photo Retouching',
    'Branding',
  ],

  workSection: {
    label: 'Karya Pilihan',
    title: 'Semua Karya',
    note: 'Campuran dari lima bidang. Pilih kategori untuk melihat versi lengkapnya.',
  },

  experienceSection: {
    label: 'Pengalaman',
    title: 'Rekam Jejak',
    note: 'Peran, kolaborasi, dan perjalanan sampai ke titik ini. Entri baru muncul setelah kamu memberi judulnya.',
  },

  categories: [
    {
      id: 'graphic-design',
      label: 'Desain Grafis',
      desc: 'Identitas brand, kemasan, poster, dan materi visual cetak maupun digital.',
    },
    {
      id: 'illustration',
      label: 'Ilustrasi',
      desc: 'Ilustrasi digital, karakter, editorial, dan artwork custom.',
    },
    {
      id: 'video-editing',
      label: 'Video Editing',
      desc: 'Penyuntingan video, motion graphic, color grading, dan sound design.',
    },
    {
      id: 'gis',
      label: 'GIS',
      desc: 'Pengolahan data spasial, peta tematik, kartografi, dan remote sensing.',
    },
    {
      id: 'photo-editing',
      label: 'Photo Editing',
      desc: 'Retouching, manipulasi, dan color grading foto produk maupun editorial.',
    },
  ],

  about: {
    label: 'Tentang',
    lead:
      'Kreator visual multidisiplin yang bergerak antara kanvas ilustrasi, peta spasial, dan timeline video. Bagi saya, desain yang baik bukan sekadar indah \u2014 ia harus menyampaikan pesan dengan jelas.',
    cols: [
      {
        label: 'Bidang',
        items: [
          'Desain Grafis & Branding',
          'Ilustrasi Digital',
          'GIS & Pemetaan Spasial',
          'Video Editing & Motion',
          'Photo Editing & Retouching',
        ],
      },
      {
        label: 'Klien Terpilih',
        items: ['Kedai Kopi Lokal', 'Studio Arsitektur', 'Lembaga Riset', 'Brand Fashion', 'Startup Teknologi'],
      },
      {
        label: 'Info',
        items: ['Jakarta, Indonesia', 'Indonesia / English', 'Freelance & Full-time'],
      },
    ],
  },

  servicesSection: { label: 'Layanan' },
  services: [
    {
      title: 'Desain Grafis & Ilustrasi',
      desc: 'Logo & identitas brand, kemasan, poster, ilustrasi digital, tipografi. Photoshop \u00b7 Illustrator \u00b7 InDesign \u00b7 Procreate.',
    },
    {
      title: 'GIS & Pemetaan',
      desc: 'Pengolahan data spasial, peta tematik, kartografi & remote sensing. ArcGIS \u00b7 QGIS \u00b7 Google Earth Engine.',
    },
    {
      title: 'Video Editing',
      desc: 'Penyuntingan, motion graphic, color grading & sound design. Premiere Pro \u00b7 After Effects \u00b7 DaVinci Resolve.',
    },
    {
      title: 'Photo Editing',
      desc: 'Retouching, manipulasi & color grading foto produk maupun editorial. Lightroom \u00b7 Photoshop.',
    },
  ],

  contact: {
    label: 'Kontak',
    title: 'Mari bekerja sama.',
    note: 'Tersedia untuk proyek desain, ilustrasi, pemetaan, video & photo editing. Balasan dalam 1\u20132 hari kerja.',
  },

  cv: {
    label: 'Unduh CV',
  },

  footer: {
    back: 'Kembali ke atas \u2191',
  },
}
