import { Header } from './components/Header'
import { CorruptorStage } from './game/CorruptorStage'
import { EntityLayer } from './game/EntityLayer'
import { FloorBand } from './components/FloorBand'
import { BottomBar } from './components/BottomBar'
import { NavBar } from './components/NavBar'

export default function App() {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col gap-2 p-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      <Header />
      {/* Play area: coins fly from the stage into the floor band, so the
          pooled EntityLayer overlays both in one coordinate space. */}
      <div className="relative flex min-h-0 flex-1 flex-col gap-2">
        <CorruptorStage />
        <FloorBand />
        <EntityLayer />
      </div>
      <BottomBar />
      <NavBar />
    </div>
  )
}
