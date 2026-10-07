import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, MessageCircle, Sparkles, MessageCircleQuestion } from 'lucide-react'
import { useLang } from '../i18n'
import { setConsultService } from '../consult'
import { categories, getCategory } from '../data/site'
import { ui } from '../components/ui'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import CtaBand from '../components/CtaBand'
import NotFound from './NotFound'

// Small "Consult" button: remembers this service in a cookie and opens the Contact form.
function ConsultLink({ item }) {
  const { t } = useLang()
  return (
    <Link to="/contact" onClick={() => setConsultService(item.key)} className="btn-ghost !px-4 !py-1.5 !text-xs">
      <MessageCircle size={13} /> {t({ en: 'Consult', zh: '咨询' })}
    </Link>
  )
}

function Price({ row }) {
  const { t } = useLang()
  return (
    <div className="mt-5 flex items-center justify-between gap-4 rounded-[1.5rem] border border-ink/10 px-5 py-3">
      <span className="font-medium">{t(row.name)}</span>
      <span className="flex gap-6 text-right">
        <span>
          <span className="block text-xs uppercase tracking-wider text-muted">{t({ en: 'Single', zh: '单次价' })}</span>
          ${row.single}
        </span>
        <span>
          <span className="block text-xs uppercase tracking-wider text-muted">{t({ en: 'Member', zh: '会员价' })}</span>
          <span className="font-medium text-gold">${row.member}</span>
        </span>
      </span>
    </div>
  )
}

function PosterGallery({ images, alt, i, setI }) {
  const step = (d) => setI((n) => (n + d + images.length) % images.length)
  const arrow = 'absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ivory/85 text-ink shadow transition hover:bg-ivory'
  return (
    <div>
      <div className="relative aspect-[12/11] overflow-hidden rounded-[1.5rem] bg-sand">
        <img key={images[i]} src={images[i]} alt={alt} className="h-full w-full object-cover" />
        <button type="button" onClick={() => step(-1)} aria-label="Previous" className={`${arrow} left-3`}><ChevronLeft size={20} /></button>
        <button type="button" onClick={() => step(1)} aria-label="Next" className={`${arrow} right-3`}><ChevronRight size={20} /></button>
      </div>
      <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {images.map((src, n) => (
          <li key={src} className="shrink-0">
            <button
              type="button"
              onClick={() => setI(n)}
              aria-label={`${n + 1} / ${images.length}`}
              aria-current={n === i}
              className={`block h-16 w-16 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-20 ${n === i ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function GalleryDetail({ item }) {
  const { t } = useLang()
  const [i, setI] = useState(0)
  const copy = item.styles?.[i] ?? item
  return (
    <Reveal as="article" id={item.key} className="scroll-mt-28 grid gap-10 py-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <h3 className="font-display text-3xl font-light sm:text-4xl">{t(item.name)}</h3>
        <div className="mt-4"><ConsultLink item={item} /></div>
        <p className="mt-5 text-lg leading-relaxed text-muted">{t(copy.body)}</p>
        {item.prices?.[i] && <Price row={item.prices[i]} />}
        {copy.bullets && (
          <div className="mt-8">
            <h4 className="eyebrow mb-4">{item.styles ? t({ en: 'Style highlights', zh: '款式特点' }) : copy.suited ? t({ en: 'Highlights', zh: '项目特点' }) : t({ en: 'Benefits', zh: '功效' })}</h4>
            <ul className="space-y-3">
              {t(copy.bullets).map((b) => (
                <li key={b} className="flex items-start gap-2"><Check size={18} className="mt-0.5 shrink-0 text-gold" />{b}</li>
              ))}
            </ul>
          </div>
        )}
        {copy.suited && (
          <div className="mt-8">
            <h4 className="eyebrow mb-3">{t({ en: 'Who it’s for', zh: '适合人群' })}</h4>
            <p className="leading-relaxed">{t(copy.suited)}</p>
          </div>
        )}
      </div>
      <div className="lg:col-span-7">
        <PosterGallery images={item.posters} alt={t(item.name)} i={i} setI={setI} />
      </div>
    </Reveal>
  )
}

function Detail({ item, index }) {
  const { t } = useLang()
  if (item.posters?.length > 1) return <GalleryDetail item={item} />
  return (
    <Reveal as="article" id={item.key} className="scroll-mt-28 grid gap-10 py-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        {!item.hideIndex && <span className="font-display text-sm text-gold">{String(index + 1).padStart(2, '0')}</span>}
        <h3 className="mt-2 font-display text-3xl font-light sm:text-4xl">{t(item.name)}</h3>
        <div className="mt-4"><ConsultLink item={item} /></div>
        {item.photo && !item.poster && !item.posters && (
          <img src={t(item.photo)} alt={t(item.name)} loading="lazy" className="mt-6 aspect-[4/3] w-full rounded-[1.5rem] bg-sand object-cover" />
        )}
        {(item.posters ?? (item.poster ? [item.poster] : [])).map((src) => (
          <a key={src} href={src} target="_blank" rel="noreferrer" className="mt-6 block overflow-hidden rounded-[1.5rem] bg-sand">
            <img src={src} alt={t(item.name)} loading="lazy" className="w-full" />
          </a>
        ))}
        <p className="mt-5 text-lg leading-relaxed text-muted">{t(item.body)}</p>
        {item.facts && !item.factsBelow && (
          <dl className="mt-8 divide-y divide-ink/10 rounded-[1.5rem] bg-sand px-6">
            {item.facts.map((f, i) => (
              <div key={i} className="py-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">{t(f.label)}</dt>
                <dd className="mt-1 text-sm leading-relaxed">{t(f.value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="space-y-10 lg:col-span-7">
        {item.bullets && (
          <div>
            <h4 className="eyebrow mb-4">{item.suited ? t({ en: 'Highlights', zh: '项目特点' }) : t({ en: 'Benefits', zh: '功效' })}</h4>
            <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {t(item.bullets).map((b) => (
                <li key={b} className="flex items-start gap-2"><Check size={18} className="mt-0.5 shrink-0 text-gold" />{b}</li>
              ))}
            </ul>
          </div>
        )}
        {item.suited && (
          <div>
            <h4 className="eyebrow mb-3">{t({ en: 'Who it’s for', zh: '适合人群' })}</h4>
            <p className="leading-relaxed">{t(item.suited)}</p>
          </div>
        )}
        {item.packages && (
          <div className="grid gap-5 sm:grid-cols-2">
            {item.packages.map((pk, i) => (
              <div key={i} className="flex flex-col rounded-[1.5rem] border border-ink/10 p-6">
                <p className="font-display text-xl">{t(pk.name)}</p>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-4xl">{pk.price}</span>
                  <span className="text-sm text-muted line-through">{pk.was}</span>
                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs text-gold">{t(pk.tag)}</span>
                </p>
                <p className="mt-2 text-sm text-muted">{t(pk.perks).join(' · ')}</p>
                <ol className="mt-5 space-y-3">
                  {t(pk.steps).map((st, n) => (
                    <li key={st} className="flex gap-3 text-sm">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-xs text-ivory">{n + 1}</span>
                      <span className="pt-0.5 leading-relaxed">{st}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
        {item.steps && (
          <div>
            <h4 className="eyebrow mb-4">{t({ en: 'What to expect', zh: '护理流程' })}</h4>
            <ol className="space-y-4">
              {t(item.steps).map((st, i) => (
                <li key={st} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm text-ivory">{i + 1}</span>
                  <span className="pt-1 leading-relaxed">{st}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {item.facts && item.factsBelow && (
          <dl className="grid gap-4 sm:grid-cols-2">
            {item.facts.map((f, n) => (
              <div key={n} className="rounded-[1.5rem] bg-sand px-6 py-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">{t(f.label)}</dt>
                <dd className="mt-2 text-sm leading-relaxed">{t(f.value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </Reveal>
  )
}

function Treatment({ item, index }) {
  const { t } = useLang()
  const flip = index % 2 === 1

  if (!item.image) {
    return (
      <Reveal id={item.key} className={`scroll-mt-28 rounded-[2rem] bg-sand p-8 ${item.poster ? 'md:col-span-3' : ''}`}>
        <div className={item.poster ? 'grid items-center gap-8 md:grid-cols-2' : ''}>
          <div>
            <h3 className="font-display text-2xl">{t(item.name)}</h3>
            <p className="mt-3 leading-relaxed text-muted">{t(item.body)}</p>
            {item.more?.map((m, i) => <p key={i} className="mt-3 leading-relaxed text-muted">{t(m)}</p>)}
            {item.bullets && (
              <>
                <h4 className="eyebrow mb-3 mt-6">{t({ en: 'Highlights', zh: '项目特点' })}</h4>
                <ul className="space-y-2">
                  {t(item.bullets).map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-gold" />{b}</li>
                  ))}
                </ul>
              </>
            )}
            {item.suited && (
              <>
                <h4 className="eyebrow mb-2 mt-6">{t({ en: 'Who it’s for', zh: '适合人群' })}</h4>
                <p className="text-sm leading-relaxed">{t(item.suited)}</p>
              </>
            )}
            <div className="mt-6"><ConsultLink item={item} /></div>
          </div>
          {item.poster && (
            <a href={item.poster} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[1.5rem] bg-ivory">
              <img src={item.poster} alt={t(item.name)} loading="lazy" className="w-full" />
            </a>
          )}
        </div>
      </Reveal>
    )
  }

  return (
    <Reveal as="article" id={item.key} className="scroll-mt-28 grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16">
      <div className={`overflow-hidden rounded-[2rem] bg-sand ${flip ? 'lg:order-2' : ''}`}>
        <img src={t(item.image)} alt={t(item.name)} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      </div>
      <div>
        <span className="font-display text-sm text-gold">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="mt-2 font-display text-3xl font-light sm:text-4xl">{t(item.name)}</h3>
        <p className="mt-5 text-lg leading-relaxed text-muted">{t(item.body)}</p>
        {item.bullets && (
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {t(item.bullets).map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-gold" />{b}</li>
            ))}
          </ul>
        )}
        {item.steps && (
          <ol className="mt-6 space-y-3">
            {t(item.steps).map((s, i) => (
              <li key={s} className="flex gap-4 text-sm">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs text-ivory">{i + 1}</span>
                <span className="pt-1">{s}</span>
              </li>
            ))}
          </ol>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <ConsultLink item={item} />
          <Link to={`/faq#${encodeURIComponent(item.key)}`} className="inline-flex items-center gap-2 text-sm font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-gold">
            <MessageCircleQuestion size={16} /> {t(ui.readFaq)}
          </Link>
        </div>
      </div>
    </Reveal>
  )
}

export default function Category() {
  const { slug } = useParams()
  const { hash } = useLocation()
  const { t } = useLang()
  const cat = getCategory(slug)

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash, slug])

  if (!cat) return <NotFound />

  const idx = categories.indexOf(cat)
  const next = categories[(idx + 1) % categories.length]
  const detailed = cat.treatments.filter((x) => !x.image && (x.steps || x.packages || x.layout === 'detail'))
  const withImages = cat.treatments.filter((x) => x.image)
  const textOnly = cat.treatments.filter((x) => !x.image && !x.steps && !x.packages && x.layout !== 'detail')

  return (
    <>
      <PageHeader eyebrow={t(ui.nav.services)} title={t(cat.name)} intro={t(cat.intro)}>
        <div className="mt-8 flex flex-wrap gap-2">
          {cat.treatments.map((x) => (
            <span key={t(x.name)} className="rounded-full border border-ink/10 bg-ivory/70 px-4 py-1.5 text-sm">{t(x.name)}</span>
          ))}
        </div>
      </PageHeader>

      {cat.promo && (
        <div className="container-x pt-8">
          <p className="flex items-center justify-center gap-3 rounded-full bg-gold/15 px-6 py-4 text-center font-display text-xl text-ink sm:text-2xl">
            <Sparkles size={22} className="shrink-0 text-gold" /> {t(cat.promo)}
          </p>
        </div>
      )}

      <div className="container-x py-8">
        <Link to="/treatments" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} /> {t({ en: 'All treatments', zh: '全部服务' })}
        </Link>
      </div>

      {cat.artist && (
        <section className="container-x grid items-center gap-10 pb-12 md:grid-cols-12">
          <Reveal className="overflow-hidden rounded-[2rem] bg-sand md:col-span-5">
            <img src={cat.artist.image} alt={cat.artist.name} className="aspect-[4/5] w-full object-cover object-top" />
          </Reveal>
          <Reveal delay={100} className="md:col-span-7">
            <p className="eyebrow mb-3">{t(cat.artist.role ?? { en: 'Meet the artist', zh: '纹绣师' })}</p>
            <h2 className="font-display text-4xl font-light">{cat.artist.name}</h2>
            {cat.artist.bio && [].concat(t(cat.artist.bio)).map((para, i) => (
              <p key={i} className="mt-5 text-lg leading-relaxed text-muted">{para}</p>
            ))}
            {cat.artist.tags && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {t(cat.artist.tags).map((tag) => (
                  <li key={tag} className="rounded-full bg-sand px-4 py-1.5 text-sm text-ink">{tag}</li>
                ))}
              </ul>
            )}
          </Reveal>
        </section>
      )}

      <section className="container-x divide-y divide-ink/10">
        {withImages.map((item, i) => <Treatment key={i} item={item} index={i} />)}
        {detailed.map((item, i) => <Detail key={item.id} item={item} index={i} />)}
      </section>

      {textOnly.length > 0 && (
        <section className="container-x grid gap-5 pb-8 md:grid-cols-3">
          {textOnly.map((item, i) => <Treatment key={i} item={item} index={i} />)}
        </section>
      )}

      <section className="container-x pt-12">
        <Link to={`/treatments/${next.slug}`} className="group flex items-center justify-between rounded-[2rem] border border-ink/10 p-8 transition hover:border-ink">
          <div>
            <p className="text-sm text-muted">{t({ en: 'Next', zh: '下一项' })}</p>
            <p className="font-display text-2xl sm:text-3xl">{t(next.name)}</p>
          </div>
          <ArrowRight className="transition group-hover:translate-x-2" />
        </Link>
      </section>

      <CtaBand />
    </>
  )
}
