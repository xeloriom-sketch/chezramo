const cards = [
  {
    num: '1', side: 'left',
    icon: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
    title: 'VIANDE FRAÎCHE',
    desc: 'Broche artisanale tournée toute la journée, viande sélectionnée et tranchée à la minute pour vous.',
  },
  {
    num: '2', side: 'left',
    icon: <><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 0 1-7 7"/></>,
    title: 'SAUCES MAISON',
    desc: 'Curry, harissa, blanche, algérienne… toutes nos sauces sont préparées sur place chaque jour.',
  },
  {
    num: '3', side: 'right',
    icon: <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="10" cy="18" r="2"/></>,
    title: 'COMPOSEZ LE VÔTRE',
    desc: 'Choisissez votre viande, votre pain ou galette, vos sauces et vos suppléments.',
  },
  {
    num: '4', side: 'right',
    icon: <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 3h6"/><path d="M12 3v2"/></>,
    title: 'SERVI À LA MINUTE',
    desc: 'Chaque kebab tranché et grillé à la commande — sur place ou à emporter, toujours chaud.',
  },
]

export default function DifferenceSection() {
  const leftCards  = cards.filter(c => c.side === 'left')
  const rightCards = cards.filter(c => c.side === 'right')

  return (
    <section className="relative bg-brand pt-0 overflow-hidden" id="about">
      <div className="absolute inset-0 pattern-bg" />

      <div className="relative -mx-4 h-[220px] md:h-[clamp(200px,28vw,360px)] mb-10 md:mb-0">
        <div className="absolute -top-0.5 left-0 right-0 h-[200px] md:h-[44%] bg-cream rounded-b-[240px] md:rounded-b-[120px]" />
        <div className="absolute left-[-6%] top-[40%] md:top-[18%] w-[26%] aspect-square rounded-full bg-cream" />
        <div className="absolute left-[10%] top-[45%] md:top-[6%] w-[34%] aspect-square rounded-full bg-cream" />
        <div className="absolute left-[32%] top-[38%] md:top-0 w-[38%] aspect-square rounded-full bg-cream" />
        <div className="absolute right-[10%] top-[45%] md:top-[6%] w-[34%] aspect-square rounded-full bg-cream" />
        <div className="absolute right-[-6%] top-[40%] md:top-[18%] w-[26%] aspect-square rounded-full bg-cream" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
          <h2 className="font-extrabold text-[clamp(32px,8vw,80px)] leading-[1.02] text-brand max-w-10xl mt-0 md:mt-40 mx-auto" style={{ fontFamily: 'var(--font-baloo)' }}>
            CE QUI REND<br />CHEZ RAMO UNIQUE ?
          </h2>
          <p className="mt-2 md:mt-4 max-w-xl text-sm sm:text-xl leading-relaxed">
            Une broche artisanale qui tourne toute la journée, des sauces préparées sur place, et une équipe passionnée qui ne transige pas sur la qualité.
          </p>
        </div>
      </div>

      <div className="relative max-w-9xl mx-auto px-4 md:px-24 md:-mt-10 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center py-4">
        <div className="mt-0 md:mt-[15vw] flex flex-col space-y-6 md:space-y-40 z-10">
          {leftCards.map(card => (
            <DiffCard key={card.num} card={card} />
          ))}
        </div>

        <div className="flex items-center justify-center my-0 diff-burger-wrap">
          <picture>
            <source srcSet="/uploads/lucid-origin_A_award-winning_professional_studio_food_photography_of_a_gourmet_luxury_kebab._-0.webp" type="image/webp" />
            <img
              src="/uploads/lucid-origin_A_award-winning_professional_studio_food_photography_of_a_gourmet_luxury_kebab._-0.png"
              alt="Kebab gourmet artisanal Chez Ramo — meilleur kebab Lagnieu"
              loading="lazy"
              className="w-full max-w-[340px] md:w-[clamp(350px,50vw,750px)] md:max-w-none h-auto object-contain mx-auto diff-burger"
            />
          </picture>
        </div>

        <div className="mt-0 md:mt-[15vw] flex flex-col space-y-6 md:space-y-40 z-10">
          {rightCards.map(card => (
            <DiffCard key={card.num} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}

function DiffCard({ card }: { card: typeof cards[0] }) {
  const isLeft = card.side === 'left'
  return (
    <div className="relative bg-[#1E4D3A] rounded-2xl p-5 shadow-md border border-white/5">
      <span className={`absolute -top-3 ${isLeft ? '-right-3' : '-left-3'} w-8 h-8 rounded-full bg-[#EBE5C2] text-[#1E4D3A] text-sm font-bold flex items-center justify-center shadow-sm`}>
        {card.num}
      </span>
      <h3 className="flex items-center gap-3 text-sm font-bold tracking-[.08em] uppercase text-[#EBE5C2]">
        <svg className="w-5 h-5 text-[#EBE5C2] flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {card.icon}
        </svg>
        {card.title}
      </h3>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#EBE5C2]/80">{card.desc}</p>
    </div>
  )
}
