'use client'

import { useStore } from '@/lib/store'
import { BASE } from '@/lib/basePath'

const Stars = ({ color = 'text-accent' }: { color?: string }) => (
  <div className={`flex justify-center gap-0.5 mt-4 ${color}`}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
  </div>
)

export default function BestSellers() {
  const { openCustomizer } = useStore()

  return (
    <section className="bg-[#F0E2BA] py-16 sm:py-24 px-4" id="menu">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-extrabold text-[clamp(30px,4vw,52px)] text-brand" style={{ fontFamily: 'var(--font-baloo)' }}>
              LES PLUS COMMANDÉS
            </h2>
            <p className="mt-3 max-w-md text-sm sm:text-base leading-relaxed text-[#5A5A5A]">
              Les trois incontournables que nos clients commandent tous les jours. Ajoutez-les au panier en un clic.
            </p>
          </div>
          <a href="#menu-full" className="px-6 py-3.5 rounded-full border-2 border-brand text-xs font-bold uppercase tracking-widest hover:bg-brand hover:text-cream transition magnetic">
            Voir la carte
          </a>
        </div>

        <div className="mt-20 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20 sm:gap-8">
          {/* Kebab */}
          <div className="relative pt-4 pb-6 px-5 rounded-3xl bg-brand text-cream text-center reveal-stagger card-lift" style={{ '--stagger-delay': '0ms' } as React.CSSProperties}>
            <picture>
              <source srcSet={`${BASE}/uploads/lucid-origin_A_award-winning_professional_studio_food_photography_of_a_gourmet_luxury_kebab._-0.webp`} type="image/webp" />
              <img src={`${BASE}/uploads/lucid-origin_A_award-winning_professional_studio_food_photography_of_a_gourmet_luxury_kebab._-0.png`} alt="Kebab halal broche artisanale Chez Ramo Lagnieu" loading="lazy" width={420} height={280} className="bs-img w-[90%] h-56 sm:h-64 object-cover mx-auto -mt-16 sm:-mt-20" />
            </picture>
            <Stars />
            <h3 className="font-extrabold text-2xl mt-2" style={{ fontFamily: 'var(--font-baloo)' }}>LE KEBAB</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream/70 min-h-[52px]">Pain rond, veau de broche, crudités fraîches, sauce au choix</p>
            <p className="font-extrabold text-2xl mt-3" style={{ fontFamily: 'var(--font-baloo)' }}>9,00 €</p>
            <button onClick={() => openCustomizer('Kebab', 9, 12)} className="w-full mt-4 py-4 rounded-full bg-cream text-brand text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-brand transition btn-hover-scale">
              Ajouter au panier
            </button>
          </div>

          {/* Galette */}
          <div className="relative pt-4 pb-6 px-5 rounded-3xl bg-accent text-brand text-center reveal-stagger card-lift" style={{ '--stagger-delay': '130ms' } as React.CSSProperties}>
            <picture>
              <source srcSet={`${BASE}/uploads/lucid-origin_An_ultra-realistic_close-up_panoramic_photograph_of_a_steaming_premium_kebab_dur-0.webp`} type="image/webp" />
              <img src={`${BASE}/uploads/lucid-origin_An_ultra-realistic_close-up_panoramic_photograph_of_a_steaming_premium_kebab_dur-0.png`} alt="Galette durum kebab Chez Ramo Lagnieu" loading="lazy" width={420} height={280} className="bs-img w-[90%] h-56 sm:h-64 object-cover mx-auto -mt-16 sm:-mt-20" />
            </picture>
            <Stars color="text-brand" />
            <h3 className="font-extrabold text-2xl mt-2" style={{ fontFamily: 'var(--font-baloo)' }}>LA GALETTE</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand/70 min-h-[52px]">Fine galette roulée, veau de broche, crudités fraîches, sauce au choix</p>
            <p className="font-extrabold text-2xl mt-3" style={{ fontFamily: 'var(--font-baloo)' }}>9,00 €</p>
            <button onClick={() => openCustomizer('Galette', 9, 12)} className="w-full mt-4 py-4 rounded-full bg-brand text-cream text-xs font-bold uppercase tracking-widest hover:bg-cream hover:text-brand transition btn-hover-scale">
              Ajouter au panier
            </button>
          </div>

          {/* Tacos */}
          <div className="relative pt-4 pb-6 px-5 rounded-3xl bg-[#C8412F] text-cream text-center reveal-stagger card-lift" style={{ '--stagger-delay': '260ms' } as React.CSSProperties}>
            <picture>
              <source srcSet={`${BASE}/uploads/gpt-image-2_A_high-resolution_commercial_food_photograph_of_a_massive_perfectly_rectangular--0.webp`} type="image/webp" />
              <img src={`${BASE}/uploads/gpt-image-2_A_high-resolution_commercial_food_photograph_of_a_massive_perfectly_rectangular--0.png`} alt="Tacos maison Chez Ramo Lagnieu" loading="lazy" width={420} height={280} className="bs-img w-[90%] h-56 sm:h-64 object-cover mx-auto -mt-16 sm:-mt-20" />
            </picture>
            <Stars />
            <h3 className="font-extrabold text-2xl mt-2" style={{ fontFamily: 'var(--font-baloo)' }}>TACOS</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream/70 min-h-[52px]">Viande au choix, frites incluses, sauce fromagère</p>
            <p className="font-extrabold text-2xl mt-3" style={{ fontFamily: 'var(--font-baloo)' }}>10,00 €</p>
            <button onClick={() => openCustomizer('Tacos', 10, 13)} className="w-full mt-4 py-4 rounded-full bg-cream text-brand text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-brand transition btn-hover-scale">
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
