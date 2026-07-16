import { BottomSheet } from '../components/BottomSheet'
import { useUiStore } from '../store/uiStore'
import { useGameStore } from '../store/gameStore'
import { clearSave } from '../utils/save'

function handleReset() {
  if (window.confirm('Hapus semua progres dan mulai dari awal?')) {
    clearSave()
    window.location.reload()
  }
}

export function SettingsSheet() {
  const open = useUiStore((s) => s.activeSheet === 'settings')
  const close = useUiStore((s) => s.closeSheet)
  const muted = useGameStore((s) => s.muted)
  const toggleMute = useGameStore((s) => s.toggleMute)

  return (
    <BottomSheet open={open} title="Pengaturan" onClose={close}>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onPointerDown={toggleMute}
          aria-pressed={muted}
          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3"
        >
          <span className="text-sm font-semibold text-zinc-200">Suara</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              muted ? 'bg-zinc-800 text-zinc-500' : 'bg-green-500/20 text-green-400'
            }`}
          >
            {muted ? '🔇 Mati' : '🔊 Nyala'}
          </span>
        </button>
        <button
          type="button"
          onPointerDown={handleReset}
          className="flex items-center justify-between rounded-lg border border-red-900/50 bg-zinc-900 p-3"
        >
          <span className="text-sm font-semibold text-red-400">Mulai Ulang</span>
          <span className="text-xs text-zinc-500">Hapus semua progres</span>
        </button>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-zinc-600">
          Semua koruptor dalam game ini fiktif.
          <br />
          Garuda Hacks 7.0 · Whack The Corruptor
        </p>
      </div>
    </BottomSheet>
  )
}
