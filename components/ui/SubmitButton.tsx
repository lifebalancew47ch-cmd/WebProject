import type { ButtonHTMLAttributes } from "react"
import { Loader2 } from "lucide-react"

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  children: React.ReactNode
}

export function SubmitButton({ loading, children, disabled, className = "", ...props }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center gap-2 bg-[#416B51] hover:bg-[#345641] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-900/10 transition-all ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  )
}
