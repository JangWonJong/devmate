export function actionButtonClass(
  variant: "default" | "success" | "danger" | "subtle" | "primary",
  disabled?: boolean
) {
  const base =
    "inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition"

  const tone =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      : variant === "danger"
      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
      : variant === "subtle"
      ? "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
      : variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"

  const state = disabled ? "cursor-not-allowed opacity-50 hover:bg-inherit" : ""

  return `${base} ${tone} ${state}`
}