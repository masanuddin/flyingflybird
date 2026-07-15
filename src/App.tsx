const NAV_TABS = ['Home', 'Senjata', 'Hukuman'] as const

type ZonePlaceholderProps = {
  label: string
  className?: string
}

function ZonePlaceholder({ label, className = '' }: ZonePlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 ${className}`}
    >
      <span className="text-[10px] font-medium tracking-widest text-zinc-600 uppercase">
        {label}
      </span>
    </div>
  )
}

export default function App() {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col gap-2 p-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      <ZonePlaceholder label="Header · Uang Rakyat + JP" className="h-16 shrink-0" />
      <ZonePlaceholder label="Stage · Koruptor + HP" className="flex-1" />
      <ZonePlaceholder label="Floor · Koin + Warga" className="h-28 shrink-0" />
      <ZonePlaceholder label="Senjata + Upgrade" className="h-16 shrink-0" />
      <nav className="grid h-14 shrink-0 grid-cols-3 gap-2">
        {NAV_TABS.map((tab) => (
          <div
            key={tab}
            className="flex items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 text-xs text-zinc-500"
          >
            {tab}
          </div>
        ))}
      </nav>
    </div>
  )
}
