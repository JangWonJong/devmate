export function CodeBlockButtons({
  onSelect,
}: {
  onSelect: (language: string) => void
}) {
  const languages = ["text","tsx", "java", "python", "javascript", "sql"]

  return (
    <div className="flex flex-wrap gap-1">
      {languages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onSelect(lang)}
          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {lang}
        </button>
      ))}
    </div>
  )
}


export function makeFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}