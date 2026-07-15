import { useGameStore } from '../store/gameStore'
import { sound } from '../systems/sound'

function handleStart() {
  const store = useGameStore.getState()
  if (store.phase !== 'bossReady') return
  store.startBossFight()
  sound.tap()
}

/** Boss entry chip: locked → available → active(20s) → gate countdown. */
export function BossButton() {
  const bossState = useGameStore((s) => s.bossState)
  const gateRemaining = useGameStore((s) => s.gateRemaining)

  if (bossState === 'locked') {
    return (
      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
        🔒 BOS
      </span>
    )
  }
  if (bossState === 'available') {
    return (
      <button
        type="button"
        onPointerDown={handleStart}
        className="animate-pulse rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-zinc-950"
      >
        ⚔️ BOS SIAP
      </button>
    )
  }
  if (bossState === 'active') {
    return (
      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-zinc-950">
        ⏱ BOS
      </span>
    )
  }
  return (
    <span className="rounded-full bg-red-950 px-2 py-0.5 text-[10px] font-semibold text-red-400 tabular-nums">
      🏃 BOS KABUR · {gateRemaining} lagi
    </span>
  )
}
