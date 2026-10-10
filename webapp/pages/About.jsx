import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Clock, MapPin, MessageCircle, Phone, ShoppingBag, ClipboardCheck, Fingerprint, Leaf, HeartHandshake } from 'lucide-react'
import { useLang } from '../i18n'
import { business, categories, galleryPhotos } from '../data/site'
import { ui } from '../components/ui'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import CtaBand from '../components/CtaBand'
import ArtistCard from '../components/ArtistCard'
import Lightbox from '../components/Lightbox'
import WeChatModal from '../components/WeChatModal'

// Principles shown under "Our philosophy".
const principles = [
  {
    icon: ClipboardCheck,
    title: { en: 'Assess first', zh: '先评估，再方案' },
    body: { en: 'Every visit starts with a professional assessment of your face and goals.', zh: '每一次护理都从专业评估开始，了解您的面部状态与期望。' },
  },
  {
    icon: Fingerprint,
    title: { en: 'Made for you', zh: '一人一方案' },
    body: { en: 'No one-size-fits-all packages: plans are designed around you.', zh: '不做千篇一律的套餐，依个人情况量身定制。' },
  },
  {
    icon: Leaf,
    title: { en: 'Natural results', zh: '自然、协调' },
    body: { en: 'We aim for refined, harmonious results that still look like you.', zh: '追求精致、协调的效果，让您依然是自己最自然的样子。' },
  },
  {
    icon: HeartHandshake,
    title: { en: 'Comfort and care', zh: '舒适、用心' },
    body: { en: 'A calm space and attentive service from the first consultation to aftercare.', zh: '安静舒适的环境，从咨询到护理后的每个细节都用心对待。' },
  },
]

// Team members shown on the page: photo, role, bio paragraphs and optional tag line.
const team = [
  {
    name: 'Yingna Jiang, RN',
    role: { en: 'Senior Aesthetic Registered Nurse | Founder', zh: '资深医学美容注册护士｜品牌创始人' },
    image: '/images/team-yingna.jpg',
    bio: {
      en: [
        'Yingna Jiang, RN, is a US registered nurse and the founder of Nouvelle Anti-Aging, with more than ten years of clinical experience in medical aesthetics. She gained extensive hands-on experience at a Beverly Hills plastic surgery hospital.',
        'She focuses on refined facial injections, feature fine-tuning, pigment management, acne treatment and facial rejuvenation, and designs precise, personalised plans around each client’s facial structure, skin condition and aesthetic character.',
        'Guided by “natural aesthetics, precise medicine and science-based anti-aging”, she brings professional medical technique together with a refined sense of beauty, helping every client reach a natural, polished and vibrant youthful look.',
      ],
      zh: [
        'Yingna Jiang，RN，美国注册护士，Nouvelle Anti-Aging 创始人，拥有超过十年的医学美容临床经验，曾在比佛利整形外科医院积累丰富的专业实践经验。',
        '她专注于面部精细化注射、五官微调、色素管理、痤疮治疗及面部年轻化抗衰领域，擅长结合面部结构、肌肤状态与个人美学特征，制定精准且个性化的美容方案。',
        '秉承「自然美学、精准医疗、科学抗衰」的核心理念，她致力于将专业医学技术与高端美学相融合，帮助每位顾客实现自然、精致且富有生命力的年轻状态。',
      ],
    },
  },
  {
    name: 'Dr. Lee L.Q. Pu, MD',
    role: { en: 'Internationally Renowned Plastic & Aesthetic Surgeon', zh: '国际知名整形美容外科专家' },
    image: '/images/team-lee-pu.jpg',
    bio: {
      en: [
        'Dr. Lee L.Q. Pu is an internationally renowned plastic and aesthetic surgeon, Professor Emeritus at the University of California, Davis Medical Center (UC Davis), and a former Editor-in-Chief of the international journal Aesthetic Plastic Surgery.',
        'Dr. Pu has deep academic expertise and extensive clinical experience in plastic and aesthetic surgery and facial rejuvenation, and has long devoted himself to researching and promoting innovation in plastic surgery techniques, minimally invasive aesthetics and natural rejuvenation.',
        'As a leading figure in international plastic and aesthetic medicine, he actively promotes global exchange in medical aesthetic technology, championing science-based medicine that combines precise technique with natural aesthetics, and offers professional guidance for the development of modern aesthetic surgery and anti-aging medicine.',
      ],
      zh: [
        'Dr. Lee L.Q. Pu 是国际知名整形美容外科专家、美国加州大学戴维斯医学中心（UC Davis Medical Center）终身名誉教授，并曾担任国际权威学术期刊《Aesthetic Plastic Surgery》主编。',
        'Dr. Pu 在整形美容外科及面部年轻化领域拥有深厚的学术造诣与丰富的临床经验，长期致力于整形外科技术创新、微创美容及自然年轻化理念的研究与推广。',
        '作为国际整形美容学术领域的重要专家，他积极推动全球医学美容技术交流，倡导以科学医学为基础，融合精准技术与自然美学，为现代整形美容及抗衰老医学的发展提供专业指导。',
      ],
    },
  },
]

// Clinic photos sorted into three groups (file names in /images/gallery).
const SPACE_GROUPS = [
  { title: { en: 'Clinic exterior', zh: '诊所外观' }, files: ['outside-1', 'exterior-dusk'] },
  { title: { en: 'Reception & lobby', zh: '接待大厅' }, files: ['lounge', 'front-desk-new', 'hallway-new', 'waiting-area', 'hallway-bright', 'waiting-hall'] },
  {
    title: { en: 'Treatment rooms', zh: '诊疗室' },
    files: ['treatment-room-new', 'treatment-room-purple', 'treatment-room-laser', 'treatment-room-laser-2', 'treatment-room-twin', 'treatment-room-spa', 'brow-room', 'brow-room-2'],
  },
]

// One photo at a time for a group; the rest of the group slides in sideways (swipe, arrows or scroll).
function PhotoCarousel({ title, photos, onOpen }) {
  const { t } = useLang()
  const track = useRef(null)
  const [index, setIndex] = useState(0)
  const go = (dir) => {
    const el = track.current
    if (!el) return
    const next = (Math.round(el.scrollLeft / el.clientWidth) + dir + photos.length) % photos.length
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
  }
  const arrow = 'absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ivory/85 text-ink shadow transition hover:bg-ivory'
  return (
    <div>
      <h3 className="mb-3 font-display text-2xl">{t(title)}</h3>
      <div className="relative overflow-hidden rounded-[1.5rem] bg-sand">
        <ul
          ref={track}
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((p, i) => (
            <li key={p.src} className="relative aspect-[4/3] w-full shrink-0 snap-start">
              <button type="button" onClick={() => onOpen(i)} aria-label={t({ en: 'Enlarge photo', zh: '放大照片' })} className="block h-full w-full cursor-zoom-in">
                <img src={p.src} alt={t(p.caption)} loading="lazy" className="h-full w-full object-cover" />
              </button>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 text-sm text-ivory">{t(p.caption)}</span>
            </li>
          ))}
        </ul>
        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous" className={`${arrow} left-3`}><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next" className={`${arrow} right-3`}><ChevronRight size={20} /></button>
            <span className="absolute right-3 top-3 rounded-full bg-ink/60 px-3 py-1 text-xs text-ivory">{index + 1} / {photos.length}</span>
          </>
        )}
      </div>
    </div>
  )
}

export default function About() {
  const { t, lang } = useLang()
  const loc = business.locations[0]
  // The photo group and index currently shown enlarged in the modal (null = closed).
  const [open, setOpen] = useState(null)
  const [wechatOpen, setWechatOpen] = useState(false)
  const groups = SPACE_GROUPS.map((g) => ({
    title: g.title,
    photos: g.files.map((n) => galleryPhotos.find((p) => p.src.includes(`/${n}.`))).filter(Boolean),
  }))

  return (
    <>
      <PageHeader
        eyebrow={t(ui.nav.about)}
        title={t({ en: 'Nouvelle Anti-Aging Center', zh: 'Nouvelle 抗衰老中心' })}
        intro={t({
          en: 'Medical aesthetics, skincare, lashes, permanent makeup and whole-body anti-aging in one place — thoughtfully tailored, beautifully natural',
          zh: '医学美容、护肤、美睫、纹绣与全身抗衰老，集于一处——用心定制，自然美丽',
        })}
      />

      {/* Philosophy */}
      <section className="container-x py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-4">{t({ en: 'Our philosophy', zh: '经营理念' })}</p>
            <h2 className="font-display text-3xl font-light leading-tight sm:text-5xl">
              {t({ en: 'Natural, precise and personal.', zh: '自然、精准、个性化' })}
            </h2>
            <div className="mt-6 h-px w-16 bg-gold" />
            <p className="mt-6 text-lg leading-relaxed text-muted">
              {t({
                en: 'We believe good aesthetic care starts with listening. Our team combines professional assessment with careful technique to design results that suit your features, your lifestyle and your goals.',
                zh: <>我们相信好的美容护理，是从倾听开始的。团队以专业评估为基础、细致的手法为支撑，为您设计契合五官、生活方式与期望的效果。</>,
              })}
            </p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {principles.map((p, i) => (
              <Reveal key={i} delay={i * 80} className="rounded-[2rem] bg-sand p-7 transition hover:shadow-xl hover:shadow-ink/5">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-ivory text-gold"><p.icon size={22} strokeWidth={1.6} /></span>
                  <span className="font-display text-sm text-gold/70">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-5 font-display text-2xl">{t(p.title)}</h3>
                <p className="mt-3 leading-relaxed text-muted">{t(p.body)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container-x pb-16 sm:pb-24">
        <Reveal className="max-w-2xl">
          <p className="eyebrow mb-4">{t({ en: 'Our team', zh: '专业团队' })}</p>
          <h2 className="font-display text-3xl font-light leading-tight sm:text-5xl">
            {t({ en: 'The people behind your care.', zh: '医学美容专家团队' })}
          </h2>
        </Reveal>
        <div className="mt-12 space-y-8">
          {team.map((m) => (
            <Reveal key={m.name}>
              <ArtistCard artist={m} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Environment */}
      <section className="container-x py-16 sm:py-24">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-4">{t({ en: 'Our space', zh: '诊所环境' })}</p>
            <h2 className={`font-display text-3xl font-light leading-tight sm:text-5xl ${lang === 'zh' ? 'md:whitespace-nowrap' : 'max-w-xl'}`}>
              {t({ en: 'A calm, comfortable place to be cared for.', zh: '安静、舒适，让您放松，备受呵护' })}
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-5">
          {groups.map((g, i) => (
            <Reveal key={g.title.zh} delay={i * 80}>
              <PhotoCarousel title={g.title} photos={g.photos} onOpen={(index) => setOpen({ group: i, index })} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-sand py-16 sm:py-24">
        <div className="container-x">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="eyebrow mb-4">{t({ en: 'What we offer', zh: '经营项目' })}</p>
              <h2 className="font-display text-2xl font-light leading-snug sm:text-3xl">
                {t({
                  en: 'Covering medical aesthetic injectables, energy-based anti-aging, skin management, lashes and permanent makeup, and body and scalp care — professional technology and refined aesthetics, bringing out your natural beauty.',
                  zh: '涵盖医美注射、光电抗衰、肌肤管理、美睫纹绣、身体及头皮护理，以专业科技与精致美学，焕发自然之美。',
                })}
              </h2>
            </div>
            <Link to="/treatments" className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium">
              {t({ en: 'View all treatments', zh: '查看所有项目' })} <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ...categories.map((c) => ({ key: c.slug, to: `/treatments/${c.slug}`, name: c.name, short: c.short, icon: <Icon name={c.icon} size={22} className="shrink-0 text-gold" /> })),
              {
                key: 'shop',
                to: '/shop',
                name: ui.nav.shop,
                short: { en: 'Selected skincare, hair-care and professional beauty brands.', zh: '精选优质护肤、洗护及专业美容品牌。' },
                icon: <ShoppingBag size={22} className="shrink-0 text-gold" />,
              },
            ].map((c, i) => (
              <Reveal key={c.key} delay={(i % 3) * 80}>
                <Link
                  to={c.to}
                  className="group flex h-full items-start justify-between gap-4 rounded-[1.5rem] bg-ivory p-6 transition hover:shadow-xl hover:shadow-ink/5"
                >
                  <span>
                    <span className="flex items-center gap-3">
                      {c.icon}
                      <span className="block font-display text-2xl">{t(c.name)}</span>
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-muted">{t(c.short).replace(/[。.]\s*$/, '')}</span>
                  </span>
                  <ArrowUpRight size={18} className="mt-1 shrink-0 text-gold transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-4">{t({ en: 'Location', zh: '诊所地点' })}</p>
            <h2 className="font-display text-3xl font-light leading-tight sm:text-4xl">
              {t({ en: 'Find us in Bellevue, WA.', zh: '位于华盛顿州贝尔维尤' })}
            </h2>
            <ul className="mt-8 space-y-5">
              <li className="flex gap-3">
                <MapPin size={20} className="mt-1 shrink-0 text-gold" />
                <span>
                  <span className="block font-medium">{t(loc.label)}</span>
                  {loc.line1}<br />{loc.line2}
                  <span className="block text-sm text-muted">{t({ en: 'Ample free parking on site', zh: '配备充足的免费停车位' })}</span>
                </span>
              </li>
              <li className="flex gap-3">
                <Clock size={20} className="mt-1 shrink-0 text-gold" />
                <span>
                  {business.hours.map((h, i) => (
                    <span key={i} className="block">{t(h.day)}　{t(h.time)}</span>
                  ))}
                  <span className="block text-sm text-muted">{t(business.holidayNote)}</span>
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={20} className="mt-1 shrink-0 text-gold" />
                <a href={business.phoneHref} className="hover:text-gold">{business.phone}</a>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={loc.maps} target="_blank" rel="noreferrer" className="btn-ghost">{t(ui.directions)} <ArrowUpRight size={16} /></a>
              <Link to="/contact" className="btn-primary">{t(ui.book)} <ArrowRight size={16} /></Link>
              <button type="button" onClick={() => setWechatOpen(true)} className="btn-ghost"><MessageCircle size={16} /> {t({ en: 'WeChat', zh: '微信联系' })}</button>
            </div>
          </Reveal>
          <Reveal delay={100} className="overflow-hidden rounded-[2rem] border border-ink/10 lg:col-span-7">
            <iframe title={t(loc.label)} src={loc.embed} className="h-80 w-full grayscale-[0.4] lg:h-full lg:min-h-[24rem]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </Reveal>
        </div>
      </section>

      {open && (
        <Lightbox
          photos={groups[open.group].photos}
          index={open.index}
          onClose={() => setOpen(null)}
          onStep={(d) => setOpen((o) => (o ? { ...o, index: (o.index + d + groups[o.group].photos.length) % groups[o.group].photos.length } : o))}
        />
      )}
      {wechatOpen && <WeChatModal onClose={() => setWechatOpen(false)} />}
      <CtaBand />
    </>
  )
}
