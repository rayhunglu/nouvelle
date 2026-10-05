import Reveal from './Reveal'

export default function PageHeader({ eyebrow, title, intro, children }) {
  return (
    <section className="relative overflow-hidden bg-sand pb-16 pt-36 sm:pb-20 sm:pt-44">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-rose/60 blur-3xl" />
      <div className="container-x relative">
        <Reveal>
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className="max-w-3xl font-display text-4xl font-light leading-[1.1] sm:text-6xl">{title}</h1>
          {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  )
}
