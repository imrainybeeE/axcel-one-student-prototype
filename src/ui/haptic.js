// A taptic tick on iOS 18+ (a switch-style checkbox toggled from its label) and a short vibrate on Android.
// Haptics are a bonus: they never block or break the action that asked for one.

let bridge = null
export function haptic() {
  try {
    if (navigator.vibrate && !/iPhone|iPad/.test(navigator.userAgent)) { navigator.vibrate(8); return }
    if (!bridge) {
      bridge = document.createElement('label')
      bridge.className = 'haptic'
      bridge.setAttribute('aria-hidden', 'true')
      const input = document.createElement('input')
      input.type = 'checkbox'
      input.setAttribute('switch', '')
      input.tabIndex = -1
      bridge.append(input)
      document.body.append(bridge)
    }
    bridge.click()
  } catch {
    // Haptics are a bonus; never let them break an action
  }
}
