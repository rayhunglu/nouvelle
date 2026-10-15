import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, MessageCircle, Phone, ShieldCheck, Stethoscope, UserRound } from 'lucide-react'
import { useLang } from '../i18n'
import { business, heroImage } from '../data/site'
import { ui } from '../components/ui'
import Reveal from '../components/Reveal'
import CtaBand from '../components/CtaBand'
import ConcernSearch from '../components/ConcernSearch'
import Featured from '../components/Featured'
import WeChatModal from '../components/WeChatModal'

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
  const { t, lang } = useLang()
  const [wechatOpen, setWechatOpen] = useState(false)
  // Chinese hero on phones: the small caption and the headline are right-aligned.
  const zhRight = lang === 'zh' ? 'text-right lg:text-left' : ''

  return (
    <>
      {/* Hero */}
      <section className={`relative isolate mt-20 flex min-h-[calc(100svh-5rem)] overflow-hidden lg:items-center ${lang === 'zh' ? 'items-end' : 'items-start'}`}>
        <img
          src={t(heroImage)}
          alt=""
          className={`absolute -z-20 object-cover ${
            lang === 'zh'
              ? // Phones: a smaller photo across the top, fading into the text below; desktop: full-bleed.
                'left-0 top-0 h-[48%] w-full object-[42%_20%] [mask-image:linear-gradient(to_bottom,black_70%,transparent)] lg:inset-y-0 lg:h-full lg:object-[30%_center] lg:[mask-image:none]'
              : // Portrait photo: smaller on phones, on the left (fading right) on desktop.
                'top-0 left-[24%] h-[calc(0.37*(100svh-5rem))] w-[74%] object-[50%_18%] [mask-image:linear-gradient(to_bottom,black_72%,transparent),linear-gradient(to_right,transparent,black_14%,black_86%,transparent)] [mask-composite:intersect] [-webkit-mask-composite:source-in] lg:inset-y-0 lg:left-0 lg:h-full lg:w-[62%] lg:[mask-image:linear-gradient(to_right,black_72%,transparent)]'
          }`}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ivory/90 via-ivory/30 to-transparent lg:bg-gradient-to-l lg:from-ivory/55 lg:via-transparent lg:to-transparent" />
        {/* English on phones: the text starts below the photo so it never covers the model's face. */}
        <div className={`container-x lg:pb-0 lg:pt-0 ${lang === 'zh' ? 'pb-6 pt-24' : 'pb-6 pt-[calc(0.105*(100svh-5rem))]'}`}>
          <Reveal
            className={`lg:ml-auto lg:max-w-xl ${
              lang === 'zh'
                ? 'lg:translate-x-20 xl:translate-x-40 2xl:translate-x-56'
                : 'lg:translate-x-16 xl:translate-x-32 2xl:translate-x-44'
            }`}
          >
            <p className={`eyebrow mb-4 max-lg:text-[0.62rem] max-lg:tracking-[0.2em] lg:mb-6 ${zhRight}`}>{lang === 'en' ? (
                <>
                  Nouvelle Anti-Aging<span className="max-lg:hidden"> Center</span>
                </>
              ) : (
                'Nouvelle 抗衰老中心'
              )}
            </p>
            <h1 className={`font-display font-light leading-[1.02] tracking-tight sm:text-7xl ${lang === 'zh' ? 'text-4xl' : 'text-[2.6rem]'} ${zhRight}`}>
              {t({ en: 'Prettier,', zh: '塑造' })}
              <br />
              <em className="text-gold">{t({ en: 'younger', zh: '更美丽年轻' })}</em>
              <br />
              {t({ en: 'you.', zh: '的你' })}
            </h1>
            <p className={`mt-12 max-w-md leading-relaxed text-ink/75 lg:mt-8 ${lang === 'zh' ? 'text-base' : 'text-lg'}`}>
              {lang === 'zh' ? (
                // Each service name is kept whole: lines only break between items.
                <>
                  {['注射微整', '先进光电', '日式护肤', '美睫', '纹绣', '身体塑形', '按摩头疗Spa', '全身抗衰老一站式服务'].map((x, i) => (
                    <span key={x}>
                      {i > 0 && '、'}
                      <span className="whitespace-nowrap">{x}</span>
                    </span>
                  ))}
                  ——<span className="whitespace-nowrap">用心定制，</span>
                  <span className="whitespace-nowrap">自然美丽</span>
                </>
              ) : (
                <>
                  Aesthetic Injectables · Advanced Skin Treatments · Japanese Skincare · Lashes &amp; Brows · Body Contouring · Spa &amp; Wellness · Anti-Aging
                  <span className="mt-4 block text-ink">Personalized Care. Natural Beauty.</span>
                </>
              )}
            </p>
            <div className={`flex flex-col gap-3 sm:flex-row lg:mt-10 ${lang === 'en' ? 'mt-16' : 'mt-9'}`}>
              <Link to="/treatments" className="btn-ghost">{t({ en: 'All treatments', zh: '全部服务' })}</Link>
              <Link to="/contact" className="btn-primary">{t(ui.book)} <ArrowRight size={16} /></Link>
              {lang === 'zh' && <button type="button" onClick={() => setWechatOpen(true)} className="btn-ghost"><MessageCircle size={16} /> 微信联系</button>}
            </div>
          </Reveal>
        </div>
      </section>

      <Featured />

      <ConcernSearch />

      {/* Pillars */}
      <section className="bg-sand py-20 sm:py-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mb-4">{t({ en: 'Why Nouvelle', zh: '为什么选择我们' })}</p>
            <h2 className="font-display text-4xl font-light leading-tight sm:text-5xl">
              {t({ en: 'Natural results, guided by medicine.', zh: '以医学为本　追求自然效果' })}
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

      {wechatOpen && <WeChatModal onClose={() => setWechatOpen(false)} />}
      <CtaBand />
    </>
  )
}
