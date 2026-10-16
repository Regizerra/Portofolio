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
  let stickerMode = false

  const paintTrigger = () => {
    trigger.classList.toggle('is-admin', ctrlHeld)
    if (stickerMode) {
      triggerLabel.textContent = '😈'
      triggerTip.textContent = 'Sticker mode'
      trigger.setAttribute('aria-label', 'Sticker mode')
      return
    }
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
    // Shift + klik -> mode stiker (bukan mode admin)
    if (e.shiftKey) {
      e.preventDefault()
      setStickerMode(!stickerMode)
      return
    }
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

  /* ---------- Crop karya (seperti Atur crop di Instagram) ---------- */
  const cropModal = document.createElement('div')
  cropModal.className = 'crop-modal'
  cropModal.hidden = true
  cropModal.innerHTML = `
    <div class="crop-box" role="dialog" aria-modal="true" aria-label="Crop image">
      <p class="label dim">Crop</p>
      <p class="crop-hint">Geser gambar untuk pindah posisi, geser zoom untuk membesar.</p>
      <div class="crop-frame">
        <img class="crop-img" alt="">
        <div class="crop-grid" aria-hidden="true"></div>
      </div>
      <label class="crop-zoom">Zoom
        <input type="range" class="crop-zoom-range" min="1" max="3" step="0.01">
      </label>
      <div class="crop-actions">
        <button class="btn-mini" data-crop="reset" type="button">Reset</button>
        <button class="btn-mini" data-crop="cancel" type="button">Batal</button>
        <button class="btn-mini primary" data-crop="save" type="button">Simpan</button>
      </div>
    </div>`
  document.body.appendChild(cropModal)

  const cropImg = cropModal.querySelector('.crop-img')
  const cropFrame = cropModal.querySelector('.crop-frame')
  const cropRange = cropModal.querySelector('.crop-zoom-range')

  let cropIndex = -1
  let cropState = { zoom: 1, posX: 50, posY: 50 }

  const paintCrop = () => {
    cropImg.style.objectPosition = `${cropState.posX}% ${cropState.posY}%`
    cropImg.style.transform = `scale(${cropState.zoom})`
    cropRange.value = String(cropState.zoom)
  }

  const openCrop = (i) => {
    const work = app.content.works[i]
    if (!work || !work.img) return
    cropIndex = i
    cropState = {
      zoom: Number(work.zoom) || 1,
      posX: work.posX == null ? 50 : Number(work.posX),
      posY: work.posY == null ? 50 : Number(work.posY),
    }
    cropImg.src = work.img
    cropRange.min = '1'
    cropRange.max = '3'
    cropModal.hidden = false
    paintCrop()
  }

  const closeCrop = () => {
    cropModal.hidden = true
    cropIndex = -1
  }

  cropRange.addEventListener('input', () => {
    cropState.zoom = Number(cropRange.value)
    paintCrop()
  })

  // geser gambar untuk memindah posisi crop
  let cropDrag = null
  cropFrame.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    cropFrame.setPointerCapture?.(e.pointerId)
    const r = cropFrame.getBoundingClientRect()
    // hitung berapa px gambar meluber di tiap sisi
    const nat = cropImg.naturalWidth || 1
    const natH = cropImg.naturalHeight || 1
    const frameRatio = r.width / r.height
    const imgRatio = nat / natH
    let coverW
    let coverH
    if (imgRatio > frameRatio) {
      coverH = r.height * cropState.zoom
      coverW = coverH * imgRatio
    } else {
      coverW = r.width * cropState.zoom
      coverH = coverW / imgRatio
    }
    cropDrag = {
      x: e.clientX,
      y: e.clientY,
      posX: cropState.posX,
      posY: cropState.posY,
      overX: Math.max(0.0001, coverW - r.width),
      overY: Math.max(0.0001, coverH - r.height),
    }
  })

  cropFrame.addEventListener('pointermove', (e) => {
    if (!cropDrag) return
    const dx = e.clientX - cropDrag.x
    const dy = e.clientY - cropDrag.y
    cropState.posX = Math.max(0, Math.min(100, cropDrag.posX - (dx / cropDrag.overX) * 100))
    cropState.posY = Math.max(0, Math.min(100, cropDrag.posY - (dy / cropDrag.overY) * 100))
    paintCrop()
  })

  const endCropDrag = () => {
    cropDrag = null
  }
  cropFrame.addEventListener('pointerup', endCropDrag)
  cropFrame.addEventListener('pointercancel', endCropDrag)

  cropModal.addEventListener('click', (e) => {
    if (e.target === cropModal) {
      closeCrop()
      return
    }
    const btn = e.target.closest('[data-crop]')
    if (!btn) return
    const action = btn.dataset.crop

    if (action === 'reset') {
      cropState = { zoom: 1, posX: 50, posY: 50 }
      paintCrop()
      return
    }
    if (action === 'cancel') {
      closeCrop()
      return
    }
    if (action === 'save' && cropIndex >= 0) {
      const work = app.content.works[cropIndex]
      work.zoom = Math.round(cropState.zoom * 100) / 100
      work.posX = Math.round(cropState.posX * 10) / 10
      work.posY = Math.round(cropState.posY * 10) / 10
      app.save()
      app.renderAll()
      closeCrop()
      notify('Crop disimpan.')
    }
  })

  /* ---------- Sticker mode ----------
     Aktif: Shift + klik tombol CV (tombol yang sama dengan admin).
     Mode ini BUKAN Custom Mode:visitor tidak pernah melihat kontrolnya. */

  const EVIL_ICON =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" font-size="88" text-anchor="middle" dominant-baseline="central">&#128520;</text></svg>`,
    )

  let selectedSticker = -1

  const stickerPanel = document.createElement('div')
  stickerPanel.className = 'sticker-panel'
  stickerPanel.hidden = true
  stickerPanel.innerHTML = `
    <span class="sticker-panel-title">😈 Sticker</span>
    <label>Size <input type="range" min="40" max="420" step="2" data-st="size"><output data-st-out>120</output></label>
    <label>Depth
      <select data-st="layer">
        <option value="front">Front</option>
        <option value="back">Back</option>
      </select>
    </label>
    <button type="button" data-st="add">+ Stiker</button>
    <button type="button" data-st="image">Ganti gambar</button>
    <button type="button" data-st="undo">↶ Undo</button>
    <button type="button" data-st="delete" class="danger">Hapus</button>
    <button type="button" data-st="done">Selesai</button>`
  document.body.appendChild(stickerPanel)

  const currentPage = () => {
    if (document.querySelector('#about-page')?.hidden === false) return 'about'
    if (document.querySelector('#experience-page')?.hidden === false) return 'experience'
    if (document.querySelector('#work-page')?.hidden === false) return 'work'
    return 'home'
  }

  const list = () => (Array.isArray(app.content.stickers) ? app.content.stickers : [])

  const syncPanel = () => {
    const items = list()
    const s = items[selectedSticker]

    // panel selalu tampil selama mode stiker aktif, walau belum ada
    // stiker yang dipilih (supaya tombol "+ Stiker" selalu bisa dipakai)
    stickerPanel.hidden = !stickerMode
    if (!s) {
      stickerPanel.querySelectorAll('[data-st="size"], [data-st="layer"], [data-st="image"], [data-st="delete"], [data-st-out]').forEach((n) => {
        n.disabled = true
        if (n.tagName === 'OUTPUT') n.textContent = '—'
      })
      return
    }

    stickerPanel.querySelectorAll('[data-st="size"], [data-st="layer"], [data-st="image"], [data-st="delete"]').forEach((n) => {
      n.disabled = false
    })
    stickerPanel.querySelector('[data-st="size"]').value = String(Number(s.size) || 120)
    stickerPanel.querySelector('[data-st-out]').textContent = String(Number(s.size) || 120)
    stickerPanel.querySelector('[data-st="layer"]').value = s.layer === 'back' ? 'back' : 'front'
  }

  const paintStickers = () => {
    document.querySelectorAll('.sticker').forEach((el) => {
      el.classList.toggle('is-selected', Number(el.dataset.sticker) === selectedSticker)
    })
    syncPanel()
  }

  const setStickerMode = (on) => {
    stickerMode = on
    selectedSticker = -1
    document.body.classList.toggle('sticker-mode', on)
    if (!on) stickerPanel.hidden = true
    paintTrigger()
    notify(on ? 'Sticker mode aktif — klik di halaman untuk menempel stiker.' : 'Sticker mode selesai.')
    app.renderAll()
    paintStickers()
  }

  const selectSticker = (i) => {
    selectedSticker = i
    paintStickers()
  }

  // ---- Menambah stiker lewat tombol panel (tidak perlu klik halaman) ----
  const addSticker = () => {
    snapshotStickers()
    app.content.stickers = list()
    app.content.stickers.push({
      page: currentPage(),
      src: EVIL_ICON,
      x: 50,
      y: 30,
      size: 120,
      layer: 'front',
    })
    selectedSticker = app.content.stickers.length - 1
    app.save()
    app.renderAll()
    paintStickers()
    notify('Stiker ditambahkan di tengah halaman — seret untuk memindah.')
  }

  // ---- Undo: snapshot sebelum setiap perubahan ----
  const stickerUndo = []

  const snapshotStickers = () => {
    stickerUndo.push(JSON.stringify(list()))
    if (stickerUndo.length > 50) stickerUndo.shift()
  }

  const undoSticker = () => {
    const prev = stickerUndo.pop()
    if (prev == null) {
      notify('Tidak ada yang bisa di-undo.')
      return
    }
    app.content.stickers = JSON.parse(prev)
    selectedSticker = -1
    app.save()
    app.renderAll()
    paintStickers()
    notify('Undo.')
  }

  window.addEventListener('keydown', (e) => {
    if (!stickerMode) return
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return
    const t = e.target
    if (t && (t.matches('input, textarea, select') || t.isContentEditable)) return
    e.preventDefault()
    undoSticker()
  })

  // ---- Menempel stiker baru ----
  let pressAt = null
  let suppressClick = false

  document.addEventListener('pointerdown', (e) => {
    if (!stickerMode) return
    pressAt = { x: e.clientX, y: e.clientY }
  })

  document.addEventListener('click', (e) => {
    if (!stickerMode) return

    // lepas klik setelaheseret/geser -> jangan dianggaparmacyat stiker
    if (pressAt) {
      const moved = Math.hypot(e.clientX - pressAt.x, e.clientY - pressAt.y)
      pressAt = null
      if (moved > 4) {
        suppressClick = true
        return
      }
    }
    if (suppressClick) {
      suppressClick = false
      return
    }

    const existing = e.target.closest('.sticker')
    if (existing) {
      e.preventDefault()
      e.stopPropagation()
      selectSticker(Number(existing.dataset.sticker))
      return
    }

    // Di mode stiker, sentuhan hanya berlaku untuk stiker.
    // Area kosong tidak menambah apa pun (mencegah stiker nyasar).
    if (e.target.closest('button, a, input, select, textarea, label')) return
    e.preventDefault()
    e.stopPropagation()
  })

  // ---- Seret untuk memindah ----
  let drag = null
  document.addEventListener('pointerdown', (e) => {
    if (!stickerMode) return
    const el = e.target.closest('.sticker')
    if (!el) return
    const i = Number(el.dataset.sticker)
    const layer = el.parentElement
    const host = layer.parentElement
    selectSticker(i)
    e.preventDefault()
    e.stopPropagation()
    const hostRect = host.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    // sticker dipusatkan dengan translate(-50%,-50%), jadi titik acunya
    // adalah tengahnya — tanpa ini sticker meloncatfefterhalf lebarnya
    drag = {
      i,
      layer,
      host,
      startX: e.clientX,
      startY: e.clientY,
      baseLeft: elRect.left - hostRect.left + elRect.width / 2,
      baseTop: elRect.top - hostRect.top + elRect.height / 2,
      hostW: hostRect.width,
      hostH: hostRect.height,
    }
  })

  document.addEventListener('pointermove', (e) => {
    if (!drag) return
    const left = drag.baseLeft + (e.clientX - drag.startX)
    const top = drag.baseTop + (e.clientY - drag.startY)
    const el = drag.layer.querySelector(`.sticker[data-sticker="${drag.i}"]`)
    if (!el) return
    el.style.left = `${Math.max(0, Math.min(100, (left / drag.hostW) * 100))}%`
    el.style.top = `${Math.max(0, Math.min(100, (top / drag.hostH) * 100))}%`
  })

  const endDrag = () => {
    if (!drag) return
    const el = drag.layer.querySelector(`.sticker[data-sticker="${drag.i}"]`)
    if (el) {
      const s = list()[drag.i]
      if (s) {
        const nx = Math.round(parseFloat(el.style.left) * 10) / 10
        const ny = Math.round(parseFloat(el.style.top) * 10) / 10
        if (nx !== s.x || ny !== s.y) snapshotStickers()
        s.x = nx
        s.y = ny
        app.save()
      }
    }
    drag = null
  }
  document.addEventListener('pointerup', endDrag)
  document.addEventListener('pointercancel', endDrag)

  // ---- Panel kontrol stiker ----
  stickerPanel.addEventListener('input', (e) => {
    if (selectedSticker < 0) return
    const range = e.target.closest('[data-st="size"]')
    if (!range) return
    const v = Number(range.value)
    list()[selectedSticker].size = v
    stickerPanel.querySelector('[data-st-out]').textContent = String(v)
    const el = document.querySelector(`.sticker[data-sticker="${selectedSticker}"]`)
    if (el) el.style.width = `${v}px`
  })

  stickerPanel.addEventListener('change', (e) => {
    if (selectedSticker < 0) return
    const sel = e.target.closest('[data-st="layer"]')
    const range = e.target.closest('[data-st="size"]')
    if (range) {
      snapshotStickers()
      const v = Number(range.value)
      list()[selectedSticker].size = v
      app.save()
      return
    }
    if (!sel) return
    snapshotStickers()
    list()[selectedSticker].layer = sel.value
    app.save()
    app.renderAll()
    paintStickers()
  })

  stickerPanel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-st]')
    if (!btn || btn.tagName !== 'BUTTON' || btn.disabled) return
    const action = btn.dataset.st

    if (action === 'image') {
      snapshotStickers()
      pickImage(`stickers.${selectedSticker}.src`)
      return
    }
    if (action === 'add') {
      addSticker()
      return
    }
    if (action === 'delete') {
      snapshotStickers()
      list().splice(selectedSticker, 1)
      selectedSticker = -1
      app.save()
      app.renderAll()
      paintStickers()
      return
    }
    if (action === 'undo') {
      undoSticker()
      return
    }
    if (action === 'done') setStickerMode(false)
  })

  // ---- Panel bisa diseret ke mana saja lewat judulnya ----
  let panelDrag = null
  const panelTitle = stickerPanel.querySelector('.sticker-panel-title')

  panelTitle.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    const r = stickerPanel.getBoundingClientRect()
    panelDrag = { dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, h: r.height }
    stickerPanel.classList.add('is-dragging')
    panelTitle.setPointerCapture?.(e.pointerId)
  })

  panelTitle.addEventListener('pointermove', (e) => {
    if (!panelDrag) return
    const maxX = window.innerWidth - panelDrag.w - 8
    const maxY = window.innerHeight - panelDrag.h - 8
    const x = Math.max(8, Math.min(maxX, e.clientX - panelDrag.dx))
    const y = Math.max(8, Math.min(maxY, e.clientY - panelDrag.dy))
    stickerPanel.style.left = `${x}px`
    stickerPanel.style.top = `${y}px`
    stickerPanel.style.bottom = 'auto'
  })

  const endPanelDrag = () => {
    panelDrag = null
    stickerPanel.classList.remove('is-dragging')
  }
  panelTitle.addEventListener('pointerup', endPanelDrag)
  panelTitle.addEventListener('pointercancel', endPanelDrag)
  panelTitle.addEventListener('lostpointercapture', endPanelDrag)

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

    if (el.matches('[data-edit-input]')) {
      app.writePath(el.dataset.editInput, el.value)
      app.save()
      // sinkronkan kemunculan teks yang sama (mis. di lightbox & wall)
      app.applyContentToDOM()
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
        if (action === 'crop') openCrop(Number(index))
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

  const kb = (len) => Math.round(len / 1024) + ' KB'

// Menggambar sumber gambar ke canvas, mengecilkan, lalu meng-encode.
  // image/webp dipakai lebih dulu, ada cadangan PNG/JPEG.
  const drawToDataUrl = (source, w0, h0, file) => {
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
    ctx.drawImage(source, 0, 0, w, h)

    // PNG hanya dipakai kalau memang butuh alpha / artwork datar.
    const needsAlpha = file.type === 'image/png' || file.type === 'image/gif'
    const tryTypes = needsAlpha
      ? ['image/webp', 'image/png', 'image/jpeg']
      : ['image/webp', 'image/jpeg', 'image/png']

    for (const type of tryTypes) {
      try {
        const encoded = canvas.toDataURL(type, 0.85)
        if (encoded && encoded.startsWith('data:image/') && encoded.length > 64) {
          return encoded
        }
      } catch {
        /* format ini tidak didukung browser -> coba berikutnya */
      }
    }
    return ''
  }

  const compressImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          try {
            const out = drawToDataUrl(
              img,
              img.naturalWidth || img.width,
              img.naturalHeight || img.height,
              file,
            )
            // cadangan terakhir: pakai file asli apa adanya
            if (out) resolve(out)
            else if (reader.result?.startsWith('data:image/')) resolve(reader.result)
            else reject(new Error('encode failed'))
          } catch (err) {
            reject(err)
          }
        }
        img.onerror = async () => {
          // <img> gagal? coba decoder alternatif (createImageBitmap)
          try {
            const bmp = await createImageBitmap(file)
            const out = drawToDataUrl(bmp, bmp.width, bmp.height, file)
            resolve(out || reader.result)
          } catch {
            reject(
              new Error(
                `${file.name} (${file.type || 'unknown type'}, ${kb(file.size)}) cannot be opened by this browser`,
              ),
            )
          }
        }
        img.src = reader.result
      }
      reader.onerror = () => reject(new Error('file could not be read'))
      reader.readAsDataURL(file)
    })

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
    } catch (err) {
      notify(`Failed to load the image — ${err?.message || 'unknown error'}`)
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
