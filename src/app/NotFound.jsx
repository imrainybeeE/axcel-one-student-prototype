import { Screen } from './Screen.jsx'
import { EmptyState } from '../ui/States.jsx'
import { Button } from '../ui/Button.jsx'

export default function NotFound() {
  return (
    <Screen title="Not found">
      <EmptyState action={<Button variant="secondary" to="/">Go to Today</Button>}>
        This page is not in Axcel One. It may have moved.
      </EmptyState>
    </Screen>
  )
}
