import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronDown, Plus, Search } from 'lucide-react'
import { useLang } from '../i18n'
import { faqCategories } from '../data/faqs'
import { business } from '../data/site'
import { ui } from '../components/ui'
import PageHeader from '../components/PageHeader'
import CtaBand from '../components/CtaBand'

function Item({ q, a, defaultOpen }) {
  return (
    <details className="group border-b border-ink/10 py-4" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-medium [&::-webkit-details-marker]:hidden">
        <span className="text-base sm:text-lg">{q}</span>
        <Plus size={20} className="mt-1 shrink-0 text-gold transition group-open:rotate-45" />
      </summary>
      <p className="mt-3 max-w-3xl leading-relaxed text-muted">{a}</p>
    </details>
  )
}

// Selection is { cat, key }: everything (both empty), one category, or one service.
const ALL = { cat: '', key: '' }

function fromHash(hash) {
  const id = decodeURIComponent(hash.slice(1))
  if (!id) return ALL
  for (const c of faqCategories) {
    if (c.slug === id) return { cat: c.slug, key: '' }
    if (c.services.some((s) => s.key === id)) return { cat: c.slug, key: id }
  }
  return ALL
}

export default function Faq() {
  const { t } = useLang()
  const { hash } = useLocation()
  const [query, setQuery] = useState('')
  const [sel, setSel] = useState(() => fromHash(hash))
  const [expanded, setExpanded] = useState(() => new Set([fromHash(hash).cat].filter(Boolean)))

  useEffect(() => {
    if (!hash) return
    const next = fromHash(hash)
    setSel(next)
    if (next.cat) setExpanded((e) => new Set(e).add(next.cat))
  }, [hash])

  // Scroll the chosen service/category into view (e.g. arriving from a service page).
  useEffect(() => {
    const id = sel.key || sel.cat
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [sel])

  const pickCategory = (slug) => {
    setSel({ cat: slug, key: '' })
    setExpanded((e) => new Set(e).add(slug))
  }
  const toggleCategory = (slug) =>
    setExpanded((e) => { const n = new Set(e); if (n.has(slug)) n.delete(slug); else n.add(slug); return n })

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return faqCategories
      .filter((c) => !sel.cat || c.slug === sel.cat)
      .map((c) => ({
        ...c,
        services: c.services
          .filter((s) => !sel.key || s.key === sel.key)
          .map((s) => ({
            ...s,
            items: s.items.filter((it) => !q || `${t(it.q)} ${t(it.a)} ${t(s.name)} ${t(c.name)}`.toLowerCase().includes(q)),
          }))
          .filter((s) => s.items.length),
      }))
      .filter((c) => c.services.length)
  }, [sel, query, t])

  const singleService = !!sel.key
  const activeCat = faqCategories.find((c) => c.slug === sel.cat)
  const link = (active) =>
    `w-full rounded-xl px-3 py-2 text-left text-sm transition ${active ? 'bg-gold text-ivory' : 'text-muted hover:bg-sand hover:text-ink'}`

  return (
    <>
      <PageHeader
        eyebrow={t(ui.nav.faq)}
        title={t({ en: 'Questions, answered.', zh: '您的疑问，我们解答。' })}
        intro={t({
          en: 'Common questions for every service, organised by category. Can’t find what you’re looking for? Call us — we’re happy to help.',
          zh: '按类别整理，涵盖所有服务的常见问题。如未找到答案，欢迎致电咨询。',
        })}
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
        <aside className="lg:col-span-4 xl:col-span-3">
          {/* Phones: two dropdowns — big title, then small title */}
          <div className="grid gap-3 lg:hidden">
            <select
              value={sel.cat}
              onChange={(e) => setSel({ cat: e.target.value, key: '' })}
              aria-label={t({ en: 'Category', zh: '类别' })}
              className="w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3 outline-none focus:border-gold"
            >
              <option value="">{t({ en: 'All categories', zh: '全部类别' })}</option>
              {faqCategories.map((c) => <option key={c.slug} value={c.slug}>{t(c.name)}</option>)}
            </select>
            <select
              value={sel.key}
              onChange={(e) => setSel({ cat: sel.cat, key: e.target.value })}
              disabled={!activeCat}
              aria-label={t({ en: 'Service', zh: '服务项目' })}
              className="w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3 outline-none focus:border-gold disabled:opacity-50"
            >
              <option value="">{activeCat ? t({ en: 'All services', zh: '该类别全部项目' }) : t({ en: 'Pick a category first', zh: '请先选择类别' })}</option>
              {activeCat?.services.map((s) => <option key={s.key} value={s.key}>{t(s.name)}</option>)}
            </select>
          </div>

          {/* Desktop: big titles that expand to their small titles */}
          <nav className="hidden max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 lg:sticky lg:top-28 lg:block" aria-label={t({ en: 'FAQ topics', zh: '常见问题分类' })}>
            <button onClick={() => setSel(ALL)} className={link(!sel.cat)}>{t({ en: 'All services', zh: '全部服务' })}</button>
            <ul className="mt-2 space-y-1">
              {faqCategories.map((c) => {
                const open = expanded.has(c.slug)
                const catActive = sel.cat === c.slug && !sel.key
                return (
                  <li key={c.slug}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => pickCategory(c.slug)} className={`${link(catActive)} font-medium`}>{t(c.name)}</button>
                      <button onClick={() => toggleCategory(c.slug)} aria-expanded={open} aria-label={t({ en: 'Show services', zh: '展开项目' })} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-sand">
                        <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {open && (
                      <ul className="mb-2 ml-3 border-l border-ink/10 pl-2">
                        {c.services.map((s) => (
                          <li key={s.key}>
                            <button onClick={() => setSel({ cat: c.slug, key: s.key })} className={`${link(sel.key === s.key)} !py-1.5`}>{t(s.name)}</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        <div className="lg:col-span-8 xl:col-span-9">
          {groups.length === 0 && (
            <p className="text-muted">
              {t({ en: 'No matching questions. Give us a call at ', zh: '没有找到相关问题，请致电 ' })}
              <a href={business.phoneHref} className="text-ink underline">{business.phone}</a>.
            </p>
          )}
          {groups.map((c) => (
            <section key={c.slug} id={c.slug} className="mb-14 scroll-mt-28">
              <h2 className="mb-6 border-b border-ink/10 pb-3 font-display text-3xl sm:text-4xl">{t(c.name)}</h2>
              {c.services.map((s) => (
                <div key={s.key} id={s.key} className="mb-10 scroll-mt-28">
                  <h3 className="mb-1 font-display text-xl text-gold sm:text-2xl">{t(s.name)}</h3>
                  {s.items.map((it, i) => (
                    <Item key={i} q={t(it.q)} a={t(it.a)} defaultOpen={singleService && i === 0} />
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-5 py-12 md:grid-cols-2">
        <Link to="/shop" className="group flex items-center justify-start gap-5 rounded-[2rem] border border-ink/10 p-8 transition hover:border-ink">
          <ArrowLeft className="shrink-0 transition group-hover:-translate-x-2" />
          <div className="text-left">
            <p className="text-sm text-muted">{t({ en: 'Previous', zh: '上一项' })}</p>
            <p className="font-display text-2xl sm:text-3xl">{t(ui.nav.shop)}</p>
          </div>
        </Link>
        <Link to="/contact" className="group flex items-center justify-end gap-5 rounded-[2rem] border border-ink/10 p-8 transition hover:border-ink">
          <div className="text-right">
            <p className="text-sm text-muted">{t({ en: 'Next', zh: '下一项' })}</p>
            <p className="font-display text-2xl sm:text-3xl">{t(ui.nav.contact)}</p>
          </div>
          <ArrowRight className="shrink-0 transition group-hover:translate-x-2" />
        </Link>
      </section>

      <CtaBand />
    </>
  )
}
