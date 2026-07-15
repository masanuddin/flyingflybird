import { useEffect, useRef } from 'react'
import { coinSim } from '../systems/coinSim'

/** Floor band: coins land here, citizens collect. Bounds feed the sim. */
export function FloorBand() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    coinSim.attachFloor(ref.current)
    return () => coinSim.attachFloor(null)
  }, [])

  return <div ref={ref} className="h-28 shrink-0 rounded-lg bg-zinc-900/50" />
}
