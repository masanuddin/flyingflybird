import { useEffect, useRef } from 'react'
import { coinSim } from '../systems/coinSim'
import { fx } from '../systems/fx'
import { CITIZEN_EMOJIS, MAX_COINS, MAX_DAMAGE_NUMBERS } from '../data/tuning'

const COIN_SLOTS = Array.from({ length: MAX_COINS }, (_, i) => i)
const DMG_SLOTS = Array.from({ length: MAX_DAMAGE_NUMBERS }, (_, i) => i)

/**
 * Pooled entity DOM. Nodes mount exactly once; the sim moves them
 * imperatively via transform/opacity — no React state per frame.
 */
export function EntityLayer() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    coinSim.attachLayer(layerRef.current)
    fx.attachLayer(layerRef.current)
    return () => {
      coinSim.attachLayer(null)
      fx.attachLayer(null)
    }
  }, [])

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {COIN_SLOTS.map((i) => (
        <div
          key={`coin-${i}`}
          data-coin=""
          ref={(el) => coinSim.registerCoinEl(i, el)}
          className="absolute top-0 left-0 text-2xl leading-none will-change-transform"
          style={{ opacity: 0 }}
        >
          🪙
        </div>
      ))}
      {CITIZEN_EMOJIS.map((emoji, i) => (
        <div
          key={`citizen-${i}`}
          data-citizen=""
          ref={(el) => coinSim.registerCitizenEl(i, el)}
          className="absolute top-0 left-0 text-3xl leading-none will-change-transform"
          style={{ opacity: 0 }}
        >
          {emoji}
        </div>
      ))}
      {DMG_SLOTS.map((i) => (
        <div
          key={`dmg-${i}`}
          data-dmg=""
          ref={(el) => fx.registerDamageEl(i, el)}
          className="absolute top-0 left-0 text-xl font-black text-red-400 will-change-transform tabular-nums"
          style={{ opacity: 0 }}
        />
      ))}
    </div>
  )
}
