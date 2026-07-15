import { useGameStore } from '../store/gameStore'
import {
  CITIZEN_SPEED,
  COIN_GRAVITY,
  COIN_POP_VY_MAX,
  COIN_POP_VY_MIN,
  COLLECT_RADIUS,
  FLOOR_PADDING_X,
  MAX_CITIZENS,
  MAX_COINS,
} from '../data/tuning'

/**
 * Imperative sim layer for the signature mechanic. Owns all entity motion:
 * pooled coin/citizen DOM nodes are mutated directly (transform/opacity)
 * inside one rAF loop — React never renders per frame. Zustand is only
 * touched on discrete events (a citizen collecting a coin).
 */

type Coin = {
  active: boolean
  landed: boolean
  claimed: boolean
  x: number
  y: number
  spawnX: number
  spawnY: number
  vx: number
  vy: number
  age: number
  landTime: number
  landX: number
  landY: number
  el: HTMLElement | null
}

type CitizenState = 'idle' | 'toCoin' | 'returning'

type Citizen = {
  state: CitizenState
  x: number
  y: number
  homeX: number
  homeY: number
  facing: 1 | -1
  coin: Coin | null
  el: HTMLElement | null
}

type Rect = { left: number; top: number; width: number; height: number }

const coins: Coin[] = Array.from({ length: MAX_COINS }, () => ({
  active: false,
  landed: false,
  claimed: false,
  x: 0,
  y: 0,
  spawnX: 0,
  spawnY: 0,
  vx: 0,
  vy: 0,
  age: 0,
  landTime: 0,
  landX: 0,
  landY: 0,
  el: null,
}))

const citizens: Citizen[] = Array.from({ length: MAX_CITIZENS }, () => ({
  state: 'idle' as CitizenState,
  x: 0,
  y: 0,
  homeX: 0,
  homeY: 0,
  facing: 1 as const,
  coin: null,
  el: null,
}))

let layerEl: HTMLElement | null = null
let floorEl: HTMLElement | null = null
let anchorEl: HTMLElement | null = null
let floorRect: Rect | null = null
let rafId: number | null = null
let lastTime = 0
let advanceRequested = false

function relRect(el: HTMLElement): Rect {
  const layer = layerEl!.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  return { left: r.left - layer.left, top: r.top - layer.top, width: r.width, height: r.height }
}

function measureFloor(): Rect | null {
  if (!layerEl || !floorEl) return null
  floorRect = relRect(floorEl)
  return floorRect
}

function layoutHomes() {
  const rect = measureFloor()
  if (!rect) return
  citizens.forEach((c, i) => {
    c.homeX = rect.left + ((i + 0.5) / MAX_CITIZENS) * rect.width
    c.homeY = rect.top + rect.height - 14
    if (c.state === 'idle') {
      c.x = c.homeX
      c.y = c.homeY
    }
    if (c.el) {
      c.el.style.opacity = '1'
      renderCitizen(c)
    }
  })
}

function renderCoin(coin: Coin) {
  if (!coin.el) return
  coin.el.style.transform = `translate3d(${coin.x}px, ${coin.y}px, 0) translate(-50%, -50%)`
}

function renderCitizen(c: Citizen) {
  if (!c.el) return
  c.el.style.transform =
    `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -100%)` +
    (c.facing === -1 ? ' scaleX(-1)' : '')
}

function activeCoinCount(): number {
  let n = 0
  for (const coin of coins) if (coin.active) n++
  return n
}

function ensureLoop() {
  if (rafId !== null) return
  lastTime = performance.now()
  rafId = requestAnimationFrame(tick)
}

function moveToward(c: Citizen, tx: number, ty: number, step: number): boolean {
  const dx = tx - c.x
  const dy = ty - c.y
  const dist = Math.hypot(dx, dy)
  if (dx !== 0) c.facing = dx < 0 ? -1 : 1
  if (dist <= step) {
    c.x = tx
    c.y = ty
    return true
  }
  c.x += (dx / dist) * step
  c.y += (dy / dist) * step
  return false
}

function collect(citizen: Citizen, coin: Coin) {
  // The ONLY call site that credits uangRakyat (via store.collectCoin).
  useGameStore.getState().collectCoin(activeCoinCount())
  coin.active = false
  coin.claimed = false
  if (coin.el) coin.el.style.opacity = '0'
  citizen.coin = null
  citizen.state = 'returning'
}

function tick(now: number) {
  rafId = null
  const dt = Math.min(now - lastTime, 32) / 1000
  lastTime = now
  const store = useGameStore.getState()

  for (const coin of coins) {
    if (!coin.active || coin.landed) continue
    coin.age += dt
    if (coin.age >= coin.landTime) {
      coin.x = coin.landX
      coin.y = coin.landY
      coin.landed = true
    } else {
      coin.x = coin.spawnX + coin.vx * coin.age
      coin.y = coin.spawnY + coin.vy * coin.age + 0.5 * COIN_GRAVITY * coin.age * coin.age
    }
    renderCoin(coin)
  }

  for (const citizen of citizens) {
    if (citizen.state === 'idle') {
      let best: Coin | null = null
      let bestDist = Infinity
      for (const coin of coins) {
        if (!coin.active || !coin.landed || coin.claimed) continue
        const d = (coin.x - citizen.x) ** 2 + (coin.y - citizen.y) ** 2
        if (d < bestDist) {
          bestDist = d
          best = coin
        }
      }
      if (best) {
        best.claimed = true
        citizen.coin = best
        citizen.state = 'toCoin'
      }
    }

    if (citizen.state === 'toCoin') {
      const coin = citizen.coin
      if (!coin || !coin.active) {
        citizen.coin = null
        citizen.state = 'returning'
      } else {
        const arrived = moveToward(citizen, coin.x, coin.y, CITIZEN_SPEED * dt)
        const dist = Math.hypot(coin.x - citizen.x, coin.y - citizen.y)
        if (arrived || dist <= COLLECT_RADIUS) collect(citizen, coin)
        renderCitizen(citizen)
      }
    }

    if (citizen.state === 'returning') {
      if (moveToward(citizen, citizen.homeX, citizen.homeY, CITIZEN_SPEED * dt)) {
        citizen.state = 'idle'
        citizen.facing = 1
      }
      renderCitizen(citizen)
    }
  }

  // Subdued corruptor is only cleared after citizens finish the floor.
  if (store.phase === 'subdued' && !advanceRequested && activeCoinCount() === 0) {
    advanceRequested = true
    store.scheduleAdvance()
  }

  const busy = activeCoinCount() > 0 || citizens.some((c) => c.state !== 'idle')
  if (busy) rafId = requestAnimationFrame(tick)
}

function handleResize() {
  layoutHomes()
}

export const coinSim = {
  attachLayer(el: HTMLElement | null) {
    layerEl = el
    if (el) {
      window.addEventListener('resize', handleResize)
      layoutHomes()
    } else {
      window.removeEventListener('resize', handleResize)
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = null
      for (const coin of coins) coin.active = false
      for (const c of citizens) {
        c.state = 'idle'
        c.coin = null
      }
    }
  },

  attachFloor(el: HTMLElement | null) {
    floorEl = el
    if (el) layoutHomes()
  },

  attachAnchor(el: HTMLElement | null) {
    anchorEl = el
  },

  registerCoinEl(i: number, el: HTMLElement | null) {
    coins[i].el = el
  },

  registerCitizenEl(i: number, el: HTMLElement | null) {
    citizens[i].el = el
  },

  /** Spawn up to `n` coins from the corruptor's chest. Silently skips when
   *  the pool is exhausted — the value is already banked in the store and
   *  pays out through the coins that are on screen. */
  spawnCoins(n: number) {
    if (!layerEl || !anchorEl) return
    const rect = floorRect ?? measureFloor()
    if (!rect) return
    advanceRequested = false

    const anchor = relRect(anchorEl)
    const spawnX = anchor.left + anchor.width / 2
    const spawnY = anchor.top + anchor.height / 2

    for (let k = 0; k < n; k++) {
      const coin = coins.find((c) => !c.active)
      if (!coin) return

      const landX =
        rect.left + FLOOR_PADDING_X + Math.random() * (rect.width - FLOOR_PADDING_X * 2)
      const landY = rect.top + 18 + Math.random() * (rect.height - 34)
      const vy = COIN_POP_VY_MIN + Math.random() * (COIN_POP_VY_MAX - COIN_POP_VY_MIN)
      const drop = landY - spawnY
      const landTime = (-vy + Math.sqrt(vy * vy + 2 * COIN_GRAVITY * drop)) / COIN_GRAVITY

      coin.active = true
      coin.landed = false
      coin.claimed = false
      coin.spawnX = spawnX + (Math.random() * 16 - 8)
      coin.spawnY = spawnY
      coin.x = coin.spawnX
      coin.y = coin.spawnY
      coin.vy = vy
      coin.vx = (landX - coin.spawnX) / landTime
      coin.age = 0
      coin.landTime = landTime
      coin.landX = landX
      coin.landY = landY
      if (coin.el) {
        coin.el.style.opacity = '1'
        renderCoin(coin)
      }
    }
    ensureLoop()
  },
}
