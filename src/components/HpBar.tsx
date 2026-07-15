type HpBarProps = {
  current: number
  max: number
}

export function HpBar({ current, max }: HpBarProps) {
  const fraction = max > 0 ? current / max : 0

  return (
    <div className="w-full">
      <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
        {/* scaleX, not width — animated nodes may only move via transform/opacity */}
        <div
          className="h-full w-full origin-left rounded-full bg-red-500 transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${fraction})` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-500 tabular-nums">
        <span>HP</span>
        <span>
          {current} / {max}
        </span>
      </div>
    </div>
  )
}
