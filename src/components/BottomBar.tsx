import { STARTER_WEAPON } from '../data/weapons'
import { BASE_TAP_DAMAGE } from '../data/tuning'

export function BottomBar() {
  const damage = BASE_TAP_DAMAGE * STARTER_WEAPON.damageMultiplier

  return (
    <div className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex h-full flex-1 items-center gap-3 rounded-lg bg-zinc-900 px-3">
        <span className="text-2xl">👊</span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-200">
            {STARTER_WEAPON.name}
          </div>
          <div className="text-[10px] text-zinc-500 tabular-nums">
            x{STARTER_WEAPON.damageMultiplier} · {damage} DMG
          </div>
        </div>
      </div>
      {/* Upgrade wires up with the economy in M5 */}
      <button
        type="button"
        disabled
        className="h-full rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-zinc-600"
      >
        ↑ Tingkatkan
      </button>
    </div>
  )
}
