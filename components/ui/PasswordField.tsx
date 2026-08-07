"use client"

import { useState, type InputHTMLAttributes } from "react"
import { Eye, EyeOff } from "lucide-react"

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function PasswordField({ label, error, id, className = "", ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? inputProps.name

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-semibold text-emerald-950 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-emerald-200 focus:border-emerald-400 focus:ring-emerald-100"
          } ${className}`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-700 transition-colors"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  )
}
