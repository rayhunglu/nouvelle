import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { categories } from '../data/site'
import Reveal from './Reveal'

const RECOMMENDED = [
  { key: 'japanese-face-correction', title: { en: 'Japanese Face Sculpting', zh: '日式小颜' } },
  { key: 'acne-clearing', title: { en: 'Acne Clearing Facial', zh: '祛痘微针' } },
  { key: 'classic-lashes', title: { en: 'Signature Lashes', zh: '专属美睫' } },
  { key: 'skin-1', image: '/images/treatments/shared/eye-area-injection-closeup.jpg', title: { en: 'Thermage 5th Generation', zh: '第五代热玛吉' } },
]
// Home-page banners that differ from the poster used on the treatment's own page.
const BANNERS = {
  'japanese-face-correction': '/images/treatments/shared/japanese-face-spa-poster.jpg',
  'acne-clearing': '/images/treatments/shared/acne-microneedling-poster.jpg',
  'skin-1': '/images/treatments/shared/thermage-fx-poster.jpg',
  'classic-lashes': '/images/treatments/shared/lash-custom-poster.jpg',
}
// Card title is its own wording; image and blurb come from the linked treatment.
const SIGNATURE = [
  { key: 'injectables-2', image: '/images/treatments/shared/lip-filler-closeup.jpg', title: { en: 'Hyaluronic Acid Filler', zh: '玻尿酸注射填充' } },
  { key: 'skin-1', image: '/images/treatments/shared/eye-area-injection-closeup.jpg', title: { en: 'Wrinkle Smoothing & Skin Tightening', zh: '除皱紧致提升' } },
  { key: 'skin-3', image: '/images/treatments/shared/laser-skin-treatment.jpg', title: { en: 'Targeted Pigment Removal & Skin Renewal', zh: '精准祛斑焕肤' } },
]

const find = (key) => {
  for (const c of categories) {
    const item = c.treatments.find((x) => x.key === key)
    if (item) return { item, to: `/treatments/${c.slug}#${key}` }
  }
  return null
}

const pickCards = (cards) => cards.map((c) => ({ ...find(c.key), title: c.title, image: c.image }))

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
        {pickCards(RECOMMENDED).map(({ item, to, title }, i) => (
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
              <span className="mt-2 inline-block text-sm font-medium">{t({ en: 'Learn more', zh: '查看更多' })} &gt;</span>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 sm:mt-28">
        <Heading>{t({ en: 'Signature Treatments', zh: '王牌项目' })}</Heading>
        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:gap-8">
          {pickCards(SIGNATURE).map(({ item, to, title, image }, i) => (
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
                  <h3 className="font-display text-xl sm:text-2xl lg:text-3xl">{t(title)}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed lg:text-base text-muted">{t(item.body)}</p>
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
