"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { CheckCircle2, AlertCircle, X } from "lucide-react"

type ToastType = "success" | "error"

type Toast = {
  id: number
  type: ToastType
  message: string
}

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const AUTO_DISMISS_MS = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-lg transition-all ${
              toast.type === "error" ? "border-red-200" : "border-emerald-200"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#2D5A43" }} />
            )}
            <p className="flex-1 text-sm font-medium text-slate-700">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Cerrar notificación"
              className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>")
  return ctx
}
