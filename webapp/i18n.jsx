import { createContext, useContext, useEffect, useState } from 'react'

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (v) => v })

function readStored() {
  try {
    return localStorage.getItem('lang') === 'zh' ? 'zh' : 'en'
  } catch {
    return 'en'
  }
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(readStored)

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    try { localStorage.setItem('lang', lang) } catch { /* storage unavailable */ }
  }, [lang])

  // Content strings are either plain strings or { en, zh } pairs.
  const t = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v)

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
