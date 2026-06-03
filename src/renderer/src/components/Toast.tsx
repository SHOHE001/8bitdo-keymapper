import { clsx } from 'clsx'
import { useUiStore } from '../store/useUiStore'

export function ToastStack() {
  const toasts = useUiStore((s) => s.toasts)
  const dismissToast = useUiStore((s) => s.dismissToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={clsx(
            'pointer-events-auto px-4 py-2 rounded-lg shadow-2xl text-sm font-medium',
            'border-2 min-w-[220px] text-left animate-[fadeIn_150ms_ease-out]',
            t.type === 'success' && 'bg-emerald-600 border-emerald-400 text-white',
            t.type === 'error' && 'bg-red-600 border-red-400 text-white',
            t.type === 'info' && 'bg-gray-800 border-gray-600 text-white'
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
