import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLang } from '../i18n'
import { categories } from '../data/site'
import { ui } from '../components/ui'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import CtaBand from '../components/CtaBand'

function CategoryList({ items }) {
  const { t } = useLang()
  return (
    <div className="divide-y divide-ink/10">
      {items.map((c, i) => (
        <Reveal key={c.slug}>
          <Link to={`/treatments/${c.slug}`} className="group grid items-center gap-6 py-8 md:grid-cols-12">
            <span className="font-display text-sm text-muted md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex items-center gap-4 md:col-span-4">
              <Icon name={c.icon} size={22} className="text-gold" />
              <h2 className="font-display text-3xl transition group-hover:text-gold">{t(c.name)}</h2>
            </div>
            <p className="text-muted md:col-span-4">{t(c.short)}</p>
            <div className="hidden justify-end gap-2 md:col-span-3 md:flex">
              <div className="h-20 w-28 overflow-hidden rounded-2xl bg-sand">
                <img src={t(c.cover)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              </div>
              <span className="grid h-20 w-12 place-items-center rounded-2xl border border-ink/10 transition group-hover:border-ink group-hover:bg-ink group-hover:text-ivory">
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
  const medical = categories.filter((c) => c.group === 'medical')
  const skincare = categories.filter((c) => c.group !== 'medical')

  return (
    <>
      <PageHeader
        eyebrow={t(ui.nav.services)}
        title={t({ en: 'Treatments for face, skin, body & wellbeing.', zh: '面部、皮肤、身体与健康的全方位服务。' })}
        intro={t({ en: 'Explore our services by category. Not sure where to start? A consultation will help us build the right plan with you.', zh: '按类别浏览服务。不确定从哪里开始？预约咨询，我们与您一起制定合适方案。' })}
      />
      <section className="container-x py-12">
        <Reveal><p className="eyebrow mb-2">{t(ui.nav.medical)}</p></Reveal>
        <CategoryList items={medical} />
      </section>
      <section className="container-x py-4 pb-12">
        <Reveal><p className="eyebrow mb-2">{t(ui.nav.skincare)}</p></Reveal>
        <CategoryList items={skincare} />
      </section>
      <CtaBand />
    </>
  )
}
