import { useUiStore, type SheetId } from '../store/uiStore'

const NAV_TABS: { id: 'home' | SheetId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'senjata', label: 'Senjata', icon: '🩴' },
  { id: 'hukuman', label: 'Hukuman', icon: '⚖️' },
]

/** 3 tabs only. Senjata/Hukuman open as bottom sheets over the battle. */
export function NavBar() {
  const activeSheet = useUiStore((s) => s.activeSheet)

  const handleTab = (id: 'home' | SheetId) => {
    const ui = useUiStore.getState()
    if (id === 'home') ui.closeSheet()
    else ui.toggleSheet(id)
  }

  return (
    <nav className="relative z-40 grid h-14 shrink-0 grid-cols-3 gap-2">
      {NAV_TABS.map((tab) => {
        const isActive = tab.id === 'home' ? activeSheet === null : activeSheet === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onPointerDown={() => handleTab(tab.id)}
            className={`flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium ${
              isActive ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-900 text-zinc-500'
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
