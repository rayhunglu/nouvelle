import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useLang } from '../i18n'
import { faqTopics } from '../data/faqs'
import { business } from '../data/site'
import { ui } from '../components/ui'
import PageHeader from '../components/PageHeader'
import CtaBand from '../components/CtaBand'

function Item({ q, a, defaultOpen }) {
  return (
    <details className="group border-b border-ink/10 py-5" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-medium [&::-webkit-details-marker]:hidden">
        <span className="text-lg">{q}</span>
        <Plus size={20} className="mt-1 shrink-0 text-gold transition group-open:rotate-45" />
      </summary>
      <p className="mt-3 max-w-3xl leading-relaxed text-muted">{a}</p>
    </details>
  )
}

export default function Faq() {
  const { t } = useLang()
  const { hash } = useLocation()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(() => hash.slice(1) || 'all')

  useEffect(() => {
    if (hash) setActive(hash.slice(1))
  }, [hash])

  const topics = useMemo(() => {
    const q = query.trim().toLowerCase()
    return faqTopics
      .filter((tp) => active === 'all' || tp.id === active)
      .map((tp) => ({
        ...tp,
        items: tp.items.filter((it) => !q || `${t(it.q)} ${t(it.a)} ${t(tp.name)}`.toLowerCase().includes(q)),
      }))
      .filter((tp) => tp.items.length)
  }, [active, query, t])

  return (
    <>
      <PageHeader
        eyebrow={t(ui.nav.faq)}
        title={t({ en: 'Questions, answered.', zh: '您的疑问，我们解答。' })}
        intro={t({ en: 'Common questions about our treatments. Can’t find what you’re looking for? Call us — we’re happy to help.', zh: '关于各项疗程的常见问题。如未找到答案，欢迎致电咨询。' })}
      >
        <label className="relative mt-8 flex max-w-xl items-center">
          <Search size={18} className="absolute left-5 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t({ en: 'Search questions…', zh: '搜索问题…' })}
            className="w-full rounded-full border border-ink/10 bg-ivory py-4 pl-12 pr-5 outline-none transition focus:border-gold"
          />
        </label>
      </PageHeader>

      <section className="container-x grid gap-10 py-14 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:sticky lg:top-28 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {[{ id: 'all', name: { en: 'All topics', zh: '全部' } }, ...faqTopics].map((tp) => (
              <button
                key={tp.id}
                onClick={() => setActive(tp.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-left text-sm transition lg:rounded-xl ${
                  active === tp.id ? 'bg-ink text-ivory' : 'bg-sand text-muted hover:text-ink lg:bg-transparent'
                }`}
              >
                {t(tp.name)}
              </button>
            ))}
          </div>
        </aside>

        <div className="lg:col-span-9">
          {topics.length === 0 && (
            <p className="text-muted">
              {t({ en: 'No matching questions. Give us a call at ', zh: '没有找到相关问题，请致电 ' })}
              <a href={business.phoneHref} className="text-ink underline">{business.phone}</a>.
            </p>
          )}
          {topics.map((tp) => (
            <div key={tp.id} id={tp.id} className="mb-12 scroll-mt-28">
              <h2 className="mb-2 font-display text-3xl">{t(tp.name)}</h2>
              {tp.items.map((it, i) => (
                <Item key={i} q={t(it.q)} a={t(it.a)} defaultOpen={active !== 'all' && i === 0} />
              ))}
            </div>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
