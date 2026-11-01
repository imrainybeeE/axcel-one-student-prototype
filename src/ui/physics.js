// Drag physics shared by sheets and toasts, after UIKit's scroll view.

/** iOS rubber band: past an edge the offset grows ever more slowly and never passes d (the panel's size). */
export function rubber(x, d) {
  if (x <= 0 || d <= 0) return 0
  return (1 - 1 / ((x * 0.55) / d + 1)) * d
}

/** Where a flick would come to rest: UIKit's normal deceleration rate (0.998 per ms), v in px per ms. */
export function project(v) {
  return (v * 0.998) / (1 - 0.998)
}

/**
 * Apple's spring (perceptual duration d in s, bounce b, as tools/springs.mjs) that starts moving at v0, the finger's
 * speed as a share of the distance left per second, so a release carries the flick on instead of starting from rest.
 * Returns a CSS linear() easing and its settle time in ms. v0 is capped at the spring's own rate, so a fast flick over
 * a short distance never overshoots more than the spring's bounce.
 */
export function springFrom(d, b, v0 = 0, samples = 40) {
  const w = (2 * Math.PI) / d
  const z = 1 - b
  const v = Math.min(Math.max(v0, 0), w)
  const wd = w * Math.sqrt(Math.max(1 - z * z, 1e-9))
  const f = (t) => (z >= 1
    ? 1 - Math.exp(-w * t) * (1 + (w - v) * t)
    : 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w - v) / wd) * Math.sin(wd * t)))
  let settle = 0.05
  for (let t = 0; t < 3; t += 0.002) if (Math.abs(f(t) - 1) > 0.004) settle = t
  const points = Array.from({ length: samples + 1 }, (_, i) => (i === samples ? 1 : +f((settle * i) / samples).toFixed(4)))
  return { easing: `linear(${points.join(', ')})`, duration: Math.round(settle * 1000) }
}
