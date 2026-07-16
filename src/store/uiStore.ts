import { create } from 'zustand'

export type SheetId = 'senjata' | 'hukuman' | 'settings'

type UiState = {
  activeSheet: SheetId | null
  openSheet: (id: SheetId) => void
  closeSheet: () => void
  toggleSheet: (id: SheetId) => void
}

/** Screens/sheets are plain UI state — no router (architecture invariant #7). */
export const useUiStore = create<UiState>()((set, get) => ({
  activeSheet: null,
  openSheet: (id) => set({ activeSheet: id }),
  closeSheet: () => set({ activeSheet: null }),
  toggleSheet: (id) => set({ activeSheet: get().activeSheet === id ? null : id }),
}))
