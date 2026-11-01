// Dia: the logo's four squares as a small character for the moments that go wrong or go quiet.
// mood: 'calm' (empty) | 'offline' (drifting apart; tap to scatter, it springs back) | 'error' (one square out of place)
//       | 'loading' (turning) | 'happy' (hops). Decorative: the text beside it says what happened and what to do.
import { useRef, useState } from 'react'

// A 2 x 2 grid, rotated 45 degrees below, so the squares read as top, right, left and bottom (as in the logo)
const SQUARES = [
  ['t', 30.5, 30.5],
  ['r', 49.5, 30.5],
  ['l', 30.5, 49.5],
  ['b', 49.5, 49.5],
]

export function Dia({ mood = 'calm', size = 96, playful = mood === 'offline', className }) {
  const ref = useRef(null)
  const [taps, setTaps] = useState(0)
  const timer = useRef()

  // The tap-toy: every tap throws the squares a different way, then they spring home
  const scatter = () => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    for (let i = 1; i <= 4; i++) {
      const a = (i - 1) * (Math.PI / 2) - Math.PI / 2 + (Math.random() - 0.5) * 0.9
      const d = 10 + Math.random() * 10
      el.style.setProperty(`--sx${i}`, `${Math.cos(a) * d}px`)
      el.style.setProperty(`--sy${i}`, `${Math.sin(a) * d}px`)
      el.style.setProperty(`--sr${i}`, `${(Math.random() - 0.5) * 70}deg`)
    }
    el.dataset.scatter = ''
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { delete el.dataset.scatter }, 170)
    setTaps((n) => n + 1)
  }

  return (
    <div className={className ? `dia-wrap ${className}` : 'dia-wrap'} style={{ display: 'grid', justifyItems: 'center' }}>
      <svg
        ref={ref}
        className="dia"
        data-mood={mood}
        viewBox="0 0 80 80"
        style={{ '--dia-size': `${size}px` }}
        aria-hidden="true"
        onPointerDown={playful ? scatter : undefined}
      >
        <g className="dia-body">
          <g transform="rotate(45 40 40)">
            {SQUARES.map(([k, x, y]) => (
              <rect key={k} className={`dia-sq dia-sq--${k}`} x={x - 8.5} y={y - 8.5} width="17" height="17" rx="3.2" />
            ))}
          </g>
          <g className="dia-eyes">
            <circle className="dia-eye" cx="36.6" cy="27.4" r="2" />
            <circle className="dia-eye" cx="43.4" cy="27.4" r="2" />
          </g>
        </g>
      </svg>
      {playful && <p className="dia-caption" aria-hidden="true">{taps >= 3 ? `Dia has been poked ${taps} times` : ''}</p>}
    </div>
  )
}
