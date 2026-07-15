import {
  DMG_FLOAT_DISTANCE,
  DMG_FLOAT_MS,
  MAX_DAMAGE_NUMBERS,
  SHAKE_AMP_BASE,
  SHAKE_AMP_MAX,
  SHAKE_AMP_PER_DAMAGE,
  SHAKE_AMP_SUBDUE,
  SHAKE_DURATION_MS,
  SHAKE_SUBDUE_MS,
} from '../data/tuning'

/**
 * Imperative hit-juice system: screen shake, hit flash, sprite punch and
 * pooled floating damage numbers. Everything mutates registered DOM nodes
 * directly with transform/opacity — no React state, no layout properties.
 */

let layerEl: HTMLElement | null = null
let anchorEl: HTMLElement | null = null
let shakeEl: HTMLElement | null = null
let flashEl: HTMLElement | null = null
let punchEl: HTMLElement | null = null

const dmgEls: (HTMLElement | null)[] = Array.from({ length: MAX_DAMAGE_NUMBERS }, () => null)
let dmgCursor = 0

let shakeRaf: number | null = null
let shakeUntil = 0
let shakeWindow = SHAKE_DURATION_MS
let shakeAmp = 0

function doubleRaf(fn: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(fn))
}

function anchorCenter(): { x: number; y: number } | null {
  if (!layerEl || !anchorEl) return null
  const a = layerEl.getBoundingClientRect()
  const b = anchorEl.getBoundingClientRect()
  return { x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height / 2 }
}

function shakeTick() {
  shakeRaf = null
  if (!shakeEl) return
  const remaining = shakeUntil - performance.now()
  if (remaining <= 0) {
    shakeEl.style.transform = ''
    shakeAmp = 0
    return
  }
  const amp = shakeAmp * Math.min(remaining / shakeWindow, 1)
  const dx = (Math.random() * 2 - 1) * amp
  const dy = (Math.random() * 2 - 1) * amp
  shakeEl.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`
  shakeRaf = requestAnimationFrame(shakeTick)
}

function shake(amp: number, durationMs: number) {
  shakeAmp = Math.max(shakeAmp, amp)
  shakeWindow = durationMs
  shakeUntil = Math.max(shakeUntil, performance.now() + durationMs)
  if (shakeRaf === null) shakeRaf = requestAnimationFrame(shakeTick)
}

function flash() {
  const el = flashEl
  if (!el) return
  el.style.transition = 'none'
  el.style.opacity = '0.35'
  doubleRaf(() => {
    el.style.transition = 'opacity 140ms ease-out'
    el.style.opacity = '0'
  })
}

function punch() {
  const el = punchEl
  if (!el) return
  el.style.transition = 'none'
  el.style.transform = 'scale(0.88)'
  doubleRaf(() => {
    el.style.transition = 'transform 110ms ease-out'
    el.style.transform = 'scale(1)'
  })
}

function damageNumber(value: number) {
  const pos = anchorCenter()
  if (!pos) return
  const el = dmgEls[dmgCursor]
  dmgCursor = (dmgCursor + 1) % MAX_DAMAGE_NUMBERS
  if (!el) return

  const x = pos.x + (Math.random() * 72 - 36)
  const y = pos.y - 24 + (Math.random() * 24 - 12)
  el.textContent = `-${Math.round(value)}`
  el.style.transition = 'none'
  el.style.opacity = '1'
  el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
  doubleRaf(() => {
    el.style.transition = `transform ${DMG_FLOAT_MS}ms ease-out, opacity ${DMG_FLOAT_MS}ms ease-in`
    el.style.transform = `translate3d(${x}px, ${y - DMG_FLOAT_DISTANCE}px, 0) translate(-50%, -50%) scale(1.15)`
    el.style.opacity = '0'
  })
}

export const fx = {
  attachLayer(el: HTMLElement | null) {
    layerEl = el
    if (!el && shakeRaf !== null) {
      cancelAnimationFrame(shakeRaf)
      shakeRaf = null
    }
  },
  attachAnchor(el: HTMLElement | null) {
    anchorEl = el
  },
  attachShake(el: HTMLElement | null) {
    shakeEl = el
  },
  attachFlash(el: HTMLElement | null) {
    flashEl = el
  },
  attachPunch(el: HTMLElement | null) {
    punchEl = el
  },
  registerDamageEl(i: number, el: HTMLElement | null) {
    dmgEls[i] = el
  },

  /** Full per-tap juice: flash, punch, damage-scaled shake, floating number. */
  hit(damage: number) {
    flash()
    punch()
    shake(Math.min(SHAKE_AMP_BASE + damage * SHAKE_AMP_PER_DAMAGE, SHAKE_AMP_MAX), SHAKE_DURATION_MS)
    damageNumber(damage)
  },

  subdue() {
    shake(SHAKE_AMP_SUBDUE, SHAKE_SUBDUE_MS)
  },
}
