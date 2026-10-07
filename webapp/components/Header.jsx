import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, LayoutDashboard, LogIn, Menu, Phone, X } from 'lucide-react'
import { useLang } from '../i18n'
import { useAuth } from '../auth'
import { business, categories } from '../data/site'
import { brands } from '../data/shop'
import { ui } from './ui'

const medicalItems = categories
  .filter((c) => c.group === 'medical')
  .map((c) => ({ key: c.slug, to: `/treatments/${c.slug}`, name: c.name, short: c.short }))
const spaItems = categories
  .filter((c) => c.group === 'spa')
  .flatMap((c) => c.treatments.map((x) => ({ key: x.key, to: `/treatments/${c.slug}#${x.key}`, name: x.name, short: x.short })))
const shopItems = brands.map((b) => ({ key: b.slug, to: `/shop/${b.slug}`, name: b.name, short: b.short }))
const skincareItems = categories
  .filter((c) => c.group === 'skincare')
  .flatMap((c) => c.treatments.map((x) => ({ key: x.key, to: `/treatments/${c.slug}#${x.key}`, name: x.name, short: x.short })))

function LangToggle({ className = '' }) {
  const { lang, setLang } = useLang()
  return (
    <div className={`flex rounded-full border border-ink/15 p-0.5 text-xs font-medium ${className}`} role="group" aria-label="Language">
      {[['en', 'EN'], ['zh', '中文']].map(([code, label]) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-full px-3 py-1.5 transition ${lang === code ? 'bg-ink text-ivory' : 'text-muted hover:text-ink'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function ServiceDropdown({ label, items, linkCls }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const close = () => {
    setOpen(false)
    document.activeElement?.blur?.()
  }
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}
    >
      <button type="button" aria-expanded={open} className={`${linkCls({ isActive: false })} flex items-center gap-1`}>
        {label} <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`absolute left-1/2 top-full w-[22rem] -translate-x-1/2 pt-5 transition duration-300 ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="flex flex-col gap-1 rounded-3xl border border-ink/5 bg-ivory p-3 shadow-2xl shadow-ink/10">
          {items.map((c) => (
            <Link key={c.key} to={c.to} onClick={close} className="rounded-2xl px-4 py-3 transition hover:bg-sand">
              <span className="block text-sm font-medium">{t(c.name)}</span>
              {c.short && <span className="mt-0.5 line-clamp-1 block text-xs text-muted">{t(c.short)}</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function MobileGroup({ label, items }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-ink/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left font-display text-xl"
      >
        {label}
        <ChevronDown size={18} className={`text-muted transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="pb-3">
          {items.map((c) => (
            <li key={c.key}>
              <Link to={c.to} className="block py-2.5 pl-3 text-[0.95rem] text-muted active:text-ink">{t(c.name)}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Header() {
  const { t } = useLang()
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  const linkCls = ({ isActive }) =>
    `text-sm transition hover:text-gold ${isActive ? 'text-ink font-medium' : 'text-muted'}`

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white text-ink shadow-[0_1px_0_rgba(43,36,32,0.08)]">
      <div className="flex h-20 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-baseline gap-2" aria-label="Nouvelle Anti-Aging home">
          <span className="font-display text-2xl tracking-tight">Nouvelle</span>
          <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-gold sm:inline">Anti-Aging</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <ServiceDropdown label={t(ui.nav.medical)} items={medicalItems} linkCls={linkCls} />
          <ServiceDropdown label={t(ui.nav.skincare)} items={skincareItems} linkCls={linkCls} />
          <ServiceDropdown label={t(ui.nav.spa)} items={spaItems} linkCls={linkCls} />
          <NavLink to="/treatments/lash" className={linkCls}>{t(ui.nav.lash)}</NavLink>
          <NavLink to="/treatments/microblading" className={linkCls}>{t(ui.nav.brow)}</NavLink>
          <ServiceDropdown label={t(ui.nav.shop)} items={shopItems} linkCls={linkCls} />
          <NavLink to="/gallery" className={linkCls}>{t(ui.nav.gallery)}</NavLink>
          <NavLink to="/faq" className={linkCls}>{t(ui.nav.faq)}</NavLink>
          <NavLink to="/contact" className={linkCls}>{t(ui.nav.contact)}</NavLink>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LangToggle />
          <Link to={user ? '/crm' : '/login'} className="btn-ghost !py-2.5">
            {user ? <LayoutDashboard size={15} /> : <LogIn size={15} />} {user ? 'CRM' : t({ en: 'Login', zh: '登录' })}
          </Link>
          <a href={business.phoneHref} className="btn-primary hidden !py-2.5 xl:inline-flex">
            <Phone size={15} /> {business.phone}
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LangToggle />
          <button className="grid h-10 w-10 place-items-center rounded-full border border-ink/15" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="h-[calc(100dvh-5rem)] overflow-y-auto border-t border-ink/10 bg-white lg:hidden">
          <nav className="container-x flex flex-col pb-24 pt-2">
            <MobileGroup label={t(ui.nav.medical)} items={medicalItems} />
            <MobileGroup label={t(ui.nav.skincare)} items={skincareItems} />
            <MobileGroup label={t(ui.nav.spa)} items={spaItems} />
            <NavLink to="/treatments/lash" className="border-b border-ink/10 py-4 font-display text-xl">{t(ui.nav.lash)}</NavLink>
            <NavLink to="/treatments/microblading" className="border-b border-ink/10 py-4 font-display text-xl">{t(ui.nav.brow)}</NavLink>
            <MobileGroup label={t(ui.nav.shop)} items={shopItems} />
            {[['/gallery', ui.nav.gallery], ['/faq', ui.nav.faq], ['/contact', ui.nav.contact]].map(([to, label]) => (
              <NavLink key={to} to={to} end className="border-b border-ink/10 py-4 font-display text-xl">{t(label)}</NavLink>
            ))}
            <Link to={user ? '/crm' : '/login'} className="btn-ghost mt-8">
              {user ? <LayoutDashboard size={15} /> : <LogIn size={15} />} {user ? 'CRM' : t({ en: 'Login', zh: '登录' })}
            </Link>
            <a href={business.phoneHref} className="btn-primary mt-3"><Phone size={15} /> {business.phone}</a>
          </nav>
        </div>
      )}
    </header>
  )
}
