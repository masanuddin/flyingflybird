import { BottomSheet } from '../components/BottomSheet'
import { useUiStore } from '../store/uiStore'
import { useGameStore } from '../store/gameStore'
import { PUNISHMENTS } from '../data/punishments'
import { sound } from '../systems/sound'
import { formatNumber } from '../utils/format'

function handleUnlock(id: string) {
  if (useGameStore.getState().unlockPunishment(id)) sound.purchase()
}

export function HukumanSheet() {
  const open = useUiStore((s) => s.activeSheet === 'hukuman')
  const close = useUiStore((s) => s.closeSheet)
  const justicePoints = useGameStore((s) => s.justicePoints)
  const unlocked = useGameStore((s) => s.unlockedPunishments)

  return (
    <BottomSheet open={open} title="Hukuman" onClose={close}>
      <div className="mb-3 text-xs text-zinc-500">
        Saldo: <span className="font-semibold text-amber-400">{formatNumber(justicePoints)} JP</span>
        {' · '}Konsekuensi nyata korupsi — edukatif, tanpa bonus.
      </div>
      <ul className="flex flex-col gap-2">
        {PUNISHMENTS.map((punishment) => {
          const isUnlocked = unlocked.includes(punishment.id)
          return (
            <li
              key={punishment.id}
              className={`flex items-center gap-3 rounded-lg border p-3 ${
                isUnlocked ? 'border-green-500/40 bg-zinc-900' : 'border-zinc-800 bg-zinc-900'
              }`}
            >
              <span className="text-3xl">{punishment.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-zinc-200">
                  {punishment.name}
                </div>
                <div className="text-[11px] leading-snug text-zinc-500">
                  {punishment.description}
                </div>
              </div>
              {isUnlocked ? (
                <span className="shrink-0 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400">
                  ✓ TERBUKA
                </span>
              ) : (
                <button
                  type="button"
                  onPointerDown={() => handleUnlock(punishment.id)}
                  disabled={justicePoints < punishment.cost}
                  aria-label={`Buka ${punishment.name}`}
                  className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold tabular-nums ${
                    justicePoints >= punishment.cost
                      ? 'bg-amber-500 text-zinc-950 active:scale-95'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {formatNumber(punishment.cost)} JP
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </BottomSheet>
  )
}
