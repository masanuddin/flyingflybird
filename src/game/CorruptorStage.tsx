import { motion } from 'motion/react'
import { HpBar } from '../components/HpBar'
import { selectCorruptor, useGameStore } from '../store/gameStore'
import { COINS_PER_TAP, faceForHp } from '../data/tuning'
import { coinSim } from '../systems/coinSim'
import { fx } from '../systems/fx'
import { sound } from '../systems/sound'
import { formatRupiah } from '../utils/format'

function handleTap() {
  const dealt = useGameStore.getState().tap()
  if (dealt <= 0) return
  sound.tap()
  coinSim.spawnCoins(COINS_PER_TAP)
  fx.hit(dealt)
  if (useGameStore.getState().phase === 'subdued') {
    sound.subdue()
    fx.subdue()
  }
}

export function CorruptorStage() {
  const corruptor = useGameStore(selectCorruptor)
  const hp = useGameStore((s) => s.hp)
  const phase = useGameStore((s) => s.phase)

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
        onPointerDown={handleTap}
        className="relative flex flex-1 items-center justify-center rounded-lg bg-zinc-800/60 transition-transform duration-75 active:scale-95"
        aria-label={`Tindak ${corruptor.name}`}
      >
        {/* Fixed sprite slot — final art at M8 swaps in without layout rework.
            Also the coin spawn anchor (chest position). */}
        <motion.div
          key={corruptor.id}
          ref={(el) => {
            coinSim.attachAnchor(el)
            fx.attachAnchor(el)
          }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex h-40 w-40 items-center justify-center"
        >
          <span
            ref={(el) => fx.attachPunch(el)}
            className="inline-block text-8xl leading-none will-change-transform"
          >
            {face}
          </span>
        </motion.div>
        {/* Hit flash — opacity-only, sits above the sprite */}
        <div
          ref={(el) => fx.attachFlash(el)}
          className="pointer-events-none absolute inset-0 rounded-lg bg-white"
          style={{ opacity: 0 }}
        />
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
