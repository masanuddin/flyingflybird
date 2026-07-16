import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'

type BottomSheetProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Shared sheet shell: ~76% height over a dimmed battle scrim; the bottom
 *  nav stays above it (z-40) so tabs keep switching sheets. */
export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30 bg-black/60"
            onPointerDown={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md will-change-transform"
          >
            <div className="flex h-[76dvh] flex-col rounded-t-2xl border border-b-0 border-zinc-800 bg-zinc-950 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+5rem)]">
              <div className="mb-3 flex shrink-0 items-center justify-between">
                <h2 className="text-base font-bold text-zinc-100">{title}</h2>
                <button
                  type="button"
                  onPointerDown={onClose}
                  aria-label="Tutup"
                  className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400"
                >
                  ✕
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
