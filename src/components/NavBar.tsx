const NAV_TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'senjata', label: 'Senjata', icon: '🩴' },
  { id: 'hukuman', label: 'Hukuman', icon: '⚖️' },
] as const

/** Greybox nav — tabs open as bottom sheets over the battle scrim in M7. */
export function NavBar() {
  return (
    <nav className="grid h-14 shrink-0 grid-cols-3 gap-2">
      {NAV_TABS.map((tab, i) => (
        <button
          key={tab.id}
          type="button"
          className={`flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium ${
            i === 0 ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-900 text-zinc-500'
          }`}
        >
          <span className="text-base leading-none">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
