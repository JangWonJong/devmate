type CodeBlockButtonsProps = {
  onSelect: (language: string) => void;
};

const LANGUAGES = ["java", "typescript", "javascript", "tsx", "sql", "bash"];

export function CodeBlockButtons({ onSelect }: CodeBlockButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          onClick={() => onSelect(language)}
          className="ro/*  */unded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          {language}
        </button>
      ))}
    </div>
  );
}
