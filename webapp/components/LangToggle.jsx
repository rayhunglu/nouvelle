import { Globe } from 'lucide-react'
import { useLang } from '../i18n'

// Globe button: switches to the other language and moves to the same page under /en or /zh.
export default function LangToggle({ className = '' }) {
  const { lang, setLang } = useLang()
  const next = lang === 'en' ? 'zh' : 'en'
  const label = next === 'zh' ? '切换到中文' : 'Switch to English'
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={label}
      title={label}
      className={`grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink transition hover:border-gold hover:text-gold ${className}`}
    >
      <Globe size={20} strokeWidth={1.75} />
    </button>
  )
}
