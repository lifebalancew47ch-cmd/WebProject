import type { InputHTMLAttributes } from "react"

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function FormField({ label, error, id, className = "", ...inputProps }: FormFieldProps) {
  const inputId = id ?? inputProps.name

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-semibold text-emerald-950 mb-1.5">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-emerald-200 focus:border-emerald-400 focus:ring-emerald-100"
        } ${className}`}
        {...inputProps}
      />
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  )
}
