/**
 * Ekstrak teks dari file .docx (Word) — tanpa library tambahan.
 * Jalankan:  node scripts/read-docx.mjs "public/CV Reginald Asli.docx"
 */
import { readFileSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'

const path = process.argv[2]
if (!path) {
  console.error('cara pakai: node scripts/read-docx.mjs <file.docx>')
  process.exit(1)
}

const buf = readFileSync(path)

/* ---------- baca zip (cukup untuk entry ZIP_DEFLATE) ---------- */
const entries = {}
{
  // cari End Of Central Directory
  let eocd = -1
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd === -1) {
    console.error('bukan file zip/docx yang valid')
    process.exit(1)
  }
  const count = buf.readUInt16LE(eocd + 10)
  let off = buf.readUInt32LE(eocd + 16)

  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) break
    const method = buf.readUInt16LE(off + 10)
    const compSize = buf.readUInt32LE(off + 20)
    const nameLen = buf.readUInt16LE(off + 28)
    const extraLen = buf.readUInt16LE(off + 30)
    const commentLen = buf.readUInt16LE(off + 32)
    const localOff = buf.readUInt32LE(off + 42)
    const name = buf.slice(off + 46, off + 46 + nameLen).toString('utf8')

    // local file header
    const lNameLen = buf.readUInt16LE(localOff + 26)
    const lExtraLen = buf.readUInt16LE(localOff + 28)
    const dataStart = localOff + 30 + lNameLen + lExtraLen
    const data = buf.slice(dataStart, dataStart + compSize)

    let content
    if (method === 0) content = data
    else if (method === 8) {
      try {
        content = inflateRawSync(data)
      } catch {
        content = Buffer.alloc(0)
      }
    } else content = Buffer.alloc(0)

    entries[name] = content
    off += 46 + nameLen + extraLen + commentLen
  }
}

const xml = (entries['word/document.xml'] || Buffer.alloc(0)).toString('utf8')
if (!xml) {
  console.error('word/document.xml tidak ditemukan')
  process.exit(1)
}

/* ---------- xml -> teks ---------- */
let text = xml
  // baris baru & tab
  .replace(/<w:br[^>]*\/>/g, '\n')
  .replace(/<w:tab[^>]*\/>/g, '\t')
  // tutup paragraf = baris baru
  .replace(/<\/w:p>/g, '\n')
  // pemisah tabel
  .replace(/<\/w:tc>/g, '\t')
  .replace(/<\/w:tr>/g, '\n')
  // ambil isi <w:t>
  .replace(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g, '$1')
  // buang tab lain
  .replace(/<[^>]+>/g, '')

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")

text = decode(text)
text = text
  .split('\n')
  .map((l) => l.replace(/[ \t]{2,}/g, ' ').trim())
  .filter((l) => l.length)
  .join('\n')

console.log(text)
console.log('\n--- karakter:', text.length, '---')