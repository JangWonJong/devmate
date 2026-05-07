import { Link } from "react-router-dom"

type AppLogoProps = {
  to?: string
  className?: string
  imageClassName?: string
  showAdminText?: boolean
}

export default function AppLogo({
  to = "/",
  className = "",
  imageClassName = "h-15 w-auto object-contain",
  showAdminText = false,
}: AppLogoProps) {
  return (
    <Link to={to} className={`flex items-center gap-3 ${className}`}>
      <img
        src="/devmine2.png"
        alt="DevMine"
        className={imageClassName}
      />
      {showAdminText && (
        <span className="text-sm font-semibold text-slate-500">Admin</span>
      )}
    </Link>
  )
}