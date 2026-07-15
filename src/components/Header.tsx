import { useLayoutEffect, useRef } from 'react'
import { animate } from 'motion/react'
import { useGameStore } from '../store/gameStore'
import { COUNTER_ROLL_S } from '../data/tuning'
import { formatNumber, formatRupiahCompact } from '../utils/format'

export function Header() {
  const uangRakyat = useGameStore((s) => s.uangRakyat)
  const justicePoints = useGameStore((s) => s.justicePoints)
  const valueRef = useRef<HTMLDivElement>(null)
  const displayed = useRef(0)

  // Counter roll: tween the rendered text imperatively so React never
  // renders per animation frame. Runs before paint to avoid a one-frame
  // flash of the target value.
  useLayoutEffect(() => {
    const el = valueRef.current
    if (!el || displayed.current === uangRakyat) return
    el.textContent = formatRupiahCompact(displayed.current)
    const controls = animate(displayed.current, uangRakyat, {
      duration: COUNTER_ROLL_S,
      ease: 'easeOut',
      onUpdate: (v) => {
        displayed.current = v
        el.textContent = formatRupiahCompact(v)
      },
    })
    return () => controls.stop()
  }, [uangRakyat])

  return (
    <header className="flex h-16 shrink-0 items-center justify-between rounded-lg bg-zinc-900 px-3">
      <div>
        <div className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
          Uang Rakyat
        </div>
        <div ref={valueRef} className="text-2xl font-bold text-green-400 tabular-nums">
          {formatRupiahCompact(uangRakyat)}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
          Poin Keadilan
        </div>
        <div className="text-sm font-semibold text-amber-400 tabular-nums">
          {formatNumber(justicePoints)} JP
        </div>
      </div>
    </header>
  )
}
