import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { categories } from '../data/site'
import Reveal from './Reveal'

const RECOMMENDED = [
  { key: 'japanese-face-correction', title: { en: 'Japanese Face Sculpting', zh: '日式小颜' }, tag: { en: 'Artisan hands, an effortless line', zh: '匠心手技，线条自然流畅' } },
  { key: 'acne-clearing', title: { en: 'Acne Clearing Facial', zh: '祛痘微针' }, tag: { en: 'Clear, calm, renewed skin', zh: '清透净澈，重塑健康肌' } },
  { key: 'classic-lashes', title: { en: 'Signature Lashes', zh: '专属美睫' }, tag: { en: 'Designed for your eyes alone', zh: '因眼而设，自然动人' } },
  { key: 'skin-1', image: '/images/treatments/shared/eye-area-injection-closeup.jpg', title: { en: 'Thermage 5th Generation', zh: '第五代热玛吉' }, tag: { en: 'Deep firming, a sculpted youthful contour', zh: '深层紧致，雕琢年轻轮廓' } },
]
// Home-page banners that differ from the poster used on the treatment's own page.
const BANNERS = {
  'japanese-face-correction': '/images/treatments/shared/japanese-face-spa-poster.jpg',
  'acne-clearing': '/images/treatments/shared/acne-microneedling-poster.jpg',
  'skin-1': '/images/treatments/shared/thermage-fx-poster.jpg',
  'classic-lashes': '/images/treatments/shared/lash-custom-poster.jpg',
}
// Card title, tagline and blurb are home-page wording; the image and link come from the treatment.
const SIGNATURE = [
  { key: 'injectables-2', image: '/images/treatments/shared/lip-filler-closeup.jpg', title: { en: 'Hyaluronic Acid Filler', zh: '玻尿酸注射填充' }, tag: { en: 'Sculpted · Natural · Harmonious', zh: '雕琢 · 自然 · 和谐' }, blurb: { en: 'Refined work built on your own proportions — soft, dimensional, unmistakably you.', zh: '以面部比例为蓝本的精细设计，立体而柔和，美得自然。' } },
  { key: 'skin-1', image: '/images/treatments/shared/eye-area-injection-closeup.jpg', title: { en: 'Wrinkle Smoothing & Skin Tightening', zh: '除皱紧致提升' }, tag: { en: 'Firm · Smooth · Youthful', zh: '紧致 · 抚纹 · 年轻态' }, blurb: { en: 'A tailored plan to smooth and firm, restoring a composed, full and youthful presence.', zh: '为肌肤状态量身定制的抚纹紧致方案，重现从容饱满的年轻神采。' } },
  { key: 'skin-3', image: '/images/treatments/shared/laser-skin-treatment.jpg', title: { en: 'Targeted Pigment Removal & Skin Renewal', zh: '精准祛斑焕肤' }, tag: { en: 'Even · Clear · Luminous', zh: '匀净 · 澄澈 · 透亮' }, blurb: { en: 'Precise light-based care fades spots and evens tone, restoring a clear, refined glow.', zh: '以精准光电淡化色斑、均匀肤色，还原澄澈细腻的光泽。' } },
]

const find = (key) => {
  for (const c of categories) {
    const item = c.treatments.find((x) => x.key === key)
    if (item) return { item, to: `/treatments/${c.slug}#${key}` }
  }
  return null
}

const pickCards = (cards) => cards.map((c) => ({ ...find(c.key), title: c.title, image: c.image, tag: c.tag, blurb: c.blurb }))

const Heading = ({ children }) => (
  <Reveal className="text-center">
    <h2 className="font-display text-4xl font-light sm:text-5xl">{children}</h2>
  </Reveal>
)

export default function Featured() {
  const { t } = useLang()
  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
      <Heading>{t({ en: 'Recommended', zh: '推荐项目' })}</Heading>
      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 sm:gap-6 2xl:max-w-none 2xl:grid-cols-4">
        {pickCards(RECOMMENDED).map(({ item, to, title, tag }, i) => (
          <Reveal key={item.key} delay={(i % 4) * 80}>
            <Link to={to} className="group block">
              <div className="overflow-hidden rounded-2xl bg-sand shadow-sm">
                <img
                  src={BANNERS[item.key] || item.poster || t(item.image)}
                  alt={t(title)}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-4 font-display text-lg sm:text-xl lg:text-2xl">{t(title)}</h3>
              {tag && <p className="mt-1 text-xs leading-snug text-muted sm:text-sm">{t(tag)}</p>}
              <span className="mt-2 inline-block text-sm font-medium">{t({ en: 'Learn more', zh: '查看更多' })} &gt;</span>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 sm:mt-28">
        <Heading>{t({ en: 'Signature Treatments', zh: '王牌项目' })}</Heading>
        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:gap-8">
          {pickCards(SIGNATURE).map(({ item, to, title, image, tag, blurb }, i) => (
            <Reveal key={item.key} delay={i * 100}>
              <Link to={to} className="group block h-full overflow-hidden rounded-2xl bg-ivory shadow-sm ring-1 ring-ink/5 transition hover:shadow-md">
                <div className="overflow-hidden">
                  <img
                    src={image || t(item.image)}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 lg:p-8">
                  {tag && <p className="eyebrow mb-2">{t(tag)}</p>}
                  <h3 className="font-display text-xl sm:text-2xl lg:text-3xl">{t(title)}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted lg:text-base">{t(blurb || item.body)}</p>
                  <span className="mt-5 inline-block text-sm font-medium">{t({ en: 'Learn more', zh: '查看更多' })} &gt;</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
