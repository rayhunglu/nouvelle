import { useLang } from '../i18n'

// Artist profile card (photo left when there is one, role / name / bio / tags right): used on the lash and brow pages and inside the Japanese face-slimming card.
export default function ArtistCard({ artist, className = '' }) {
  const { t } = useLang()
  return (
    <div className={`grid items-center gap-8 rounded-[2rem] bg-sand p-6 sm:p-8 ${artist.image ? 'md:grid-cols-12' : ''} ${className}`}>
      {artist.image && (
        <div className="overflow-hidden rounded-[1.5rem] bg-ivory md:col-span-4 lg:col-span-3">
          <img src={artist.image} alt={artist.name} loading="lazy" className="aspect-[4/5] w-full object-cover object-top" />
        </div>
      )}
      <div className={artist.image ? 'md:col-span-8 lg:col-span-9' : ''}>
        <p className="eyebrow mb-2">{t(artist.role ?? { en: 'Meet the artist', zh: '纹绣师' })}</p>
        <h4 className="font-display text-3xl font-light">{artist.name}</h4>
        {artist.bio && [].concat(t(artist.bio)).map((para, n) => (
          <p key={n} className="mt-4 leading-relaxed text-muted">{para}</p>
        ))}
        {artist.tags && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {t(artist.tags).map((tag) => (
              <li key={tag} className="rounded-full bg-ivory px-4 py-1.5 text-sm text-ink">{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
