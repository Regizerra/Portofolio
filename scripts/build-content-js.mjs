/**
 * Bangun ulang src/content.js dari public/content.json, supaya isi
 * bawaan di kode sama persis dengan isi(content.json).
 *
 * Jalankan: node scripts/build-content-js.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const data = JSON.parse(readFileSync(join(root, 'public', 'content.json'), 'utf8'))

const id = data.translations?.id || {}
delete data.translations

const fmt = (value, indent = 0) => {
  const pad = '  '.repeat(indent)
  const padIn = '  '.repeat(indent + 1)

  if (value === null) return 'null'
  if (Array.isArray(value)) {
    if (!value.length) return '[]'
    const items = value.map((v) => `${padIn}${fmt(v, indent + 1)}`)
    return `[\n${items.join(',\n')},\n${pad}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value)
    if (!entries.length) return '{}'
    const items = entries.map(
      ([k, v]) =>
        `${padIn}${/^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k.replace(/'/g, "\\'")}'`}: ${fmt(v, indent + 1)}`,
    )
    return `{\n${items.join(',\n')},\n${pad}}`
  }
if (typeof value === 'string') {
    const escaped = value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
    return `'${escaped}'`
  }
  return String(value)
}

const header = `/* ============================================================
   CONTENT — semua teks & data portfolio.

   File ini DIHASILKAN otomatis oleh:
     node scripts/build-content-js.mjs

   Sumbernya: public/content.json
   Kalau kamu mengubah isi website lewat Custom Mode, jangan
   mengedit file ini secara manual — cukup edit content.json
   (atau pakai menu Reset + Import) lalu jalankan ulang script di atas.
   ============================================================ */

export const defaultContent = ${fmt(data, 0)}

export const idContent = ${fmt(id, 0)}
`

writeFileSync(join(root, 'src', 'content.js'), header)

console.log('src/content.js ditulis ulang')
console.log('  keys  :', Object.keys(data).join(', '))
console.log('  id    :', Object.keys(id).length, 'terjemahan')