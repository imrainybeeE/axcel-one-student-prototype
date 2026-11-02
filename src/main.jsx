import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './ui/ui.css'
import './app/shell.css'
import './styles/spice.css'
import './app/theme.js'
import { startDynamicTypeProbe } from './app/dynamicType.js'
import App from './app/App.jsx'
import { startLiquidGlass } from './ui/liquidGlass.js'
import { preloadRoutes } from './app/lazyRoute.js'

startDynamicTypeProbe()
// iOS Safari only applies :active (the press states) when a touch listener exists on the page
document.addEventListener('touchstart', () => {}, { passive: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Real refraction on the floating layer where the browser can draw it (Chromium); frosted glass elsewhere
startLiquidGlass()
// Every other screen's code, fetched while the student reads the first one
preloadRoutes()
