import { useGameStore } from '../store/gameStore'
import { formatNumber, formatRupiah } from '../utils/format'

export function Header() {
  const uangRakyat = useGameStore((s) => s.uangRakyat)
  const justicePoints = useGameStore((s) => s.justicePoints)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between rounded-lg bg-zinc-900 px-3">
      <div>
        <div className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
          Uang Rakyat
        </div>
        <div className="text-2xl font-bold text-green-400 tabular-nums">
          {formatRupiah(uangRakyat)}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
          Poin Keadilan
        </div>
        <div className="text-sm font-semibold text-amber-400 tabular-nums">
          {formatNumber(justicePoints)} JP
        </div>
      </div>
    </header>
  )
}
