import { BottomSheet } from '../components/BottomSheet'
import { useUiStore } from '../store/uiStore'
import { useGameStore } from '../store/gameStore'
import { WEAPONS } from '../data/weapons'
import { sound } from '../systems/sound'
import { formatNumber } from '../utils/format'

function handleBuy() {
  if (useGameStore.getState().buyNextWeapon()) sound.purchase()
}

export function SenjataSheet() {
  const open = useUiStore((s) => s.activeSheet === 'senjata')
  const close = useUiStore((s) => s.closeSheet)
  const justicePoints = useGameStore((s) => s.justicePoints)
  const owned = useGameStore((s) => s.activeWeaponIndex)
  const weaponLevels = useGameStore((s) => s.weaponLevels)

  return (
    <BottomSheet open={open} title="Senjata" onClose={close}>
      <div className="mb-3 text-xs text-zinc-500">
        Saldo: <span className="font-semibold text-amber-400">{formatNumber(justicePoints)} JP</span>
        {' · '}Tier harus dibeli berurutan.
      </div>
      <ul className="flex flex-col gap-2">
        {WEAPONS.map((weapon, i) => {
          const isOwned = i <= owned
          const isActive = i === owned
          const isNext = i === owned + 1
          const level = weaponLevels[weapon.id] ?? 0
          return (
            <li
              key={weapon.id}
              className={`flex items-center gap-3 rounded-lg border p-3 ${
                isActive
                  ? 'border-amber-500/60 bg-zinc-900'
                  : isOwned || isNext
                    ? 'border-zinc-800 bg-zinc-900'
                    : 'border-zinc-900 bg-zinc-950 opacity-60'
              }`}
            >
              <span className="text-3xl">{weapon.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-zinc-200">{weapon.name}</div>
                <div className="text-[11px] text-zinc-500 tabular-nums">
                  x{weapon.damageMultiplier}
                  {isOwned && ` · Lv ${level}`}
                </div>
              </div>
              {isActive && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-zinc-950">
                  DIPAKAI
                </span>
              )}
              {isOwned && !isActive && <span className="text-sm text-green-400">✓</span>}
              {isNext && (
                <button
                  type="button"
                  onPointerDown={handleBuy}
                  disabled={justicePoints < weapon.cost}
                  aria-label={`Beli ${weapon.name}`}
                  className={`rounded-lg px-3 py-2 text-xs font-bold tabular-nums ${
                    justicePoints >= weapon.cost
                      ? 'bg-amber-500 text-zinc-950 active:scale-95'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {formatNumber(weapon.cost)} JP
                </button>
              )}
              {!isOwned && !isNext && <span className="text-lg">🔒</span>}
            </li>
          )
        })}
      </ul>
    </BottomSheet>
  )
}
