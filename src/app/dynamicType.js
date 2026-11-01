// Dynamic Type probe (enhancement, needs a real iPhone to confirm): measure Apple's body text style
// and scale the root font size with it, clamped 1 to 2.35. Elsewhere the font is not supported and nothing changes.
export function startDynamicTypeProbe() {
  const probe = document.createElement('span')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;font:-apple-system-body'
  probe.textContent = 'A'
  document.body.appendChild(probe)
  const measure = () => {
    if (!probe.style.font) return // not supported: leave --dt-scale at 1
    const px = parseFloat(getComputedStyle(probe).fontSize)
    if (!px) return
    const scale = Math.min(2.35, Math.max(1, px / 17))
    document.documentElement.style.setProperty('--dt-scale', String(scale))
  }
  measure()
  document.addEventListener('visibilitychange', () => { if (!document.hidden) measure() })
}
