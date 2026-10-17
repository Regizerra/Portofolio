/**
 * Gabungkan content.json (yang punya karya & gambar) dengan data terbaru
 * dari src/content.js (Experience, About, kontak, brand).
 *
 * Yang di-keeping dari file JSON : works, categories, stickers, crop, tema
 * Yang diambil dari content.js   : experience, about, contact, brand, teks halaman
 *
 * Jalankan:  node scripts/merge-content.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultContent, idContent } from '../src/content.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = join(root, 'public', 'content.json')

const file = JSON.parse(readFileSync(jsonPath, 'utf8'))
const src = defaultContent

/* ---------- konten yang selalu ikut dari content.js ---------- */
const fromSource = [
  'brand',
  'wall',
  'workSection',
  'experienceSection',
  'experience',
  'about',
  'servicesSection',
  'services',
  'aboutSection',
  'footer',
  'contact',
  'cv',
  'translations',
]

for (const key of fromSource) {
  if (src[key] !== undefined) file[key] = structuredClone(src[key])
}

/* ---------- terjemahan ----------
   translations.id adalah peta datar. Kita tulis ulang dari idContent
   (sumber bahasa Indonesia) lalu pertahankan override yang sudah
   disimpan sebelumnya di file JSON. */
const flatten = (value, prefix = '', out = {}) => {
  if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${prefix}.${i}`, out))
  else if (value && typeof value === 'object')
    Object.entries(value).forEach(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k, out))
  else if (typeof value === 'string') out[prefix] = value
  return out
}

const overrides = (file.translations && file.translations.id) || {}
// idContent menang supaya terjemahan di src/content.js yang dipakai
// (file JSON hanya menyumbang kunci yang belum ada di idContent).
file.translations = { id: { ...overrides, ...flatten(idContent) } }

/* ---------- pastikan array penting ada ---------- */
for (const key of ['works', 'categories', 'experience', 'services', 'stickers']) {
  if (!Array.isArray(file[key])) file[key] = []
}

writeFileSync(jsonPath, JSON.stringify(file, null, 2))

const size = (readFileSync(jsonPath).length / 1024).toFixed(0)
console.log('content.json digabung')
console.log('  works      :', file.works.length)
console.log('  categories :', file.categories.length)
console.log('  experience :', file.experience.length)
console.log('  about cols :', file.about.cols.length)
console.log('  ukuran     :', size, 'KB')