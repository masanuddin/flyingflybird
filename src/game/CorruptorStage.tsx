import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HpBar } from '../components/HpBar'
import { BossButton } from './BossButton'
import { BossTimer } from './BossTimer'
import { selectCorruptor, selectLocation, useGameStore } from '../store/gameStore'
import { BOSS_TIMER_S, COINS_PER_TAP, MAX_COINS, faceForHp } from '../data/tuning'
import { coinSim } from '../systems/coinSim'
import { fx } from '../systems/fx'
import { sound } from '../systems/sound'
import { formatRupiah } from '../utils/format'

function handleTap() {
  const store = useGameStore.getState()
  if (store.phase === 'bossReady') {
    store.startBossFight()
    sound.tap()
    return
  }
  const dealt = store.tap()
  if (dealt <= 0) return
  sound.tap()
  coinSim.spawnCoins(COINS_PER_TAP)
  fx.hit(dealt)
  const after = useGameStore.getState()
  if (after.phase === 'subdued') {
    sound.subdue()
    fx.subdue()
    // Boss payoff: a full coin burst — the recovered-money explosion.
    if (after.bossState === 'active') coinSim.spawnCoins(MAX_COINS)
  }
}

export function CorruptorStage() {
  const location = useGameStore(selectLocation)
  const corruptor = useGameStore(selectCorruptor)
  const hp = useGameStore((s) => s.hp)
  const phase = useGameStore((s) => s.phase)
  const bossState = useGameStore((s) => s.bossState)

  const subdued = phase === 'subdued'
  const isBoss = phase === 'bossReady' || phase === 'bossFight' || (subdued && bossState === 'active')
  const face = faceForHp(hp / corruptor.maxHp, subdued)

  // Transient "boss escaped" banner on the transition into the gate.
  const [showEscape, setShowEscape] = useState(false)
  const prevBossState = useRef(bossState)
  useEffect(() => {
    const was = prevBossState.current
    prevBossState.current = bossState
    if (was !== 'gate' && bossState === 'gate') {
      setShowEscape(true)
      const t = setTimeout(() => setShowEscape(false), 1400)
      return () => clearTimeout(t)
    }
  }, [bossState])

  // Case card: non-blocking slide-in per new case, auto-dismiss ≤2s.
  const [visibleCase, setVisibleCase] = useState<string | null>(null)
  const caseShownFor = useRef<string | null>(null)
  useEffect(() => {
    if (phase !== 'fighting' && phase !== 'bossFight') return
    if (caseShownFor.current === corruptor.id) return
    caseShownFor.current = corruptor.id
    setVisibleCase(corruptor.id)
    const t = setTimeout(() => setVisibleCase(null), 2000)
    return () => clearTimeout(t)
  }, [corruptor.id, phase])

  return (
    <section className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-lg bg-zinc-900 p-3">
      <div className="shrink-0">
        <div className="flex items-center justify-between gap-2">
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase"
          >
            📍 {location.name}
          </motion.div>
          <BossButton />
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="flex min-w-0 items-baseline gap-1.5 truncate text-sm font-semibold text-zinc-200">
            {isBoss && (
              <span className="shrink-0 rounded bg-red-500 px-1 text-[9px] font-black text-zinc-950">
                BOS
              </span>
            )}
            {corruptor.name} · {corruptor.occupation}
          </span>
          <span className="shrink-0 text-xs font-semibold text-amber-400 tabular-nums">
            {formatRupiah(corruptor.amountStolen)}
          </span>
        </div>
        <HpBar current={hp} max={corruptor.maxHp} />
        {phase === 'bossFight' && <BossTimer />}
      </div>

      <button
        type="button"
        onPointerDown={handleTap}
        className="relative flex flex-1 items-center justify-center rounded-lg bg-zinc-800/60 transition-transform duration-75 active:scale-95"
        aria-label={phase === 'bossReady' ? `Mulai bos ${corruptor.name}` : `Tindak ${corruptor.name}`}
      >
        {phase === 'bossReady' ? (
          <motion.div
            key="boss-teaser"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-7xl leading-none">⚠️</span>
            <span className="text-sm font-bold text-amber-400">Ketuk untuk hadapi bos!</span>
            <span className="text-[10px] text-zinc-500">
              Tumbangkan dalam {BOSS_TIMER_S} detik atau ia kabur
            </span>
          </motion.div>
        ) : (
          /* Fixed sprite slot — final art at M8 swaps in without layout
             rework. Also the coin spawn anchor (chest position). */
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
        )}
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

      {showEscape && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="rounded-lg bg-red-500/90 px-6 py-3 text-3xl font-black tracking-wider text-zinc-950">
            KABUR! 🏃💨
          </span>
        </motion.div>
      )}

      <AnimatePresence>
        {visibleCase && (
          <motion.div
            key={visibleCase}
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-none absolute inset-x-2 top-20 rounded-lg border border-zinc-700 bg-zinc-950/95 p-2.5"
          >
            <div className="truncate text-xs font-semibold text-zinc-200">
              📋 {corruptor.caseDescription}
            </div>
            <div className="text-[11px] text-amber-400 tabular-nums">
              Kerugian negara: {formatRupiah(corruptor.amountStolen)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
