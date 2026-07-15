import {
  selectDamage,
  selectWeapon,
  selectWeaponLevel,
  useGameStore,
} from '../store/gameStore'
import { upgradeCost } from '../data/tuning'
import { sound } from '../systems/sound'
import { formatNumber } from '../utils/format'

function handleUpgrade() {
  if (useGameStore.getState().upgradeWeapon()) sound.purchase()
}

export function BottomBar() {
  const weapon = useGameStore(selectWeapon)
  const level = useGameStore(selectWeaponLevel)
  const damage = useGameStore(selectDamage)
  const justicePoints = useGameStore((s) => s.justicePoints)

  const cost = upgradeCost(level)
  const affordable = justicePoints >= cost

  return (
    <div className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex h-full flex-1 items-center gap-3 rounded-lg bg-zinc-900 px-3">
        <span className="text-2xl">{weapon.emoji}</span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-200">{weapon.name}</div>
          <div className="text-[10px] text-zinc-500 tabular-nums">
            x{weapon.damageMultiplier} · Lv {level} · {damage} DMG
          </div>
        </div>
      </div>
      {/* Empty state by design: cost stays visible when JP is short */}
      <button
        type="button"
        onPointerDown={handleUpgrade}
        disabled={!affordable}
        className={`h-full rounded-lg px-4 text-sm font-semibold transition-transform duration-75 ${
          affordable
            ? 'bg-amber-500 text-zinc-950 active:scale-95'
            : 'bg-zinc-900 text-zinc-600'
        }`}
      >
        <span className="block leading-tight">↑ Tingkatkan</span>
        <span className="block text-[10px] leading-tight tabular-nums opacity-80">
          {formatNumber(cost)} JP
        </span>
      </button>
    </div>
  )
}
