// One polite live region, mounted empty at app start (see App.jsx). Used for route titles
// and quiet status lines. Toasts have their own role="status" region.
let timer
export function announce(text) {
  const el = document.getElementById('announcer')
  if (!el) return
  clearTimeout(timer)
  el.textContent = ''
  timer = setTimeout(() => { el.textContent = text }, 60)
}
