const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export default function Hero() {
  const marqueeItems = [
    'KEBAB','FRITES FRAÎCHES','SAUCES SECRÈTES','DURUM DORÉ',
    'BROCHE ARTISANALE','TACOS 2 VIANDES','HALAL CERTIFIÉ','FAIT À LA MINUTE',
  ]

  return (
    <section className="relative bg-brand pt-36 pb-0 overflow-hidden hero-section" aria-label="Chez Ramo — Restaurant kebab tacos à Lagnieu">
      <div className="absolute inset-0 pattern-bg" />
      {/* Texte sémantique pour le SEO — visible par les moteurs, intégré au design */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <h1
          className="hero-h1 font-extrabold leading-[0.88] tracking-[.01em] text-[#1E4D3A] [paint-order:stroke_fill] drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)]"
          style={{ fontFamily: 'var(--font-baloo)' }}
        >
          <span className="hero-word block text-[clamp(52px,11vw,140px)]" style={{ animationDelay: '0ms' }}>TERRIBLEMENT</span>
          <span className="hero-word block text-[clamp(52px,11vw,140px)]" style={{ animationDelay: '180ms' }}>BON.</span>
        </h1>

        <p className="sr-only" aria-label="Restaurant kebab tacos Lagnieu">
          Kebab · Tacos · Burgers — Lagnieu, Ain
        </p>

        <div className="relative max-w-3xl mx-auto -mt-[3vw] z-20">
          <picture>
            <source srcSet={`${BASE}/uploads/pasted-1785851492914-0.webp`} type="image/webp" />
            <img
              src={`${BASE}/uploads/pasted-1785851492914-0.png`}
              alt="Kebab halal maison — Chez Ramo restaurant Lagnieu"
              loading="eager"
              fetchPriority="high"
              width={776}
              height={1000}
              className="w-[clamp(280px,38vw,520px)] mx-auto hero-burger"
            />
          </picture>
        </div>
      </div>

      {/* wave */}
      <div className="relative z-0 h-[220px] md:h-[100px] -mt-[210px] md:-mt-[90px] pointer-events-none">
        <div className="absolute left-[-24px] bottom-0 h-[200px] md:h-[80px] bg-cream rounded-[240px_240px_0_0] md:rounded-[120px_120px_0_0] w-[calc(100%+48px)]" />
        <div className="absolute left-[-6%] bottom-[40%] md:bottom-[10%] w-[26%] aspect-square rounded-full bg-cream" />
        <div className="absolute left-[10%] bottom-[45%] md:bottom-0 w-[34%] aspect-square rounded-full bg-cream" />
        <div className="absolute left-[32%] bottom-[38%] md:bottom-[-4%] w-[38%] aspect-square rounded-full bg-cream" />
        <div className="absolute right-[10%] bottom-[45%] md:bottom-0 w-[34%] aspect-square rounded-full bg-cream" />
        <div className="absolute right-[-6%] bottom-[40%] md:bottom-[10%] w-[26%] aspect-square rounded-full bg-cream" />
      </div>

      {/* marquee */}
      <div className="relative z-10 bg-accent border-y-3 border-brand py-5 overflow-hidden -mt-[6vw]">
        <div className="flex w-max animate-marquee">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-8 sm:gap-14 pr-8 sm:pr-14 font-extrabold text-2xl sm:text-4xl text-brand whitespace-nowrap" style={{ fontFamily: 'var(--font-baloo)' }} aria-hidden={i === 2 ? 'true' : undefined}>
              {marqueeItems.map(text => (
                <span key={text} className="flex items-center gap-3 sm:gap-4">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 fill-brand" viewBox="0 0 16 16"><path d="M8 0l2.5 5.5L16 8l-5.5 2.5L8 16l-2.5-5.5L0 8l5.5-2.5z"/></svg>
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
