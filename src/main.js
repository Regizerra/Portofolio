import './style.css'
import { defaultContent, idContent } from './content.js'
import { initEditor } from './editor.js'
import { state } from './state.js'

const STORAGE_KEY = 'portfolio-content-v1'
const LANG_KEY = 'portfolio-lang'

/* ---------- UI strings (bagian yang tidak ada di content.js) ---------- */
const UI = {
  en: {
    work: 'Work',
    experience: 'Experience',
    about: 'About',
    menu: 'Menu',
    close: 'Close',
    index: 'Index',
    empty: 'No projects published yet.',
    xpEmpty: 'Nothing added yet.',
    preview: 'Close preview',
  },
  id: {
    work: 'Karya',
    experience: 'Pengalaman',
    about: 'Tentang',
    menu: 'Menu',
    close: 'Tutup',
    index: 'Beranda',
    empty: 'Belum ada karya yang dipublikasikan.',
    xpEmpty: 'Belum ada yang ditambahkan.',
    preview: 'Tutup pratinjau',
  },
}

const lang = { current: 'en' }

/* ---------- Utils ---------- */
const clone = (v) => JSON.parse(JSON.stringify(v))

const isPlainObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)

const deepMerge = (base, over) => {
  if (Array.isArray(over)) return clone(over)
  if (isPlainObject(over) && isPlainObject(base)) {
    const out = { ...base }
    for (const key of Object.keys(over)) out[key] = deepMerge(base[key], over[key])
    return out
  }
  return over
}

const getByPath = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)

/* ---------- Translations ----------
   path ditulis sebagai "t:wall.line1" supaya isinya diambil dari
   translations.id, dan otomatis jatuh ke teks Inggris kalau belum ada. */
const T_PREFIX = 't:'

const ed = (path) => (lang.current === 'id' ? T_PREFIX + path : path)

/* Terjemahan disimpan sebagai peta datar: { "categories.0.label": "Desain Grafis" }
   supaya indeks tetap sinkron although karya bertambah / berkurang. */
const flattenI18n = (value, prefix = '', out = {}) => {
  if (Array.isArray(value)) {
    value.forEach((v, i) => flattenI18n(v, `${prefix}.${i}`, out))
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([k, v]) => flattenI18n(v, prefix ? `${prefix}.${k}` : k, out))
  } else if (typeof value === 'string') {
    out[prefix] = value
  }
  return out
}

const readPath = (path) => {
  if (path.startsWith(T_PREFIX)) {
    const key = path.slice(T_PREFIX.length)
    const table = content.translations?.id || {}
    return table[key] ?? getByPath(content, key)
  }
  return getByPath(content, path)
}

const writePath = (path, value) => {
  if (path.startsWith(T_PREFIX)) {
    const key = path.slice(T_PREFIX.length)
    content.translations = content.translations || {}
    content.translations.id = content.translations.id || {}
    content.translations.id[key] = value
    return
  }
  setByPath(content, path, value)
}

const setByPath = (obj, path, value) => {
  const keys = path.split('.')
  const last = keys.pop()
  const target = keys.reduce((acc, key) => acc[key], obj)
  if (target) target[last] = value
}

const esc = (str) =>
  String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const pad = (n) => String(n).padStart(2, '0')
const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

const tonePair = (t) => {
  const a = clamp(t, 8, 92)
  return { a: `hsl(0 0% ${a}%)`, b: `hsl(0 0% ${clamp(a - 30, 4, 92)}%)` }
}

/* ---------- Content state ---------- */
let content = clone(defaultContent)

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
    return true
  } catch (err) {
    console.warn('Could not save (storage full?)', err)
    window.dispatchEvent(new CustomEvent('storage-full'))
    return false
  }
}

const loadLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const clearLocal = () => localStorage.removeItem(STORAGE_KEY)

/* ---------- Theme ---------- */
const hexToRgba = (hex, alpha) => {
  const h = String(hex).replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  if (Number.isNaN(n)) return `rgba(0, 0, 0, ${alpha})`
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const applyTheme = () => {
  const root = document.documentElement.style
  const t = content.theme || {}
  ;['--bg', '--ink', '--ink-soft', '--line'].forEach((v) => root.removeProperty(v))
  if (t.bg) root.setProperty('--bg', t.bg)
  if (t.ink) {
    root.setProperty('--ink', t.ink)
    root.setProperty('--ink-soft', hexToRgba(t.ink, 0.45))
    root.setProperty('--ink-faint', hexToRgba(t.ink, 0.28))
  }
  if (t.line) root.setProperty('--line', hexToRgba(t.line, 0.16))
}

/* ---------- Apply editable text ---------- */
const applyContentToDOM = () => {
  const year = String(new Date().getFullYear())
  document.querySelectorAll('[data-edit]').forEach((el) => {
    const path = el.dataset.edit
    if (!path || path.startsWith('__')) return
    if (el === document.activeElement) return
    const value = readPath(path)
    if (value != null) el.textContent = String(value).replace('{year}', year)
  })
}

/* ---------- Language ---------- */
const setLang = (l) => {
  if (l !== 'en' && l !== 'id') return
  lang.current = l
  try {
    localStorage.setItem(LANG_KEY, l)
  } catch {
    /* storage penuh, abaikan saja */
  }
  document.documentElement.lang = l
  renderAll()
}

const applyLang = () => {
  const d = UI[lang.current] || UI.en
  document.documentElement.lang = lang.current

  // pastikan path ter-prefix "t:" saat bahasa ID (elemen statis di index.html)
  document.querySelectorAll('[data-edit]').forEach((el) => {
    const p = el.dataset.edit
    if (!p) return
    const base = p.startsWith(T_PREFIX) ? p.slice(T_PREFIX.length) : p
    el.dataset.edit = ed(base)
  })

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = d[el.dataset.i18n]
    if (v != null) el.textContent = v
  })
  document.querySelectorAll('[data-lang-btn]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.langBtn === lang.current)
  })
  const closeBtn = document.querySelector('.lightbox-close')
  if (closeBtn) closeBtn.setAttribute('aria-label', d.preview)
  document.querySelectorAll('.back-link').forEach((el) => {
    el.textContent = `\u2190 ${d.index}`
  })
  updateDocTitle()
}

/* ---------- Shared helpers ---------- */
const catIndex = (id) => content.categories.findIndex((c) => c.id === id)
const catLabel = (id) => content.categories.find((c) => c.id === id)?.label ?? id

const attachImgFallback = (img, applyGradient) => {
  img.addEventListener('error', () => {
    img.remove()
    applyGradient()
  })
}

const renderGrid = (container, items, mapper) => {
  container.innerHTML = ''
  items.forEach((item, n) => container.appendChild(mapper(item, n)))
}

/* ---------- Lightbox ---------- */
const lightbox = (() => {
  const box = document.createElement('div')
  box.className = 'lightbox'
  box.id = 'lightbox'
  box.hidden = true
  box.setAttribute('role', 'dialog')
  box.setAttribute('aria-modal', 'true')
  box.setAttribute('aria-label', 'Project preview')
  box.innerHTML = `
    <button class="lightbox-close label" type="button" aria-label="Close preview">Close ✕</button>
    <figure class="lightbox-figure">
      <img class="lightbox-img" alt="" />
      <figcaption class="lightbox-cap">
        <h3 class="lightbox-title"></h3>
        <span class="label lightbox-meta"></span>
      </figcaption>
    </figure>`
  document.body.appendChild(box)

  const img = box.querySelector('.lightbox-img')
  const title = box.querySelector('.lightbox-title')
  const meta = box.querySelector('.lightbox-meta')
  const closeBtn = box.querySelector('.lightbox-close')
  let lastFocus = null

  const close = () => {
    if (box.hidden) return
    box.classList.add('hide')
    document.body.style.overflow = ''
    setTimeout(() => {
      box.hidden = true
    }, 280)
    if (lastFocus) lastFocus.focus()
  }

  img.addEventListener('error', () => {
    if (!box.hidden) close()
  })

  const open = (work) => {
    lastFocus = document.activeElement
    img.src = work.img
    img.alt = work.title
    title.textContent = work.title
    meta.textContent = `${work.year} · ${catLabel(work.cat)}`
    box.hidden = false
    requestAnimationFrame(() => box.classList.remove('hide'))
    document.body.style.overflow = 'hidden'
    closeBtn.focus()
  }

  box.addEventListener('click', (e) => {
    if (e.target === box) close()
  })
  closeBtn.addEventListener('click', close)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  })

  return { open, close }
})()

/* ---------- Work cards ---------- */
const createWorkCard = (work, i, num = i + 1) => {
  const { a, b } = tonePair(74 - (i % 5) * 12)
  const hasImg = !!work.img
  const card = document.createElement('article')
  card.className = 'work-card'
  card.dataset.work = String(i)
  card.tabIndex = 0
  card.setAttribute('role', 'button')
  card.setAttribute(
    'aria-label',
    hasImg
      ? `View ${work.title} fullscreen`
      : `${work.title}, ${work.year}, ${catLabel(work.cat)}`,
  )

  const options = content.categories
    .map(
      (c) => `<option value="${esc(c.id)}"${c.id === work.cat ? ' selected' : ''}>${esc(c.label)}</option>`,
    )
    .join('')

  card.innerHTML = `
    <div class="work-thumb${hasImg ? ' has-img' : ''}" data-img="works.${i}.img"
         style="--a:${a};--b:${b}">
      ${hasImg ? `<img class="work-img" alt="${esc(work.title)}" src="${esc(work.img)}">` : ''}
      <span class="work-thumb-index">${pad(num)}</span>
    </div>
    <div class="work-card-meta">
      <h3 class="work-card-title" data-edit="${ed(`works.${i}.title`)}">${esc(work.title)}</h3>
      <span class="label work-card-sub">
        <span data-edit="${ed(`works.${i}.year`)}">${esc(work.year)}</span> ·
        <a class="work-card-cat" href="#/work/${esc(work.cat)}">${esc(catLabel(work.cat))}</a>
      </span>
    </div>
    <div class="edit-only work-edit">
      <select class="edit-select" data-action="work-cat" data-index="${i}">${options}</select>
      <label class="edit-check">
        <input type="checkbox" data-action="work-featured" data-index="${i}"${work.featured ? ' checked' : ''}>
        Wall
      </label>
      <button class="edit-ctrl" type="button" data-action="del" data-list="works" data-index="${i}">Delete</button>
    </div>
  `

  if (hasImg) {
    attachImgFallback(card.querySelector('.work-img'), () => {
      const th = card.querySelector('.work-thumb')
      th.classList.remove('has-img')
      th.style.setProperty('--a', a)
      th.style.setProperty('--b', b)
    })
  }

  return card
}

/* ---------- Media wall ---------- */
const createWallTile = (work, i) => {
  const { a, b } = tonePair(76 - (i % 6) * 11)
  const tile = document.createElement('a')
  tile.className = 'wall-tile'
  tile.href = `#/work/${work.cat}`
  tile.dataset.img = `works.${i}.img`
  tile.dataset.work = String(i)
  tile.setAttribute(
    'aria-label',
    work.img ? `View ${work.title} fullscreen` : `${work.title}, ${catLabel(work.cat)}`,
  )
  tile.style.setProperty('--a', a)
  tile.style.setProperty('--b', b)
  tile.innerHTML = `
    ${work.img ? `<img class="wall-img" alt="${esc(work.title)}" src="${esc(work.img)}">` : ''}
    <span class="wall-tile-label">${esc(catLabel(work.cat))}</span>
  `
  if (work.img) {
    attachImgFallback(tile.querySelector('.wall-img'), () => {
      const img = tile.querySelector('.wall-img')
      if (img) img.remove()
    })
  }
  return tile
}

const wallCap = () => {
  const w = window.innerWidth
  if (w <= 740) return 3
  if (w <= 900) return 4
  return 6
}

const wallColCount = (n) => Math.max(1, Math.min(wallCap(), Math.floor(n / 3)))

/* ---------- Which works are visible ---------- */
// Pengunjung hanya melihat karya yang sudah punya gambar.
// Di Custom Mode semua karya tetap tampil supaya gambarnya bisa ditambah.
const isPublished = (work) => state.editMode || !!work.img

const renderWall = () => {
  const wrap = document.querySelector('#wall-cols')
  wrap.innerHTML = ''
  wrap.style.gridTemplateColumns = ''
  wrap.dataset.cols = '0'

  const items = content.works
    .map((w, i) => ({ w, i }))
    .filter(({ w }) => w.featured !== false && isPublished(w))

  if (!items.length) return

  const colCount = wallColCount(items.length)
  const columns = Array.from({ length: colCount }, () => [])
  items.forEach((item, k) => columns[k % colCount].push(item))

  const visible = columns.filter((c) => c.length)
  wrap.style.gridTemplateColumns = `repeat(${visible.length}, 1fr)`
  wrap.dataset.cols = String(visible.length)

  visible.forEach((list, ci) => {
    const col = document.createElement('div')
    col.className = 'wall-col' + (ci % 2 ? ' reverse' : '')

    const track = document.createElement('div')
    track.className = 'wall-track'
    track.style.animationDuration = `${40 + ci * 7}s`

    list.forEach(({ w, i }) => track.appendChild(createWallTile(w, i)))
    list.forEach(({ w, i }) => track.appendChild(createWallTile(w, i)))

    col.appendChild(track)
    wrap.appendChild(col)
  })
}

/* ---------- Work page ---------- */
const renderWork = () => {
  const catId = state.activeCategory
  const titleEl = document.querySelector('#work-title')
  const noteEl = document.querySelector('#work-note')
  const tabs = document.querySelector('#work-tabs')

  if (catId && catIndex(catId) !== -1) {
    const idx = catIndex(catId)
    const meta = content.categories[idx]
    titleEl.textContent = meta.label
    noteEl.textContent = meta.desc
    titleEl.dataset.edit = ed(`categories.${idx}.label`)
    noteEl.dataset.edit = ed(`categories.${idx}.desc`)
  } else {
    titleEl.textContent = content.workSection.title
    noteEl.textContent = content.workSection.note
    titleEl.dataset.edit = ed('workSection.title')
    noteEl.dataset.edit = ed('workSection.note')
  }

  tabs.innerHTML = ''
  const all = document.createElement('a')
  all.className = 'work-tab' + (catId ? '' : ' is-active')
  all.href = '#/work'
  all.textContent = 'All'
  tabs.appendChild(all)

  content.categories.forEach((c, ci) => {
    const a = document.createElement('a')
    a.className = 'work-tab' + (c.id === catId ? ' is-active' : '')
    a.href = `#/work/${c.id}`
    a.textContent = c.label
    a.dataset.edit = ed(`categories.${ci}.label`)
    tabs.appendChild(a)
  })

  const addWork = document.createElement('button')
  addWork.className = 'edit-ctrl edit-only'
  addWork.type = 'button'
  addWork.dataset.action = 'add'
  addWork.dataset.list = 'works'
  addWork.textContent = '+ Work'
  tabs.appendChild(addWork)

  const list = content.works
    .map((w, i) => ({ w, i }))
    .filter(({ w }) => (!catId || w.cat === catId) && isPublished(w))

  const grid = document.querySelector('#work-grid')
  renderGrid(grid, list, ({ w, i }, n) => createWorkCard(w, i, n + 1))

  const empty = document.querySelector('#work-empty')
  if (empty) empty.hidden = list.length > 0
}

/* ---------- Experience page ---------- */
// Entri tanpa judul belum "dipublikasikan", sama seperti karya tanpa gambar.
// Di Custom Mode semuanya tetap tampil supaya bisa langsung diisi.
const isPublishedXp = (item) => state.editMode || String(item.title || '').trim() !== ''

const createExperienceRow = (item, i) => {
  const hasImg = !!item.img
  const hasOrg = String(item.org || '').trim() !== ''
  const hasPeriod = String(item.period || '').trim() !== ''
  const row = document.createElement('article')
  row.className = 'xp-row'

  row.innerHTML = `
    <span class="xp-index">${pad(i + 1)}</span>
    <div class="xp-body">
      <h2 class="xp-title" data-edit="${ed(`experience.${i}.title`)}">${esc(item.title || '')}</h2>
      <p class="label xp-meta${!hasOrg && !hasPeriod ? ' is-empty' : ''}">
        <span data-edit="${ed(`experience.${i}.org`)}">${esc(item.org || '')}</span>
        <span class="xp-dot${hasOrg && hasPeriod ? '' : ' is-dim'}" aria-hidden="true">·</span>
        <span data-edit="${ed(`experience.${i}.period`)}">${esc(item.period || '')}</span>
      </p>
      <p class="body xp-desc" data-edit="${ed(`experience.${i}.desc`)}">${esc(item.desc || '')}</p>
      <div class="edit-only xp-edit">
        <button class="edit-ctrl" type="button" data-action="del" data-list="experience" data-index="${i}">Delete</button>
      </div>
    </div>
    <figure class="xp-thumb${hasImg ? ' has-img' : ' is-empty'}" data-img="experience.${i}.img">
      ${hasImg ? `<img class="xp-img" alt="${esc(item.title)}" src="${esc(item.img)}">` : ''}
    </figure>
  `

  if (hasImg) {
    attachImgFallback(row.querySelector('.xp-img'), () => {
      const th = row.querySelector('.xp-thumb')
      th.classList.remove('has-img')
      th.classList.add('is-empty')
    })
  }

  return row
}

const renderExperience = () => {
  const list = document.querySelector('#xp-list')
  if (!list) return

  const items = content.experience
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => isPublishedXp(e))

  list.innerHTML = ''
  items.forEach(({ e, i }) => list.appendChild(createExperienceRow(e, i)))

  const empty = document.querySelector('#xp-empty')
  if (empty) empty.hidden = items.length > 0
}

/* ---------- About page ---------- */
const renderAbout = () => {
  const body = document.querySelector('#about-body')

  const cols = content.about.cols
    .map((col, ci) => {
      const items = col.items
        .map(
          (it, ii) => `
        <li class="edit-li">
          <span data-edit="${ed(`about.cols.${ci}.items.${ii}`)}">${esc(it)}</span>
          <button class="edit-ctrl edit-only" type="button" data-action="del"
            data-list="about.cols.${ci}.items" data-index="${ii}">×</button>
        </li>`,
        )
        .join('')
      return `
      <div>
        <p class="label"><span data-edit="${ed(`about.cols.${ci}.label`)}">${esc(col.label)}</span></p>
        <ul class="plain-list">
          ${items}
          <li class="edit-only"><button class="edit-ctrl" type="button" data-action="add"
            data-list="about.cols.${ci}.items">+ Item</button></li>
        </ul>
      </div>`
    })
    .join('')

  const services = content.services
    .map(
      (s, i) => `
    <li>
      <span class="service-index">${pad(i + 1)}</span>
      <div>
        <h3 class="service-title" data-edit="${ed(`services.${i}.title`)}">${esc(s.title)}</h3>
        <p class="body service-row-desc" data-edit="${ed(`services.${i}.desc`)}">${esc(s.desc)}</p>
        <div class="edit-only">
          <button class="edit-ctrl" type="button" data-action="del" data-list="services" data-index="${i}">Delete</button>
        </div>
      </div>
    </li>`,
    )
    .join('')

  const socials = content.contact.socials
    .map(
      (s, i) => `
    <span class="social-edit">
      <a class="link" href="${esc(s.url)}" target="_blank" rel="noreferrer"
         data-edit="${ed(`contact.socials.${i}.label`)}">${esc(s.label)}</a>
      <input class="edit-input edit-only" data-action="social-url" data-index="${i}"
        value="${esc(s.url)}" placeholder="https://...">
      <button class="edit-ctrl edit-only" type="button" data-action="del"
        data-list="contact.socials" data-index="${i}">×</button>
    </span>`,
    )
    .join('')

  body.innerHTML = `
    <p class="about-lead" data-edit="${ed('about.lead')}">${esc(content.about.lead)}</p>

    <div class="about-cols">${cols}</div>

    <section class="about-block">
      <span class="label" data-edit="${ed('servicesSection.label')}">Services</span>
      <ul class="service-list">${services}</ul>
      <button class="edit-ctrl edit-only add-block" type="button" data-action="add"
        data-list="services">+ Service</button>
    </section>

    <section class="about-block">
      <span class="label" data-edit="${ed('contact.label')}">Contact</span>
      <h2 class="contact-title" data-edit="${ed('contact.title')}">${esc(content.contact.title)}</h2>
      <div class="contact-actions">
        <a class="copy-email big" href="mailto:${esc(content.contact.email)}">
          <span data-edit="${ed('contact.email')}">${esc(content.contact.email)}</span>
        </a>
        ${socials}
        <button class="edit-ctrl edit-only" type="button" data-action="add"
          data-list="contact.socials">+ Social</button>
      </div>
      <p class="body contact-note" data-edit="${ed('contact.note')}">${esc(content.contact.note)}</p>
    </section>
  `
}

/* ---------- Ticker & footer ---------- */
const renderTicker = () => {
  const track = document.querySelector('#marquee-track')
  const html = content.marquee
    .map((m, i) => `<span data-edit="${ed(`marquee.${i}`)}">${esc(m)}</span>`)
    .join('')
  track.innerHTML = html + html

  const parent = track.parentElement
  parent.querySelectorAll(':scope > .edit-ctrl.add').forEach((n) => n.remove())
  const add = document.createElement('button')
  add.className = 'edit-ctrl edit-only add'
  add.type = 'button'
  add.dataset.action = 'add'
  add.dataset.list = 'marquee'
  add.textContent = '+ Item'
  parent.appendChild(add)
}

const renderFooter = () => {
  const el = document.querySelector('#footer-inner')
  const year = new Date().getFullYear()
  el.innerHTML = `
    <p class="label dim" data-edit="${ed('footer.left')}">${esc(String(content.footer.left).replace('{year}', year))}</p>
    <p class="label dim" data-edit="${ed('footer.center')}">${esc(content.footer.center)}</p>
    <a class="label" href="#/" data-edit="${ed('footer.back')}">${esc(content.footer.back)}</a>
  `
}

/* ---------- About photo ---------- */
const renderAboutPhoto = () => {
  const fig = document.querySelector('#about-photo')
  if (!fig) return
  const img = fig.querySelector('.about-photo-img')
  const photo = content.about.photo
  fig.classList.toggle('is-empty', !photo)
  if (photo) {
    if (img.getAttribute('src') !== photo) img.src = photo
    img.hidden = false
  } else {
    img.removeAttribute('src')
    img.hidden = true
  }
}

/* ---------- Render all ---------- */
const renderAll = () => {
  applyTheme()
  renderWall()
  renderTicker()
  renderWork()
  renderExperience()
  renderAbout()
  renderAboutPhoto()
  renderFooter()
  syncMailto()
  applyLang()
  applyContentToDOM()
}

/* ---------- Router ---------- */
const homeMain = document.querySelector('#home-main')
const workPage = document.querySelector('#work-page')
const experiencePage = document.querySelector('#experience-page')
const aboutPage = document.querySelector('#about-page')

const hideAllPages = () => {
  homeMain.hidden = true
  workPage.hidden = true
  experiencePage.hidden = true
  aboutPage.hidden = true
}

const closeNav = () => {
  document.querySelector('#nav').classList.remove('open')
  const t = document.querySelector('.menu-toggle')
  t.setAttribute('aria-expanded', 'false')
  t.textContent = UI[lang.current].menu
}

const setActiveNav = (key) => {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === key)
  })
}

const updateDocTitle = () => {
  if (!aboutPage.hidden) {
    document.title = `${UI[lang.current].about} — ${content.brand.name}`
    return
  }
  if (!experiencePage.hidden) {
    document.title = `${readPath(ed('experienceSection.title'))} — ${content.brand.name}`
    return
  }
  if (!workPage.hidden) {
    const catId = state.activeCategory
    const title =
      catId && catIndex(catId) !== -1
        ? readPath(ed(`categories.${catIndex(catId)}.label`))
        : readPath(ed('workSection.title'))
    document.title = `${title} — ${content.brand.name}`
    return
  }
  document.title = `${content.brand.name} — ${content.brand.tunnel}`
}

const showHome = () => {
  hideAllPages()
  homeMain.hidden = false
  state.activeCategory = null
  setActiveNav(null)
  updateDocTitle()
  closeNav()
  window.scrollTo({ top: 0 })
}

const showWork = (catId) => {
  hideAllPages()
  workPage.hidden = false
  state.activeCategory = catId
  renderWork()
  applyContentToDOM()
  setActiveNav('work')
  updateDocTitle()
  closeNav()
  window.scrollTo({ top: 0 })
}

const showExperience = () => {
  hideAllPages()
  experiencePage.hidden = false
  renderExperience()
  applyContentToDOM()
  setActiveNav('experience')
  updateDocTitle()
  closeNav()
  window.scrollTo({ top: 0 })
}

const showAbout = () => {
  hideAllPages()
  aboutPage.hidden = false
  setActiveNav('about')
  updateDocTitle()
  closeNav()
  window.scrollTo({ top: 0 })
}

const route = () => {
  const hash = location.hash || '#/'
  const catMatch = hash.match(/^#\/work\/([a-z0-9-]+)$/)
  if (catMatch && catIndex(catMatch[1]) !== -1) {
    showWork(catMatch[1])
    return
  }
  if (hash === '#/work') {
    showWork(null)
    return
  }
  if (hash === '#/experience') {
    showExperience()
    return
  }
  if (hash === '#/about') {
    showAbout()
    return
  }
  showHome()
}

/* ---------- Header & nav ---------- */
const header = document.querySelector('.site-header')
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20)

document.querySelector('.menu-toggle').addEventListener('click', (e) => {
  const nav = document.querySelector('#nav')
  const open = nav.classList.toggle('open')
  e.currentTarget.setAttribute('aria-expanded', String(open))
  e.currentTarget.textContent = open ? UI[lang.current].close : UI[lang.current].menu
})

/* ---------- Open lightbox from a work ---------- */
const workFromEvent = (e) => {
  const trigger = e.target.closest('[data-work]')
  if (!trigger || state.editMode) return null
  const work = content.works[Number(trigger.dataset.work)]
  if (!work || !work.img) return null
  return { work, trigger }
}

document.addEventListener('click', (e) => {
  const found = workFromEvent(e)
  if (!found) return
  e.preventDefault()
  lightbox.open(found.work)
})

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return
  const active = document.activeElement
  if (!active || !active.matches || !active.matches('[data-work]')) return
  const work = content.works[Number(active.dataset.work)]
  if (!work || !work.img || state.editMode) return
  e.preventDefault()
  lightbox.open(work)
})

/* ---------- Email: keep mailto: in sync while editing ---------- */
const syncMailto = () => {
  const href = `mailto:${content.contact.email}`
  document.querySelectorAll('a[data-mailto]').forEach((a) => a.setAttribute('href', href))
}

/* ---------- Exposed app for editor ---------- */
const app = {
  get content() {
    return content
  },
  setContent(c) {
    content = c
  },
  save,
  clearLocal,
  applyTheme,
  renderAll,
  renderWall,
  renderWork,
  renderExperience,
  renderAbout,
  renderTicker,
  renderFooter,
  applyContentToDOM,
  getByPath,
  setByPath,
  readPath,
  writePath,
  ed,
  deepMerge,
  route,
  storageKey: STORAGE_KEY,
  defaultContent,
  idContent,
  get lang() {
    return lang.current
  },
  setLang,
}

/* ---------- Boot ---------- */
const boot = async () => {
  let base = clone(defaultContent)
  try {
    const res = await fetch('/content.json', { cache: 'no-store' })
    if (res.ok) base = deepMerge(base, await res.json())
  } catch {
    /* no published content.json yet */
  }
  const local = loadLocal()
  if (local) {
    // content from an older version (before the "Wall" feature): show every work
    if (!local.wall && Array.isArray(local.works)) {
      local.works.forEach((w) => {
        w.featured = true
      })
    }
    base = deepMerge(base, local)
  }
  content = base

  // Terjemahan Indonesia -> peta path, mis. { "wall.line1": "Desain" }
  content.translations = content.translations || {}
  content.translations.id = deepMerge(flattenI18n(idContent), content.translations.id || {})

  // bahasa tersimpan
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'id' || saved === 'en') lang.current = saved
  } catch {
    /* abaikan */
  }

  renderAll()
  initEditor(app)

  const intro = document.querySelector('#intro-overlay')
  setTimeout(() => intro.classList.add('hide'), 1100)

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang-btn]')
    if (!btn) return
    e.preventDefault()
    setLang(btn.dataset.langBtn)
  })

  window.addEventListener('hashchange', route)
  window.addEventListener('scroll', onScroll, { passive: true })

  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      const wrap = document.querySelector('#wall-cols')
      const n = content.works.filter((w) => w.featured !== false && isPublished(w)).length
      if (String(wallColCount(n)) !== wrap.dataset.cols) renderWall()
    }, 200)
  })

  onScroll()
  route()
}

boot()