import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

/**
 * const toast = useToast()
 * toast.show({ message: 'Message removed.', actionLabel: 'Undo', onAction: restore })
 * Use for undoable removals and failures, never for success the student expects.
 */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast needs <ToastProvider>')
  return ctx
}
