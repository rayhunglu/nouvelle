import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLang } from '../i18n'
import Reveal from './Reveal'

// dot = point on the photo, label = where the pill sits (both in % of the photo); side = which edge of the pill faces the dot.
const face = [
  { zh: '头发', en: 'Hair', to: '/treatments/injectables#hair-2', dot: [55.0, 10.0], label: [78, 8.0] },
  { zh: '眉间纹', en: 'Frown lines', to: '/treatments/injectables#injectables-1', dot: [55.0, 34.5], label: [78, 23.0] },
  { zh: '眼皮', en: 'Eyelids', to: '/treatments/injectables#injectables-1', dot: [45.0, 34.3], label: [22, 8.0], side: 'l' },
  { zh: '睫毛', en: 'Lashes', to: '/treatments/lash', dot: [40.3, 36.6], label: [22, 24.8], side: 'l' },
  { zh: '眼袋', en: 'Eye bags', to: '/treatments/injectables#injectables-2', dot: [45.0, 40.5], label: [22, 33.2], side: 'l' },
  { zh: '泪沟', en: 'Tear troughs', to: '/treatments/injectables#injectables-2', dot: [41.0, 42.0], label: [22, 41.6], side: 'l' },
  { zh: '苹果肌', en: 'Cheeks', to: '/treatments/injectables#injectables-2', dot: [39, 43.5], label: [22, 50.0], side: 'l' },
  { zh: '全脸松弛', en: 'Skin laxity', to: '/treatments/injectables#injectables-5', dot: [40.5, 59.5], label: [22, 83.6], side: 'l' },
  { zh: '下巴', en: 'Chin', to: '/treatments/injectables#injectables-4', dot: [54.3, 65.0], label: [78, 91.0] },
  { zh: '毛孔', en: 'Pores', to: '/treatments/skincare-experts', dot: [44, 47], label: [22, 58.4], side: 'l' },
  { zh: '痘印', en: 'Acne marks', to: '/treatments/skincare-experts#acne-clearing', dot: [40, 53], label: [22, 66.8], side: 'l' },
  { zh: '额头皱纹', en: 'Forehead lines', to: '/treatments/injectables#injectables-1', dot: [55.0, 26.0], label: [78, 15.0] },
  { zh: '眉形', en: 'Brows', to: '/treatments/microblading', dot: [42.0, 31.8], label: [22, 16.4], side: 'l' },
  { zh: '太阳穴', en: 'Temples', to: '/treatments/injectables#injectables-2', dot: [73.5, 34.5], label: [78, 31.5] },
  { zh: '山根', en: 'Nose bridge', to: '/treatments/injectables#injectables-4', dot: [55.0, 40.0], label: [78, 40.0] },
  { zh: '晒斑', en: 'Sun spots', to: '/treatments/skincare-experts#rejuran-brightening', dot: [71, 44], label: [78, 48.5] },
  { zh: '色沉', en: 'Pigmentation', to: '/treatments/skincare-experts#rejuran-brightening', dot: [73, 49.5], label: [78, 57.0] },
  { zh: '鼻基底', en: 'Nose base', to: '/treatments/injectables#injectables-2', dot: [49.5, 47.5], label: [22, 75.2], side: 'l' },
  { zh: '痘痘', en: 'Acne', to: '/treatments/skincare-experts#acne-clearing', dot: [68.0, 50.0], label: [78, 65.5] },
  { zh: '唇部', en: 'Lips', to: '/treatments/injectables#injectables-2', dot: [53.5, 56.0], label: [22, 92.0], side: 'l' },
  { zh: '肤质・美白', en: 'Brightening', to: '/treatments/skincare-experts', dot: [67.0, 57.0], label: [78, 74.0] },
  { zh: '小脸・轮廓', en: 'Face contour', to: '/treatments/skincare-experts#japanese-face-correction', dot: [63.5, 62.0], label: [78, 82.5] },
]
const body = [
  { zh: '颈部', en: 'Neck', to: '/treatments/injectables#injectables-1', dot: [45.7, 19.5], label: [22, 18.5], side: 'l' },
  { zh: '手臂', en: 'Arms', to: '/treatments/injectables#body-3', dot: [38.4, 27.0], label: [22, 27.0], side: 'l' },
  { zh: '腹部', en: 'Abdomen', to: '/treatments/injectables#body-3', dot: [47.3, 40.0], label: [22, 40.0], side: 'l' },
  { zh: '肩膀', en: 'Shoulders', to: '/treatments/injectables#body-3', dot: [57.1, 19.0], label: [78, 19.0] },
  { zh: '小腿', en: 'Calves', to: '/treatments/injectables#body-3', dot: [47.3, 78.0], label: [22, 78.0], side: 'l' },
  { zh: '全身抗衰', en: 'Anti-aging', to: '/treatments/injectables#hormone-stem-cell-1', dot: [59.5, 25.5], label: [78, 27.5] },
  { zh: '体重管理', en: 'Weight', to: '/treatments/injectables#tirzepatide', dot: [58.9, 40.0], label: [78, 40.0] },
  { zh: '全身紧致', en: 'Firming', to: '/treatments/injectables#hormone-stem-cell-1', dot: [59.8, 50.0], label: [78, 50.0] },
  { zh: '全身美白', en: 'Whitening', to: '/treatments/skincare-experts#rejuran-brightening', dot: [42.5, 53.5], label: [22, 55.0], side: 'l' },
  { zh: '大腿', en: 'Thighs', to: '/treatments/injectables#body-3', dot: [53.6, 56.0], label: [78, 58.5] },
]

function Panel({ title, photo, items, lang, aspect }) {
  return (
    <div className="rounded-[2rem] bg-sand p-4 sm:p-6 lg:p-10">
      <h3 className="mb-4 text-center font-display text-2xl">{title}</h3>
      <div className="relative mx-auto w-full max-w-[34rem] overflow-hidden rounded-[1.5rem]" style={{ aspectRatio: aspect }}>
        <img src={photo} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {items.map((it) => (
            <line
              key={it.zh}
              x1={it.dot[0]} y1={it.dot[1]} x2={it.label[0]} y2={it.label[1]}
              stroke="#c9a46c" strokeWidth="1" strokeDasharray="2 3" strokeLinecap="round" vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {items.map((it) => (
          <span key={it.zh}>
            <span
              className="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm ring-1 ring-gold/70 sm:h-1.5 sm:w-1.5"
              style={{ left: `${it.dot[0]}%`, top: `${it.dot[1]}%` }}
            />
            <Link
              to={it.to}
              className="absolute -translate-y-1/2 whitespace-nowrap rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:py-1.5 sm:text-sm lg:text-base text-ink shadow transition hover:bg-gold hover:text-ivory sm:text-sm"
              style={{ [it.side === 'l' ? 'right' : 'left']: `${it.side === 'l' ? 100 - it.label[0] : it.label[0]}%`, top: `${it.label[1]}%` }}
            >
              {lang === 'zh' ? it.zh : it.en}
            </Link>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ConcernSearch() {
  const { t, lang } = useLang()
  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 pb-20 sm:px-6 sm:pb-28 lg:px-10">
      <Reveal className="text-center">
        <p className="eyebrow mb-4">{t({ en: 'Search by concern', zh: '按困扰找项目' })}</p>
        <h2 className="font-display text-4xl font-light leading-tight sm:text-5xl">
          {t({ en: 'What would you like to improve?', zh: '你想改善哪里？' })}
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:gap-12">
        <Reveal><Panel title={t({ en: 'Face', zh: '面部' })} photo="/images/concern-face.jpg" items={face} lang={lang} aspect="3/4" /></Reveal>
        <Reveal delay={100}><Panel title={t({ en: 'Body', zh: '身体' })} photo="/images/concern-body.jpg" items={body} lang={lang} aspect="3/4" /></Reveal>
      </div>
      <div className="mt-10 text-center">
        <Link to="/treatments" className="btn-ghost">{t({ en: 'View all treatments', zh: '查看全部项目' })} <ArrowRight size={16} /></Link>
      </div>
    </section>
  )
}
