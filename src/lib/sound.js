// Tiny synthesized sound-effect layer — Web Audio oscillators, no audio files,
// no dependency. Each helper is a short envelope (attack + exponential decay).

let ctx = null
let enabled = true

if (typeof localStorage !== 'undefined') {
  const stored = localStorage.getItem('explained:sound')
  if (stored !== null) enabled = stored === '1'
}

export function isSoundEnabled() {
  return enabled
}

export function setSoundEnabled(value) {
  enabled = value
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('explained:sound', value ? '1' : '0')
  }
}

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    ctx = new AudioCtx()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// One short tone: attack to `gain`, exponential decay to silence, optional
// frequency glide (for pops/whooshes), optional start delay (for chime pairs).
function tone({ freq, duration = 0.12, type = 'sine', gain = 0.07, delay = 0, glideTo }) {
  if (!enabled) return
  try {
    const c = getCtx()
    const start = c.currentTime + delay
    const osc = c.createOscillator()
    const amp = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + duration)
    amp.gain.setValueAtTime(gain, start)
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(amp)
    amp.connect(c.destination)
    osc.start(start)
    osc.stop(start + duration + 0.02)
  } catch {
    // Audio isn't critical to app function — never let it throw into a click handler.
  }
}

export const playClick = () => tone({ freq: 700, duration: 0.045, type: 'square', gain: 0.045 })

export const playPop = () => tone({ freq: 480, duration: 0.09, type: 'sine', gain: 0.06, glideTo: 720 })

export const playSuccess = () => {
  tone({ freq: 520, duration: 0.09, gain: 0.06 })
  tone({ freq: 780, duration: 0.15, gain: 0.06, delay: 0.08 })
}

export const playError = () => tone({ freq: 200, duration: 0.18, type: 'sawtooth', gain: 0.05, glideTo: 110 })

export const playWhoosh = () => tone({ freq: 260, duration: 0.22, type: 'sine', gain: 0.035, glideTo: 820 })

export const playTick = () => tone({ freq: 900, duration: 0.03, type: 'square', gain: 0.03 })
