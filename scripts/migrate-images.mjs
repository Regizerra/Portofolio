/**
 * Pindahkan gambar base64 di dalam content.json ke file sungguhan
 * di public/work/, lalu ganti isinya menjadi path seperti
 * "/work/nama-file.jpg".
 *
 * Jalankan:  node scripts/migrate-images.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = join(root, 'public', 'content.json')
const workDir = join(root, 'public', 'work')

if (!existsSync(jsonPath)) {
  console.error('public/content.json tidak ditemukan')
  process.exit(1)
}
if (!existsSync(workDir)) mkdirSync(workDir, { recursive: true })

const content = JSON.parse(readFileSync(jsonPath, 'utf8'))

const used = new Set()
const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image'

const extOf = (dataUrl) => {
  const m = /^data:image\/([a-zA-Z0-9.+-]+);base64,/.exec(dataUrl)
  const type = m ? m[1] : 'png'
  if (type === 'jpeg') return 'jpg'
  if (type === 'svg+xml') return 'svg'
  return type
}

/** Simpan base64 -> file, kembalikan path publiknya. */
const save = (dataUrl, baseName) => {
  const m = /^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl)
  if (!m) return null

  let ext = extOf(dataUrl)
  if (ext === 'svg+xml') ext = 'svg'
  if (ext === 'jpg') ext = 'jpg'
  // WebP/PNG disimpan apa adanya — browser modern sudah dua-duanya bisa
  if (!['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) ext = 'png'

  let name = `${slug(baseName)}.${ext}`
  let n = 2
  while (used.has(name)) {
    name = `${slug(baseName)}-${n}.${ext}`
    n += 1
  }
  used.add(name)

  const buf = Buffer.from(m[2], 'base64')
  writeFileSync(join(workDir, name), buf)
  return { path: `/work/${name}`, bytes: buf.length }
}

let migrated = 0
let freed = 0
const report = []

/* ---------- karya ---------- */
content.works = (content.works || []).map((w, i) => {
  if (!w.img || !w.img.startsWith('data:image/')) return w
  const r = save(w.img, w.title || `work-${i + 1}`)
  if (!r) return w
  migrated += 1
  freed += w.img.length - r.path.length
  report.push(`  ${w.title}  ->  ${r.path}`)
  return { ...w, img: r.path }
})

/* ---------- pengalaman ---------- */
content.experience = (content.experience || []).map((e, i) => {
  if (!e.img || !e.img.startsWith('data:image/')) return e
  const r = save(e.img, e.title || e.org || `experience-${i + 1}`)
  if (!r) return e
  migrated += 1
  freed += e.img.length - r.path.length
  report.push(`  ${e.title || e.org}  ->  ${r.path}`)
  return { ...e, img: r.path }
})

/* ---------- foto about ---------- */
if (content.about?.photo && content.about.photo.startsWith('data:image/')) {
  const r = save(content.about.photo, 'about')
  if (r) {
    migrated += 1
    freed += content.about.photo.length - r.path.length
    report.push(`  about  ->  ${r.path}`)
    content.about.photo = r.path
  }
}

/* ---------- stiker ---------- */
content.stickers = (content.stickers || []).map((s, i) => {
  if (!s.src || !s.src.startsWith('data:image/')) return s
  const r = save(s.src, `stiker-${i + 1}`)
  if (!r) return s
  migrated += 1
  freed += s.src.length - r.path.length
  report.push(`  stiker ${i + 1}  ->  ${r.path}`)
  return { ...s, src: r.path }
})

writeFileSync(jsonPath, JSON.stringify(content, null, 2))

console.log('Gambar yang dipindahkan:')
console.log(report.join('\n'))
console.log('')
console.log(`Total file : ${migrated}`)
console.log(`JSON      : ${(readFileSync(jsonPath).length / 1024).toFixed(0)} KB`)