import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { BOSS_TIMER_S } from '../data/tuning'
import { sound } from '../systems/sound'

/**
 * Boss countdown. Mounted only during 'bossFight'; renders imperatively
 * (textContent + scaleX) in its own rAF — the store is only touched once,
 * on expiry.
 */
export function BossTimer() {
  const textRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number | null = null
    const tick = () => {
      raf = null
      const { phase, bossDeadline, bossTimeout } = useGameStore.getState()
      if (phase !== 'bossFight' || bossDeadline === null) return
      const left = Math.max(0, bossDeadline - Date.now())
      if (textRef.current) textRef.current.textContent = (left / 1000).toFixed(1)
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${left / (BOSS_TIMER_S * 1000)})`
      if (left <= 0) {
        sound.escape()
        bossTimeout()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="mt-1">
      <div className="flex justify-between text-[10px] font-semibold text-red-400">
        <span>⏱ SISA WAKTU</span>
        <span ref={textRef} className="tabular-nums" />
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          ref={barRef}
          className="h-full w-full origin-left rounded-full bg-red-500 will-change-transform"
        />
      </div>
    </div>
  )
}
