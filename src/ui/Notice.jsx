import { Icon } from './Icon.jsx'
import { Button } from './Button.jsx'

const ICONS = { info: 'info', warn: 'warning', error: 'alert', offline: 'wifi-off' }

/**
 * Notice: at most one per screen, never above what the student came for.
 * tone: 'info' | 'warn' | 'error' | 'offline'. One sentence, an optional action under it.
 * live: 'status' or 'alert' only when the notice appears after the screen has loaded.
 */
export function Notice({ tone = 'info', children, action, live, className }) {
  return (
    <div className={`notice notice--${tone}${className ? ` ${className}` : ''}`} role={live}>
      <Icon name={ICONS[tone]} className="notice-icon" />
      <div className="notice-body">
        <p>{children}</p>
        {action && <div className="notice-action">{action}</div>}
      </div>
    </div>
  )
}

/** The offline notice: "You are offline. Showing messages saved at 10.12." onRetry adds Try again. */
export function OfflineNotice({ what, savedAt, className, onRetry, retrying = false }) {
  return (
    <Notice
      tone="offline"
      className={className}
      action={onRetry && <Button size="compact" onClick={onRetry} loading={retrying} loadingLabel="Trying again">Try again</Button>}
    >
      You are offline. Showing {what} saved at <span className="num">{savedAt}</span>.
    </Notice>
  )
}
