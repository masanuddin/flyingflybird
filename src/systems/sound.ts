/**
 * Single sound manager (architecture invariant #10). Greybox SFX are
 * WebAudio-synthesized — zero asset payload, nothing to preload. Real
 * samples can replace these at M8 without changing any call site.
 *
 * The AudioContext unlocks lazily on the first play; `tap()` always fires
 * from a pointerdown gesture, and every other SFX follows a tap, so the
 * context is unlocked before it is ever needed. Mute UI lands with the
 * Settings sheet (M7); the API is ready.
 */

let ctx: AudioContext | null = null
let muted = false

function ensureCtx(): AudioContext | null {
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

type ToneOpts = {
  /** Seconds from now. */
  at?: number
  dur: number
  type: OscillatorType
  gain: number
  /** Optional pitch slide target. */
  to?: number
}

function tone(freq: number, opts: ToneOpts) {
  if (muted) return
  const c = ensureCtx()
  if (!c) return
  const t0 = c.currentTime + (opts.at ?? 0)
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = opts.type
  osc.frequency.setValueAtTime(freq, t0)
  if (opts.to !== undefined) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + opts.dur)
  g.gain.setValueAtTime(opts.gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + opts.dur + 0.02)
}

export const sound = {
  setMuted(m: boolean) {
    muted = m
  },
  isMuted() {
    return muted
  },
  /** Weapon thud on every landed tap. */
  tap() {
    tone(140, { dur: 0.08, type: 'triangle', gain: 0.25, to: 55 })
  },
  /** Coin ding + register tick when a citizen collects. */
  collect() {
    tone(1975, { dur: 0.03, type: 'square', gain: 0.07 })
    tone(1319, { at: 0.02, dur: 0.18, type: 'sine', gain: 0.2 })
  },
  /** Two-note sting when the corruptor is subdued. */
  subdue() {
    tone(392, { dur: 0.12, type: 'sawtooth', gain: 0.2 })
    tone(523, { at: 0.1, dur: 0.22, type: 'sawtooth', gain: 0.2 })
  },
  /** Cha-ching on any successful purchase/upgrade. */
  purchase() {
    tone(1047, { dur: 0.08, type: 'square', gain: 0.12 })
    tone(1568, { at: 0.07, dur: 0.16, type: 'square', gain: 0.12 })
  },
}
