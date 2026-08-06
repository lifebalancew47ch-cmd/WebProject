import { AlertCircle, CheckCircle2 } from "lucide-react"

type AlertMessageProps = {
  type?: "error" | "success"
  children: React.ReactNode
}

export function AlertMessage({ type = "error", children }: AlertMessageProps) {
  const isError = type === "error"

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {isError ? (
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
      )}
      <span>{children}</span>
    </div>
  )
}
