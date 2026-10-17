/**
 * Ekstrak teks dari PDF (font CID + ToUnicode), tanpa library tambahan.
 * Jalankan:  node scripts/read-pdf.mjs public/cv.pdf
 */
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

const raw = readFileSync(process.argv[2] || 'public/cv.pdf').toString('latin1')

/* ---------- 1. Kumpulkan objek ---------- */
const objs = {}
{
  const re = /(\d+)\s+0\s+obj([\s\S]*?)endobj/g
  let m
  while ((m = re.exec(raw)) !== null) objs[m[1]] = m[2]
}

const streamOf = (body) => {
  const i = body.indexOf('stream')
  if (i === -1) return ''
  let s = body.slice(i + 6).replace(/^\r?\n/, '')
  const j = s.lastIndexOf('endstream')
  if (j !== -1) s = s.slice(0, j)
  const b = Buffer.from(s, 'latin1')
  try {
    return inflateSync(b).toString('latin1')
  } catch {
    return b.toString('latin1')
  }
}

/* ---------- 2. Parse ToUnicode CMap ---------- */
const parseCMap = (cmap) => {
  const map = new Map()

  const readHex = (h) => String.fromCharCode(parseInt(h, 16))

  const charRe = /beginbfchar([\s\S]*?)endbfchar/g
  let m
  while ((m = charRe.exec(cmap)) !== null) {
    const pairRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g
    let p
    while ((p = pairRe.exec(m[1])) !== null) {
      const src = p[1]
      const dst = p[2]
      let out = ''
      for (let i = 0; i + 4 <= dst.length + 2; i += 4) {
        out += readHex(dst.slice(i, i + 4))
      }
      map.set(parseInt(src, 16), out)
    }
  }

  const rangeRe = /beginbfrange([\s\S]*?)endbfrange/g
  while ((m = rangeRe.exec(cmap)) !== null) {
    const body = m[1]
    const r1 = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g
    let r
    while ((r = r1.exec(body)) !== null) {
      const lo = parseInt(r[1], 16)
      const hi = parseInt(r[2], 16)
      const dst = parseInt(r[3], 16)
      for (let c = lo; c <= hi; c++) map.set(c, String.fromCharCode(dst + (c - lo)))
    }
    const r2 = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([\s\S]*?)\]/g
    while ((r = r2.exec(body)) !== null) {
      const lo = parseInt(r[1], 16)
      const items = r[3].match(/<([0-9A-Fa-f]+)>/g) || []
      items.forEach((it, i) => {
        const h = it.slice(1, -1)
        let out = ''
        for (let k = 0; k + 4 <= h.length + 2; k += 4) out += readHex(h.slice(k, k + 4))
        map.set(lo + i, out)
      })
    }
  }
  return map
}

/* ---------- 3. nama font resource -> CMap ---------- */
const fontToMap = {}
for (const num of Object.keys(objs)) {
  const body = objs[num]
  const tu = body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/)
  if (!tu) continue
  const cmap = parseCMap(streamOf(objs[tu[1]] || ''))
  const base = (body.match(/\/BaseFont\s*\/([A-Za-z0-9+\-]+)/) || [])[1] || ''
  fontToMap[num] = { cmap, base }
}

// cari pemetaan /F1 -> objek font
const fontRefToMap = {}
const resRe = /\/Font\s*<<([\s\S]*?)>>/g
let rm
while ((rm = resRe.exec(raw)) !== null) {
  const inner = rm[1]
  const pairRe = /\/(\w+)\s+(\d+)\s+0\s+R/g
  let p
  while ((p = pairRe.exec(inner)) !== null) {
    const objNum = p[2]
    const body = objs[objNum] || ''
    const tu = body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/)
    if (tu && fontToMap[tu[1]]) fontRefToMap[`/${p[1]}`] = fontToMap[tu[1]].cmap
  }
}

/* ---------- 4. Ekstrak isi stream ---------- */
const decodeHex = (hex, cmap) => {
  let out = ''
  for (let i = 0; i + 4 <= hex.length; i += 4) {
    const code = parseInt(hex.slice(i, i + 4), 16)
    if (cmap) out += cmap.get(code) ?? ''
    else out += String.fromCharCode(code)
  }
  return out
}

const lines = []
const streamRe = /stream\r?\n?([\s\S]*?)endstream/g
let sm
while ((sm = streamRe.exec(raw)) !== null) {
  let s
  try {
    s = inflateSync(Buffer.from(sm[1], 'latin1')).toString('latin1')
  } catch {
    continue
  }
  if (!/(Tj|TJ)/.test(s)) continue

  let current = null
  const tokRe = /\/(\w+)\s+[\d.]+\s+Tf|<([0-9A-Fa-f\s]+)>|\(((?:\\.|[^\\()])*)\)|(TJ|Tj|Td|TD|T\*|ET)/g
  let t
  let line = ''
  while ((t = tokRe.exec(s)) !== null) {
    if (t[1]) {
      current = fontRefToMap[`/${t[1]}`] || null
    } else if (t[2]) {
      line += decodeHex(t[2].replace(/\s/g, ''), current)
    } else if (t[3] != null) {
      line += t[3]
    } else if (t[4] === 'Td' || t[4] === 'TD' || t[4] === 'T*') {
      if (line.trim()) lines.push(line.trim())
      line = ''
    }
  }
  if (line.trim()) lines.push(line.trim())
}

const text = lines
  .join('\n')
  .replace(/[ \t]{2,}/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .trim()

console.log(text || '(tidak ada teks)')
console.log('\n--- karakter:', text.length, '---')