// A burst of the logo's squares from an element, for the moments worth a cheer (an award, the end of the school day).
// Load it on demand: import('./burst.js').then((m) => m.burst(el)). Decorative; nothing under reduced motion.
import './burst.css'

const COLOURS = ['var(--logo-blue)', 'var(--logo-orange)', 'var(--logo-green)']

export function burst(from, { count = 32 } = {}) {
  if (!from?.isConnected || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = from.getBoundingClientRect()
  // The source gives a little pop as the squares leave it
  from.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.16)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 480, easing: 'cubic-bezier(.3, 1.4, .5, 1)' })
  const layer = document.createElement('div')
  layer.className = 'burst'
  layer.setAttribute('aria-hidden', 'true')
  layer.style.left = `${r.left + r.width / 2}px`
  layer.style.top = `${r.top + r.height / 2}px`
  document.body.append(layer)
  const runs = []
  for (let i = 0; i < count; i++) {
    const sq = document.createElement('i')
    sq.style.background = COLOURS[i % COLOURS.length]
    const size = 6 + Math.random() * 5
    sq.style.width = sq.style.height = `${size}px`
    sq.style.margin = `${-size / 2}px`
    layer.append(sq)
    // Mostly upwards, fanned out; then they fall and turn, fading only at the end
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3
    const v = 90 + Math.random() * 130
    const x = Math.cos(a) * v
    const y = Math.sin(a) * v
    const spin = (Math.random() - 0.5) * 720
    runs.push(sq.animate([
      { transform: 'translate(0, 0) rotate(45deg) scale(0.2)' },
      { transform: `translate(${x}px, ${y}px) rotate(${45 + spin / 3}deg) scale(1)`, offset: 0.3, easing: 'cubic-bezier(.4, 0, .9, .6)' },
      { transform: `translate(${x * 1.25}px, ${y * 1.25 + 90}px) rotate(${45 + spin * 0.7}deg) scale(1)`, opacity: 1, offset: 0.75 },
      { transform: `translate(${x * 1.35}px, ${y * 1.35 + 150}px) rotate(${45 + spin}deg) scale(0.8)`, opacity: 0 },
    ], { duration: 1400 + Math.random() * 600, easing: 'cubic-bezier(.12, .8, .3, 1)', fill: 'forwards' }).finished)
  }
  Promise.allSettled(runs).then(() => layer.remove())
}
