/**
 * Audit: teks mana di index.html yang belum punya terjemahan Indonesia.
 * Jalankan: node scripts/audit-i18n.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultContent, idContent } from '../src/content.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const html = readFileSync(join(root, 'index.html'), 'utf8')

/* peta datar idContent, sama seperti yang dilakukan main.js saat runtime */
const flatten = (value, prefix = '', out = {}) => {
  if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${prefix}.${i}`, out))
  else if (value && typeof value === 'object')
    Object.entries(value).forEach(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k, out))
  else if (typeof value === 'string') out[prefix] = value
  return out
}
const id = flatten(idContent)

/* semua path data-edit di HTML */
const paths = [...html.matchAll(/data-edit="([^"]+)"/g)].map((m) => m[1])

const uniq = [...new Set(paths)]
const missing = uniq.filter((p) => !(p in id))

console.log('Total data-edit di HTML :', uniq.length)
console.log('Sudah ada terjemahan   :', uniq.length - missing.length)
console.log('Belum ada terjemahan   :', missing.length)
if (missing.length) {
  console.log('\nDaftar:')
  missing.forEach((m) => console.log('  -', m))
}

/* cek juga path yang ada di HTML tapi tidak ada di content.js sama sekali */
const getByPath = (obj, path) =>
  path.split('.').reduce((a, k) => (a == null ? a : a[k]), obj)

console.log('\nCek validitas path:')
uniq.forEach((p) => {
  const en = p in id ? id[p] : getByPath(defaultContent, p)
  if (en == null) console.log('  TIDAK ADA di content.js:', p)
})