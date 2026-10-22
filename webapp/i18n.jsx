import { createContext, useContext, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// The language lives in the address: /en/... and /zh/... (the website and the member pages). The staff area (/crm, /staff-login, password pages)
// has no language in its address and stays in Chinese. Anything without a language in front is sent to the visitor's language by LegacyRedirect.
export const LANGS = ['en', 'zh']
const STAFF_PATHS = /^\/(crm|staff-login|forgot-password|reset-password)(\/|$)/

const LangContext = createContext({ lang: 'zh', setLang: () => {}, t: (v) => v, localize: (p) => p })

export const langInPath = (pathname) => {
  const first = pathname.split('/')[1]
  return LANGS.includes(first) ? first : null
}

export function storedLang() {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

// "/about" -> "/zh/about" ("/" -> "/zh"); addresses that already carry a language, the staff area, and outside links are left alone.
export const withLang = (lang, to) => {
  if (typeof to !== 'string' || !to.startsWith('/') || to.startsWith('//') || STAFF_PATHS.test(to) || langInPath(to)) return to
  return to === '/' ? `/${lang}` : to.startsWith('/#') || to.startsWith('/?') ? `/${lang}${to.slice(1)}` : `/${lang}${to}`
}

export function LangProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const fromUrl = langInPath(location.pathname)
  const lang = fromUrl || storedLang() // no language in the address (the staff area): the last one chosen

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    try { localStorage.setItem('lang', lang) } catch { /* storage unavailable */ }
  }, [lang])

  // Switching language moves to the same page under the other prefix (query and #anchor kept).
  const setLang = (next) => {
    if (next === lang) return
    if (fromUrl) navigate({ pathname: location.pathname.replace(/^\/(en|zh)(?=\/|$)/, `/${next}`), search: location.search, hash: location.hash })
    else { try { localStorage.setItem('lang', next) } catch { /* storage unavailable */ } navigate(0) }
  }

  // Content strings are either plain strings or { en, zh } pairs.
  const value = useMemo(() => ({ lang, setLang, t: (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v), localize: (to) => withLang(lang, to) }), [lang, location.pathname, location.search, location.hash]) // eslint-disable-line react-hooks/exhaustive-deps
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
