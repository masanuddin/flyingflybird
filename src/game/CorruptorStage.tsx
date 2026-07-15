import { motion } from 'motion/react'
import { HpBar } from '../components/HpBar'
import { selectCorruptor, useGameStore } from '../store/gameStore'
import { faceForHp } from '../data/tuning'
import { formatRupiah } from '../utils/format'

export function CorruptorStage() {
  const corruptor = useGameStore(selectCorruptor)
  const hp = useGameStore((s) => s.hp)
  const phase = useGameStore((s) => s.phase)
  const tap = useGameStore((s) => s.tap)

  const subdued = phase === 'subdued'
  const face = faceForHp(hp / corruptor.maxHp, subdued)

  return (
    <section className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-lg bg-zinc-900 p-3">
      <div className="shrink-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-zinc-200">
            {corruptor.name} · {corruptor.occupation}
          </span>
          <span className="shrink-0 text-xs font-semibold text-amber-400 tabular-nums">
            {formatRupiah(corruptor.amountStolen)}
          </span>
        </div>
        <HpBar current={hp} max={corruptor.maxHp} />
      </div>

      {/* Tap target — fills the stage so the corruptor owns ~60–70% of the play area */}
      <button
        type="button"
        onPointerDown={tap}
        className="flex flex-1 items-center justify-center rounded-lg bg-zinc-800/60 transition-transform duration-75 active:scale-95"
        aria-label={`Tindak ${corruptor.name}`}
      >
        {/* Fixed sprite slot — final art at M8 swaps in without layout rework */}
        <motion.div
          key={corruptor.id}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex h-40 w-40 items-center justify-center"
        >
          <span className="text-8xl leading-none">{face}</span>
        </motion.div>
      </button>

      {subdued && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="rounded-lg bg-green-500/90 px-6 py-3 text-3xl font-black tracking-wider text-zinc-950">
            DIBEKUK!
          </span>
        </motion.div>
      )}
    </section>
  )
}
