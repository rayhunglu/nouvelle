import { useLang } from '../i18n'

// EN / 中文: moves to the same page under /en or /zh.
export default function LangToggle({ className = '' }) {
  const { lang, setLang } = useLang()
  return (
    <div className={`flex rounded-full border border-ink/15 p-0.5 text-xs font-medium ${className}`} role="group" aria-label="Language">
      {[['en', 'EN'], ['zh', '中文']].map(([code, label]) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-full px-3.5 py-2 transition ${lang === code ? 'bg-gold text-ivory' : 'text-muted hover:text-ink'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
