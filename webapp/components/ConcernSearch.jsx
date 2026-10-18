import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLang } from '../i18n'
import Reveal from './Reveal'

// The treatments a concern can lead to (path = treatment category page + the treatment's key).
const T = {
  pico: { zh: '皮秒', en: 'Pico laser', to: '/treatments/devices#skin-4' },
  m22: { zh: '光子嫩肤', en: 'Stellar M22 IPL', to: '/treatments/devices#skin-3' },
  rejuran: { zh: '瑞妍', en: 'Rejuran', to: '/treatments/skincare-experts#rejuran-brightening' },
  goldNeedle: { zh: '黄金微针', en: 'Gold RF microneedling', to: '/treatments/devices#skin-7' },
  acneNeedle: { zh: '祛痘微针', en: 'Acne microneedling', to: '/treatments/devices#acne-microneedling' },
  acneFacial: { zh: '祛痘针清', en: 'Acne-clearing facial', to: '/treatments/skincare-experts#acne-clearing' },
  thermage: { zh: '热玛吉', en: 'Thermage FLX', to: '/treatments/devices#skin-1' },
  contour: { zh: '面部轮廓塑形', en: 'Face contouring', to: '/treatments/injectables#injectables-4' },
  threadLift: { zh: '铃铛童颜线面部提升', en: 'Silhouette InstaLift', to: '/treatments/injectables#injectables-5' },
  smallFace: { zh: '日式小颜', en: 'Japanese face slimming', to: '/treatments/skincare-experts#japanese-face-correction' },
  mesotherapy: { zh: '水光针', en: 'Mesotherapy', to: '/treatments/injectables#skin-2' },
  hbot: { zh: '高压氧舱', en: 'Hyperbaric oxygen', to: '/treatments/devices#wellness-1' },
  nad: { zh: 'NAD+ 静脉注射', en: 'NAD+ IV Therapy', to: '/treatments/iv-therapy#iv-therapy-1' },
  vitality: { zh: '活力能量针', en: 'Vitality Booster IV', to: '/treatments/iv-therapy#hormone-stem-cell-2' },
  stemCell: { zh: '干细胞治疗', en: 'Stem Cell Therapy', to: '/treatments/iv-therapy#stem-cell' },
  bComplex: { zh: '维生素 B 群注射', en: 'B-Complex Shots', to: '/treatments/injectables#wellness-2' },
  hormone: { zh: '荷尔蒙平衡补充治疗', en: 'Hormone Balance Therapy', to: '/treatments/injectables#hormone-stem-cell-1' },
  skinceuticals: { zh: '修丽可护肤', en: 'SkinCeuticals facial', to: '/treatments/skincare-experts#skinceuticals-cleanse-hydrate' },
}

// dot = point on the photo, label = where the pill sits (both in % of the photo); side = which edge of the pill faces the dot.
// `to` is one path, or a list of treatments: the pill then opens a small list to choose from.
// The left-hand pills are spaced evenly from 8 to 92 (twelve of them, 7.6 apart).
const face = [
  { zh: '头发', en: 'Hair', to: '/treatments/injectables#hair-2', dot: [55.0, 10.0], label: [78, 8.0] },
  { zh: '眉间纹', en: 'Frown lines', to: '/treatments/injectables#injectables-1', dot: [55.0, 34.5], label: [78, 23.0] },
  { zh: '眼皮', en: 'Eyelids', to: '/treatments/injectables#injectables-1', dot: [45.0, 34.3], label: [22, 8.0], side: 'l' },
  { zh: '睫毛', en: 'Lashes', to: '/treatments/lash', dot: [40.3, 36.6], label: [22, 23.3], side: 'l' },
  { zh: '眼袋', en: 'Eye bags', to: '/treatments/injectables#injectables-2', dot: [45.0, 40.5], label: [22, 30.9], side: 'l' },
  { zh: '泪沟', en: 'Tear troughs', to: '/treatments/injectables#injectables-2', dot: [41.0, 42.0], label: [22, 38.5], side: 'l' },
  { zh: '苹果肌', en: 'Cheeks', to: '/treatments/injectables#injectables-2', dot: [39, 43.5], label: [22, 46.2], side: 'l' },
  { zh: '全脸松弛', en: 'Facial laxity', to: [T.thermage, T.contour, T.threadLift, T.smallFace], dot: [40.5, 59.5], label: [22, 84.4], side: 'l' },
  { zh: '下巴', en: 'Chin', to: '/treatments/injectables#injectables-4', dot: [54.3, 65.0], label: [78, 91.0] },
  { zh: '毛孔', en: 'Pores', to: [T.goldNeedle, T.skinceuticals], dot: [44, 47], label: [22, 53.8], side: 'l' },
  { zh: '痘坑', en: 'Acne scars', to: '/treatments/devices#skin-7', dot: [41.5, 50.0], label: [22, 61.5], side: 'l' }, // 黄金微针
  { zh: '痘印', en: 'Acne marks', to: '/treatments/devices#skin-4', dot: [40, 53], label: [22, 69.1], side: 'l' }, // 皮秒
  { zh: '额头皱纹', en: 'Forehead lines', to: '/treatments/injectables#injectables-1', dot: [55.0, 26.0], label: [78, 15.0] },
  { zh: '眉形', en: 'Brows', to: '/treatments/microblading', dot: [42.0, 31.8], label: [22, 15.6], side: 'l' },
  { zh: '太阳穴', en: 'Temples', to: '/treatments/injectables#injectables-2', dot: [73.5, 34.5], label: [78, 31.5] },
  { zh: '山根', en: 'Nose bridge', to: '/treatments/injectables#injectables-4', dot: [55.0, 40.0], label: [78, 40.0] },
  { zh: '晒斑', en: 'Sun spots', to: [T.pico, T.m22, T.rejuran], dot: [71, 44], label: [78, 48.5] },
  { zh: '色沉', en: 'Pigmentation', to: [T.m22, T.rejuran], dot: [73, 49.5], label: [78, 57.0] },
  { zh: '鼻基底', en: 'Nose base', to: '/treatments/injectables#injectables-2', dot: [49.5, 47.5], label: [22, 76.7], side: 'l' },
  { zh: '痘痘', en: 'Acne', to: [T.acneNeedle, T.acneFacial], dot: [68.0, 50.0], label: [78, 65.5] },
  { zh: '唇部', en: 'Lips', to: '/treatments/injectables#injectables-2', dot: [53.5, 56.0], label: [22, 92.0], side: 'l' },
  { zh: '肤质・美白', en: 'Skin brightening', to: [T.m22, T.mesotherapy], dot: [67.0, 57.0], label: [78, 74.0] },
  { zh: '小脸・轮廓', en: 'Face slimming', to: '/treatments/skincare-experts#japanese-face-correction', dot: [63.5, 62.0], label: [78, 82.5] },
]
const body = [
  { zh: '颈部', en: 'Neck', to: '/treatments/injectables#injectables-1', dot: [45.7, 19.5], label: [22, 18.5], side: 'l' },
  { zh: '手臂', en: 'Arms', to: '/treatments/injectables#body-3', dot: [38.4, 27.0], label: [22, 27.0], side: 'l' },
  { zh: '腹部', en: 'Abdomen', to: '/treatments/injectables#body-3', dot: [47.3, 40.0], label: [22, 40.0], side: 'l' },
  { zh: '肩膀', en: 'Shoulders', to: '/treatments/injectables#injectables-1', // 肉毒
    dot: [57.1, 19.0], label: [78, 19.0] },
  { zh: '小腿', en: 'Calves', to: '/treatments/injectables#injectables-1', // 肉毒
    dot: [47.3, 78.0], label: [22, 78.0], side: 'l' },
  { zh: '全身抗衰', en: 'Body anti-aging', to: [T.nad, T.vitality, T.stemCell, T.bComplex, T.hormone, T.hbot], dot: [59.5, 25.5], label: [78, 27.5] },
  { zh: '体重管理', en: 'Weight control', to: '/treatments/injectables#tirzepatide', dot: [58.9, 40.0], label: [78, 40.0] },
  { zh: '全身紧致', en: 'Body firming', to: '/treatments/injectables#hormone-stem-cell-1', dot: [59.8, 50.0], label: [78, 50.0] },
  { zh: '全身美白', en: 'Body brightening', to: '/treatments/iv-therapy#iv-therapy-2', // 美白焕肤针
    dot: [42.5, 53.5], label: [22, 55.0], side: 'l' },
  { zh: '大腿', en: 'Thighs', to: '/treatments/injectables#body-3', dot: [53.6, 56.0], label: [78, 58.5] },
]

function Panel({ title, photo, items, lang, aspect }) {
  const [openKey, setOpenKey] = useState('') // the concern whose list of treatments is open
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
        {items.map((it) => {
          const pill = `absolute -translate-y-1/2 bg-white/95 ${lang === 'en' ? 'w-max rounded-2xl px-2 py-0.5 text-center text-[10px] leading-tight sm:py-1 sm:text-[10.5px] lg:text-[11px]' : 'whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-sm lg:text-base'} font-medium text-ink shadow transition hover:bg-gold hover:text-ivory sm:text-sm`
          const place = { [it.side === 'l' ? 'right' : 'left']: `${it.side === 'l' ? 100 - it.label[0] : it.label[0]}%`, top: `${it.label[1]}%`, ...(lang === 'en' ? { maxWidth: `${it.side === 'l' ? it.label[0] : 100 - it.label[0]}%` } : {}) }
          const name = lang === 'zh' ? it.zh : it.en
          return (
            <span key={it.zh}>
              <span
                className="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm ring-1 ring-gold/70 sm:h-1.5 sm:w-1.5"
                style={{ left: `${it.dot[0]}%`, top: `${it.dot[1]}%` }}
              />
              {Array.isArray(it.to) ? (
                // Two or more treatments for one concern: the pill opens a small list to choose from.
                <>
                  <button type="button" aria-expanded={openKey === it.zh} onClick={() => setOpenKey(openKey === it.zh ? '' : it.zh)} className={pill} style={place}>{name}</button>
                  {openKey === it.zh && (
                    <span
                      className="absolute z-20 flex w-max flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-ink/10"
                      style={{ [it.side === 'l' ? 'left' : 'right']: '3%', maxWidth: '94%', ...(it.label[1] > 60 ? { bottom: `calc(${100 - it.label[1]}% + 1.5rem)` } : { top: `calc(${it.label[1]}% + 1.5rem)` }) }} // low pills open upwards, so the list stays inside the photo
                    >
                      {it.to.map((o) => <Link key={o.to} to={o.to} className="whitespace-nowrap px-3.5 py-2 text-sm hover:bg-gold hover:text-ivory">{lang === 'zh' ? o.zh : o.en}</Link>)}
                    </span>
                  )}
                </>
              ) : (
                <Link to={it.to} className={pill} style={place}>{name}</Link>
              )}
            </span>
          )
        })}
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
        <Reveal><Panel title={t({ en: 'Face', zh: '面部' })} photo={lang === 'en' ? '/images/concern-face-en.jpg' : '/images/concern-face.jpg'} items={face} lang={lang} aspect="3/4" /></Reveal>
        <Reveal delay={100}><Panel title={t({ en: 'Body', zh: '身体' })} photo={lang === 'en' ? '/images/concern-body-en.jpg' : '/images/concern-body.jpg'} items={body} lang={lang} aspect="3/4" /></Reveal>
      </div>
      <div className="mt-10 text-center">
        <Link to="/treatments" className="btn-ghost">{t({ en: 'View all treatments', zh: '查看全部项目' })} <ArrowRight size={16} /></Link>
      </div>
    </section>
  )
}
