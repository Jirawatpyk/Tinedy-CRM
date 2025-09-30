// Toast Hook
// Simplified toast notifications for client components

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

// Simple in-memory toast store
let toasts: Toast[] = []
let listeners: Array<(toasts: Toast[]) => void> = []

function emitChange() {
  listeners.forEach((listener) => listener(toasts))
}

export function useToast() {
  // Simple hook that returns toast function
  const toast = (props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { ...props, id }

    toasts = [...toasts, newToast]
    emitChange()

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      emitChange()
    }, 5000)
  }

  const dismiss = (toastId: string) => {
    toasts = toasts.filter((t) => t.id !== toastId)
    emitChange()
  }

  return {
    toast,
    dismiss,
    toasts,
  }
}
