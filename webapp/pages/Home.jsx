import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, MapPin, Phone, ShieldCheck, Stethoscope, UserRound } from 'lucide-react'
import { useLang } from '../i18n'
import { business, categories, heroImage, getCategory } from '../data/site'
import { ui } from '../components/ui'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import CtaBand from '../components/CtaBand'

const pillars = [
  {
    icon: Stethoscope,
    title: { en: 'Physician-led care', zh: '医师主导' },
    body: { en: 'Treatments are planned and overseen by licensed medical professionals.', zh: '所有疗程由持牌医疗专业人员规划与监督。' },
  },
  {
    icon: UserRound,
    title: { en: 'Plans built for you', zh: '个性化方案' },
    body: { en: 'Every visit begins with a consultation — no one-size-fits-all packages.', zh: '每次都从咨询开始，绝不千篇一律。' },
  },
  {
    icon: ShieldCheck,
    title: { en: 'Proven technology', zh: '成熟技术' },
    body: { en: 'FDA-cleared devices and trusted brands like Thermage, Stellar M22 and EMSculpt.', zh: '采用 FDA 认证设备与热玛吉、M22、EMSculpt 等知名品牌。' },
  },
]

export default function Home() {
  const { t } = useLang()
  const featured = getCategory('hormone-stem-cell')

  return (
    <>
      {/* Hero */}
      <section className="relative isolate mt-20 flex min-h-[calc(100svh-5rem)] items-end overflow-hidden lg:items-center">
        <img src={heroImage} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-[30%_center]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ivory/90 via-ivory/30 to-transparent lg:bg-gradient-to-l lg:from-ivory/55 lg:via-transparent lg:to-transparent" />
        <div className="container-x pb-14 pt-24 lg:pb-0 lg:pt-0">
          <Reveal className="lg:ml-auto lg:max-w-xl lg:translate-x-16 xl:translate-x-32 2xl:translate-x-44">
            <p className="eyebrow mb-6">{t({ en: 'Nouvelle Anti-Aging Center', zh: 'Nouvelle 抗衰老中心' })}</p>
            <h1 className="font-display text-5xl font-light leading-[1.02] tracking-tight sm:text-7xl">
              {t({ en: 'Prettier,', zh: '塑造' })}
              <br />
              <em className="text-gold">{t({ en: 'younger', zh: '更美丽年轻' })}</em>
              <br />
              {t({ en: 'you.', zh: '的你。' })}
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/75">
              {t({
                en: 'Injectables, advanced laser skin care, body sculpting and whole-body anti-aging — thoughtfully tailored, beautifully natural.',
                zh: '注射微整、先进激光护肤、身体塑形与全身抗衰老——用心定制，自然美丽。',
              })}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="btn-primary">{t(ui.book)} <ArrowRight size={16} /></Link>
              <Link to="/treatments" className="btn-ghost">{t({ en: 'View treatments', zh: '浏览服务' })}</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services grid */}
      <section className="container-x py-20 sm:py-28">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-4">{t(ui.nav.services)}</p>
            <h2 className="max-w-xl font-display text-4xl font-light leading-tight sm:text-5xl">
              {t({ en: 'Everything you need to look and feel your best.', zh: '由内而外，焕发最佳状态。' })}
            </h2>
          </div>
          <Link to="/treatments" className="group inline-flex items-center gap-2 text-sm font-medium">
            {t({ en: 'All treatments', zh: '全部服务' })} <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 3) * 100}>
              <Link
                to={`/treatments/${c.slug}`}
                className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-[2rem] bg-sand p-7"
              >
                <img src={c.cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-ink/0" />
                <span className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full bg-ivory/90 text-ink transition group-hover:bg-gold group-hover:text-ivory">
                  <ArrowUpRight size={18} />
                </span>
                <div className="relative text-ivory">
                  <Icon name={c.icon} size={22} className="mb-3 text-gold-light" />
                  <h3 className="font-display text-2xl">{t(c.name)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/80">{t(c.short)}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-sand py-20 sm:py-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mb-4">{t({ en: 'Why Nouvelle', zh: '为什么选择我们' })}</p>
            <h2 className="font-display text-4xl font-light leading-tight sm:text-5xl">
              {t({ en: 'Natural results, guided by medicine.', zh: '以医学为本，追求自然效果。' })}
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={i} delay={i * 100} className="rounded-[2rem] bg-ivory p-8">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold"><p.icon size={22} /></span>
                <h3 className="mt-6 font-display text-2xl">{t(p.title)}</h3>
                <p className="mt-3 leading-relaxed text-muted">{t(p.body)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container-x grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2">
        <Reveal className="overflow-hidden rounded-[2.5rem] bg-sand">
          <img src={featured.treatments[1].image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </Reveal>
        <Reveal delay={100}>
          <p className="eyebrow mb-4">{t({ en: 'Whole-body anti-aging', zh: '全身抗衰老' })}</p>
          <h2 className="font-display text-4xl font-light leading-tight sm:text-5xl">{t(featured.name)}</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">{t(featured.intro)}</p>
          <ul className="mt-8 grid grid-cols-2 gap-3">
            {t(featured.treatments[0].bullets).slice(0, 4).map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-gold" />{b}</li>
            ))}
          </ul>
          <Link to={`/treatments/${featured.slug}`} className="btn-primary mt-10">{t(ui.learnMore)} <ArrowRight size={16} /></Link>
        </Reveal>
      </section>

      {/* Locations */}
      <section className="container-x pb-4">
        <Reveal>
          {business.locations.map((l) => (
            <div key={l.id} className="flex flex-col justify-between gap-8 rounded-[2rem] border border-ink/10 p-8 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow mb-3">{t(l.label)}</p>
                <p className="font-display text-2xl">{l.line1}</p>
                <p className="text-muted">{l.line2}</p>
              </div>
              <div className="flex gap-2">
                <a href={l.maps} target="_blank" rel="noreferrer" className="btn-ghost !px-4" aria-label={t(ui.directions)}><MapPin size={16} /></a>
                <a href={business.phoneHref} className="btn-primary !px-4" aria-label={t(ui.call)}><Phone size={16} /></a>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      <CtaBand />
    </>
  )
}
