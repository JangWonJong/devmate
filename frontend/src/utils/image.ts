export function imageUrl(path?: string | null) {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path

  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ""
  return `${baseUrl}${path}`
}