import { state } from './state.js'

const CODE = '2710'

export function initEditor(app) {
  /* ---------- Build editor UI ---------- */
  // Tombol disamarkan sebagai "CV". Klik biasa = unduh CV.
  // Ctrl+klik (label berubah jadi gerigi) = buka kunci developer.
  const trigger = document.createElement('button')
  trigger.className = 'edit-trigger'
  trigger.type = 'button'
  trigger.innerHTML = `
    <span class="edit-trigger-label">CV</span>
    <span class="edit-trigger-tip" role="tooltip">Download CV</span>`
  document.querySelector('.site-footer').appendChild(trigger)

  const modal = document.createElement('div')
  modal.className = 'code-modal'
  modal.hidden = true
  modal.innerHTML = `
      <div class="code-box" role="dialog" aria-modal="true" aria-label="Developer code">
        <p class="label dim">Custom Mode</p>
        <p class="code-hint">Enter developer code</p>
        <input class="code-input" type="password" inputmode="numeric" maxlength="4" placeholder="••••" />
        <div class="code-actions">
          <button class="btn-mini" data-code="cancel" type="button">Cancel</button>
          <button class="btn-mini primary" data-code="ok" type="button">Unlock</button>
        </div>
      </div>`
  document.body.appendChild(modal)

  const toolbar = document.createElement('div')
  toolbar.className = 'edit-toolbar'
  toolbar.hidden = true
  toolbar.innerHTML = `
    <span class="edit-badge">Custom Mode</span>
    <div class="edit-colors">
      <label>Background<input type="color" data-color="bg"></label>
      <label>Text<input type="color" data-color="ink"></label>
      <label>Border<input type="color" data-color="line"></label>
    </div>
    <div class="edit-buttons">
      <button data-tool="save" type="button">Save</button>
      <button data-tool="export" type="button">Export</button>
      <button data-tool="import" type="button">Import</button>
      <button data-tool="reset" type="button">Reset</button>
      <button data-tool="exit" type="button" class="danger">Exit</button>
    </div>`
  document.body.appendChild(toolbar)

  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  fileInput.hidden = true
  document.body.appendChild(fileInput)

  const importInput = document.createElement('input')
  importInput.type = 'file'
  importInput.accept = 'application/json,.json'
  importInput.hidden = true
  document.body.appendChild(importInput)

  const toast = document.createElement('div')
  toast.className = 'edit-toast'
  toast.hidden = true
  document.body.appendChild(toast)

  let toastTimer
  const notify = (msg) => {
    toast.textContent = msg
    toast.hidden = false
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast.hidden = true), 2200)
  }

  /* ---------- Color helpers ---------- */
  const rgbToHex = (str) => {
    const s = String(str).trim()
    if (s.startsWith('#')) return s
    const m = s.match(/\d+/g)
    if (!m) return '#000000'
    const [r, g, b] = m
    return '#' + [r, g, b].map((v) => Number(v).toString(16).padStart(2, '0')).join('')
  }

  const syncColorInputs = () => {
    const cs = getComputedStyle(document.documentElement)
    toolbar.querySelector('[data-color="bg"]').value = rgbToHex(cs.getPropertyValue('--bg') || '#ffffff')
    toolbar.querySelector('[data-color="ink"]').value = rgbToHex(cs.getPropertyValue('--ink') || '#000000')
    toolbar.querySelector('[data-color="line"]').value = rgbToHex(cs.getPropertyValue('--line') || '#000000')
  }

  /* ---------- Enter / exit ---------- */
  const enterEdit = () => {
    state.editMode = true
    document.body.classList.add('edit-mode')
    toolbar.hidden = false
    modal.hidden = true
    app.renderAll()
    syncColorInputs()
    notify('Custom Mode is on — click text, images, or colors to edit.')
  }

  const exitEdit = () => {
    state.editMode = false
    document.body.classList.remove('edit-mode')
    toolbar.hidden = true
    document.querySelectorAll('[contenteditable]').forEach((el) => {
      el.removeAttribute('contenteditable')
      el.classList.remove('editing')
    })
    app.save()
    app.renderAll()
    notify('Changes saved in this browser.')
  }

  const openModal = () => {
    modal.hidden = false
    const input = modal.querySelector('.code-input')
    input.value = ''
    input.focus()
  }

  /* ---------- Secret trigger: CV / developer ---------- */
  const triggerLabel = trigger.querySelector('.edit-trigger-label')
  const triggerTip = trigger.querySelector('.edit-trigger-tip')
  let ctrlHeld = false

  const paintTrigger = () => {
    trigger.classList.toggle('is-admin', ctrlHeld)
    triggerLabel.textContent = ctrlHeld ? '⚙' : 'CV'
    triggerTip.textContent = ctrlHeld ? 'Administrator' : 'Download CV'
    trigger.setAttribute('aria-label', ctrlHeld ? 'Administrator' : 'Download CV')
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Control' || e.key === 'Meta') {
      if (!ctrlHeld) {
        ctrlHeld = true
        paintTrigger()
      }
    }
  })
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Control' || e.key === 'Meta') {
      ctrlHeld = false
      paintTrigger()
    }
  })
  window.addEventListener('blur', () => {
    ctrlHeld = false
    paintTrigger()
  })

  trigger.addEventListener('click', (e) => {
    if (ctrlHeld) {
      e.preventDefault()
      openModal()
      return
    }
    // klik biasa -> unduh CV
    const href = app.content?.cv?.href || '/cv.pdf'
    const a = document.createElement('a')
    a.href = href
    a.download = ''
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    notify('Downloading CV…')
  })

  paintTrigger()

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.hidden = true
    const btn = e.target.closest('[data-code]')
    if (!btn) return
    if (btn.dataset.code === 'cancel') modal.hidden = true
    if (btn.dataset.code === 'ok') {
      const input = modal.querySelector('.code-input')
      if (input.value === CODE) enterEdit()
      else {
        input.value = ''
        modal.querySelector('.code-box').classList.add('shake')
        setTimeout(() => modal.querySelector('.code-box').classList.remove('shake'), 400)
      }
    }
  })

  modal.querySelector('.code-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') modal.querySelector('[data-code="ok"]').click()
  })

  /* ---------- Secret key sequence 2710 ---------- */
  let buffer = ''
  document.addEventListener('keydown', (e) => {
    if (state.editMode) return
    const t = e.target
    if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return
    if (/^[0-9]$/.test(e.key)) {
      buffer = (buffer + e.key).slice(-CODE.length)
      if (buffer === CODE) {
        buffer = ''
        openModal()
      }
    } else if (e.key === 'Backspace') {
      buffer = buffer.slice(0, -1)
    }
  })

  /* ---------- Toolbar actions ---------- */
  toolbar.addEventListener('input', (e) => {
    const color = e.target.closest('[data-color]')
    if (!color) return
    app.content.theme = app.content.theme || {}
    app.content.theme[color.dataset.color] = color.value
    app.applyTheme()
    app.save()
  })

  toolbar.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-tool]')
    if (!btn) return
    const tool = btn.dataset.tool

    if (tool === 'save') {
      app.save()
      notify('Saved in this browser.')
    }

    if (tool === 'export') {
      app.save()
      const blob = new Blob([JSON.stringify(app.content, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'content.json'
      a.click()
      URL.revokeObjectURL(url)
      notify('content.json downloaded — put it in the public/ folder, then deploy.')
    }

    if (tool === 'import') importInput.click()

    if (tool === 'reset') {
      if (confirm('Reset everything back to the defaults? Local changes will be removed.')) {
        app.clearLocal()
        app.setContent(JSON.parse(JSON.stringify(app.defaultContent)))
        app.renderAll()
        syncColorInputs()
        notify('Reset to defaults.')
      }
    }

    if (tool === 'exit') exitEdit()
  })

  /* ---------- Text editing ---------- */
  document.addEventListener('mousedown', (e) => {
    if (!state.editMode) return
    const el = e.target.closest('[data-edit]')
    if (!el) return
    const path = el.dataset.edit
    if (!path || path.startsWith('__')) return
    if (el.getAttribute('contenteditable') == null) {
      el.setAttribute('contenteditable', 'plaintext-only')
      if (el.contentEditable !== 'plaintext-only') el.setAttribute('contenteditable', 'true')
      el.classList.add('editing')
      el.focus()
    }
  })

  document.addEventListener('input', (e) => {
    if (!state.editMode) return
    const el = e.target

    if (el.matches('[data-edit]')) {
      app.writePath(el.dataset.edit, el.textContent)
      app.save()
      return
    }

    if (el.matches('[data-action="social-url"]')) {
      const i = Number(el.dataset.index)
      app.content.contact.socials[i].url = el.value
      const link = el.parentElement.querySelector('a')
      if (link) link.href = el.value
      app.save()
    }
  })

  document.addEventListener('focusout', (e) => {
    if (!state.editMode) return
    if (e.target.matches && e.target.matches('[data-edit]')) {
      e.target.removeAttribute('contenteditable')
      e.target.classList.remove('editing')
      app.save()
      // sync every other element that points at the same field
      app.applyContentToDOM()
    }
  })

  const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'category'

  /* ---------- Control actions (buttons) ---------- */
  const addItem = (list) => {
    const c = app.content
    const year = new Date().getFullYear()
    if (list === 'works') {
      const cat = c.categories[0] ? c.categories[0].id : ''
      c.works.push({ title: 'New Work', cat, year, img: null, video: null, featured: true })
      app.save()
      app.renderAll()
      //.scroll ke karya yang baru ditambahkan supaya kelihatan
      requestAnimationFrame(() => {
        const cards = document.querySelectorAll('#work-grid .work-card')
        const last = cards[cards.length - 1]
        if (last) last.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }
    if (list === 'categories') {
      const base = 'New Category'
      let n = 1
      let label = base
      const used = new Set(c.categories.map((x) => x.id))
      while (used.has(slugify(label))) {
        n += 1
        label = `${base} ${n}`
      }
      c.categories.push({ id: slugify(label), label })
    } else if (list === 'experience') {
      // title sengaja kosong -> entri ini belum tampil sampai diketik
      c.experience.push({ title: '', org: '', period: '', desc: '', img: null })
    } else if (list === 'services') {
      c.services.push({ title: 'New Service', desc: 'Service description...' })
    } else if (list === 'contact.socials') {
      c.contact.socials.push({ label: 'New Social', url: 'https://' })
    } else {
      // path like about.cols.0.items
      const arr = app.getByPath(c, list)
      if (Array.isArray(arr)) arr.push('New Item')
    }
    app.save()
    app.renderAll()
  }

  const delItem = (list, index) => {
    const arr = app.getByPath(app.content, list)
    if (!Array.isArray(arr)) return
    const label =
      arr[index] && typeof arr[index] === 'object' ? arr[index].title || 'item' : 'item'
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return

    if (list === 'categories' && arr.length <= 1) {
      notify('Keep at least one category.')
      return
    }

    if (list === 'categories') {
      const removed = arr[index]
      arr.splice(index, 1)
      // karya yang memakai kategori ini dipindah ke kategori pertama
      const fallback = arr[0].id
      app.content.works.forEach((w) => {
        if (w.cat === removed.id) w.cat = fallback
      })
    } else {
      arr.splice(index, 1)
    }

    app.save()
    app.renderAll()
  }

  document.addEventListener('click', (e) => {
    if (!state.editMode) return

    const actionBtn = e.target.closest('button[data-action]')
    if (actionBtn) {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      const { action, list, index } = actionBtn.dataset
      try {
        if (action === 'add') addItem(list)
        if (action === 'del') delItem(list, Number(index))
        if (action === 'pick-video') pickVideo(Number(index))
      } catch (err) {
        notify(`Could not apply that change: ${err.message}`)
        console.error(err)
      }
      return
    }

    // biarkan kontrol bawaan (select/input) berfungsi normal
    if (e.target.closest('select, input, textarea, label')) return

    const imgEl = e.target.closest('[data-img]')
    if (imgEl) {
      e.preventDefault()
      pickImage(imgEl.dataset.img)
      return
    }

    const insideEditable = e.target.closest('[contenteditable]')
    if (insideEditable) e.preventDefault()
  })

  document.addEventListener('change', (e) => {
    if (!state.editMode) return
    const el = e.target
    if (el.matches('[data-action="work-cat"]')) {
      const i = Number(el.dataset.index)
      app.content.works[i].cat = el.value
      app.save()
      app.renderAll()
    }
    if (el.matches('[data-action="work-featured"]')) {
      const i = Number(el.dataset.index)
      app.content.works[i].featured = el.checked
      app.save()
      app.renderWall()
      notify(el.checked ? 'Shown on the home media wall.' : 'Hidden from the media wall.')
    }
  })

  /* ---------- Image editing ---------- */
  let pendingPath = null

  const MAX_DIM = 1400

  const compressImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          try {
            const w0 = img.naturalWidth || img.width
            const h0 = img.naturalHeight || img.height
            const scale = w0 ? Math.min(1, MAX_DIM / Math.max(w0, h0)) : 1
            const w = Math.max(1, Math.round(w0 * scale))
            const h = Math.max(1, Math.round(h0 * scale))
            const canvas = document.createElement('canvas')
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext('2d')

            // JPEG tidak bisa menyimpan transparansi -> latar belakang putih
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, w, h)
            ctx.drawImage(img, 0, 0, w, h)

            // Foto disimpan sebagai JPEG (jauh lebih kecil daripada PNG).
            // PNG hanya dipakai kalau memang butuh alpha / artwork datar.
            const needsAlpha = file.type === 'image/png' || file.type === 'image/gif'
            const tryTypes = needsAlpha ? ['image/webp', 'image/png'] : ['image/webp', 'image/jpeg']

            let out = ''
            for (const type of tryTypes) {
              const encoded = canvas.toDataURL(type, 0.85)
              if (encoded && encoded.length > 64) {
                out = encoded
                break
              }
            }
            if (!out) reject(new Error('empty'))
            else resolve(out)
          } catch (err) {
            reject(err)
          }
        }
        img.onerror = () => reject(new Error('image load'))
        img.src = reader.result
      }
      reader.onerror = () => reject(new Error('read'))
      reader.readAsDataURL(file)
    })

  const kb = (len) => Math.round(len / 1024) + ' KB'

  let fullWarned = false
  window.addEventListener('storage-full', () => {
    if (fullWarned) return
    fullWarned = true
    notify('Browser storage is full — click Export now, your last changes may be lost.')
  })

  const pickImage = (path) => {
    pendingPath = path
    fileInput.value = ''
    fileInput.accept = 'image/*'
    fileInput.click()
  }

  /* Videos are far too large to embed in content.json, so we only store the
     file name as a path. The user then drops the file into public/work/. */
  let pendingVideoIndex = null

  const pickVideo = (index) => {
    pendingVideoIndex = index
    fileInput.value = ''
    fileInput.accept = 'video/*'
    fileInput.click()
  }

  fileInput.addEventListener('change', async () => {
    if (pendingVideoIndex !== null) {
      const file = fileInput.files?.[0]
      const idx = pendingVideoIndex
      pendingVideoIndex = null
      if (!file) return
      const path = `/work/${file.name}`
      app.writePath(`works.${idx}.video`, path)
      app.save()
      app.renderAll()
      notify(`Video set to "${path}" — now copy your file into the public/work folder.`)
      return
    }

    const file = fileInput.files?.[0]
    if (!file || !pendingPath) return
    try {
      const dataUrl = await compressImage(file)
      app.writePath(pendingPath, dataUrl)
      const saved = app.save()
      app.renderAll()
      notify(saved ? `Image updated — ${kb(dataUrl.length)}` : 'Image updated, but storage is full! Export your content.json to keep it.')
    } catch {
      notify('Failed to load the image.')
    }
    pendingPath = null
  })

  /* ---------- Import ---------- */
  importInput.addEventListener('change', () => {
    const file = importInput.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result)
        app.setContent(app.deepMerge(app.defaultContent, imported))
        app.save()
        app.renderAll()
        syncColorInputs()
        notify('content.json loaded.')
      } catch {
        notify('Invalid file.')
      }
    }
    reader.readAsText(file)
  })
}
