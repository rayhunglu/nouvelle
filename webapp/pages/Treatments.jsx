import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLang } from '../i18n'
import { categories, medicalFunctions } from '../data/site'
import { ui } from '../components/ui'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import CtaBand from '../components/CtaBand'

function CategoryList({ items }) {
  const { t } = useLang()
  return (
    <div className="divide-y divide-ink/10">
      {items.map((c) => (
        <Reveal key={c.slug}>
          <Link to={`/treatments/${c.slug}`} className="group grid items-center gap-6 py-8 md:grid-cols-12">
            <div className="flex items-center gap-4 md:col-span-5">
              <Icon name={c.icon} size={22} className="text-gold" />
              <h2 className="font-display text-3xl transition group-hover:text-gold">{t(c.name)}</h2>
            </div>
            <p className="text-muted md:col-span-4">{t(c.short)}</p>
            <div className="hidden justify-end gap-2 md:col-span-3 md:flex">
              <div className="h-20 w-28 overflow-hidden rounded-2xl bg-sand">
                <img src={t(c.cover)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              </div>
              <span className="grid h-20 w-12 place-items-center rounded-2xl border border-ink/10 transition group-hover:border-gold group-hover:bg-gold group-hover:text-ivory">
                <ArrowRight size={18} />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  )
}

export default function Treatments() {
  const { t } = useLang()
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }, [hash])
  const otherGroups = ['skincare', 'lash', 'brow', 'spa']
    .map((g) => ({ id: g, label: ui.nav[g], items: categories.filter((c) => c.group === g) }))
    .filter((g) => g.items.length)

  return (
    <>
      <PageHeader
        eyebrow={t(ui.nav.services)}
        title={t({ en: 'Treatments for face, skin, body & wellbeing', zh: '面部、皮肤、身体与健康的全方位服务' })}
        introNoWrap
        intro={
          <>
            {t({ en: 'Explore our services by category. Not sure where to start? A consultation will help us build the right plan with you.', zh: '按类别浏览服务。不确定从哪里开始？预约咨询，我们与您一起制定合适方案。' })}{' '}
            <Link to="/contact" className="ml-1 inline-flex items-center rounded-full bg-gold px-4 py-1 align-middle text-sm font-medium text-ivory transition hover:bg-plum-deep">{t({ en: 'Free consultation', zh: '免费面诊' })}</Link>
          </>
        }
      />
      <section className="container-x py-12">
        <Reveal><p className="eyebrow mb-2">{t(ui.nav.medical)} · {t({ en: 'By function', zh: '按功能性分类' })}</p></Reveal>
        <div id="by-function" className="scroll-mt-28 divide-y divide-ink/10">
          {medicalFunctions.map((f, i) => (
            <Reveal key={f.id}>
              <div id={`fn-${f.id}`} className="grid scroll-mt-28 gap-6 py-8 md:grid-cols-12">
                <div className="md:col-span-4">
                  <span className="font-display text-sm text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="mt-1 font-display text-2xl sm:text-3xl">{t(f.name)}</h2>
                  <p className="mt-2 text-sm text-muted">{t(f.short)}</p>
                </div>
                <ul className="grid gap-x-6 sm:grid-cols-2 md:col-span-8">
                  {f.treatments.map((x) => (
                    <li key={x.key}>
                      <Link to={x.to} className="group flex items-center justify-between gap-3 border-b border-ink/5 py-3 transition hover:text-gold">
                        <span>{t(x.name)}</span>
                        <ArrowRight size={14} className="shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-gold" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      {otherGroups.map((g) => (
        <section key={g.id} className="container-x py-4 pb-12">
          <Reveal><p className="eyebrow mb-2">{t(g.label)}</p></Reveal>
          <CategoryList items={g.items} />
        </section>
      ))}
      <CtaBand />
    </>
  )
}
