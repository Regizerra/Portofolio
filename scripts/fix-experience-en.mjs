/**
 * Terjemahkan isi Experience ke bahasa Inggris yang benar.
 *
 * Jalankan: node scripts/fix-experience-en.mjs
 * (harus dijalankan SETELAH apply-content.mjs, karena file itu
 *  menulis ulang content.json dari "content baru.json")
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const path = join(root, 'public', 'content.json')
const data = JSON.parse(readFileSync(path, 'utf8'))

/* Versi bahasa Inggris (dipakai untuk mode EN). */
const EN = [
  {
    title: 'Head of Media and Branding Division',
    org: 'Environmental Science Student Association (HIMAPSILI) — UNS',
    period: 'Feb 2025 – Dec 2025',
    desc: 'Created the cabinet logo in Adobe Illustrator and Photoshop. Designed the association jacket. Filmed and edited the company profile with CapCut and After Effects. Coordinated the division’s work programme.',
  },
  {
    title: 'Staff — Media and Branding Division',
    org: 'Environmental Science Student Association (HIMAPSILI) — UNS',
    period: 'Feb 2024 – Nov 2024',
    desc: 'Created the cabinet logo, jacket design, and company profile. Documented events and coordinated the division’s work programme.',
  },
  {
    title: 'Chief Product Officer',
    org: 'Tescopave — Universitas Sebelas Maret',
    period: 'Jun 2025 – Mar 2026',
    desc: 'Built the Tescopave information website. Managed the Instagram account and produced publishing content.',
  },
  {
    title: 'Coordinator — Media Division',
    org: 'ENVICUP (Environmental Cup) 2.0 — UNS',
    period: 'May 2025 – Sep 2025',
    desc: 'Created the ENVICUP logo in Adobe Illustrator. Recorded and edited the teaser and trailer videos with Premiere Pro and CapCut. Produced Instagram content and coordinated task distribution.',
  },
  {
    title: 'Coordinator — Media Division',
    org: 'OXYGENE — UNS',
    period: 'May 2024 – Sep 2024',
    desc: 'Created the OXYGENE logo in Adobe Illustrator and the mascot in Medibang. Edited the teaser, trailer, and after movie with CapCut.',
  },
  {
    title: 'Staff — Action Division',
    org: "SDG's Center — UNS",
    period: 'Mar 2024 – Dec 2024',
    desc: 'Planned the concept for action programmes, led Project SABI 17(I) as event chair, and managed social and environmental programmes.',
  },
  {
    title: 'Staff — Social and Environment Ministry',
    org: 'Student Executive Board (BEM) FMIPA — UNS',
    period: 'May 2024 – Nov 2024',
    desc: 'Developed the concept for Video MIPA PEDIA, edited it in CapCut, and documented the social events.',
  },
  {
    title: 'Staff — Media Division',
    org: 'Diesnatalis FMIPA X DUTA FMIPA — UNS',
    period: 'Aug 2024 – Sep 2024',
    desc: 'Created event posters, documented the events, and produced Instagram content.',
  },
  {
    title: 'Coordinator — Media Division',
    org: "Project SABI (Small Act Big Impact) 17(I) — SDG's Center UNS",
    period: 'Apr 2024 – May 2024',
    desc: 'Planned the project concept and rundown, coordinated members, and opened the programme’s donation drive.',
  },
]

if (data.experience.length !== EN.length) {
  console.error(
    `Jumlah entri tidak sama: content.json ${data.experience.length}, terjemahan ${EN.length}`,
  )
  process.exit(1)
}

data.experience = data.experience.map((entry, i) => ({ ...entry, ...EN[i] }))

writeFileSync(path, JSON.stringify(data, null, 2))

console.log('Experience (EN) diperbaiki:', data.experience.length, 'entri')
data.experience.forEach((e, i) => console.log(`  [${i}] ${e.title}`))