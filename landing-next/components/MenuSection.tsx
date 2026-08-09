'use client'

import { useEffect } from 'react'
import { useStore, categoryItems, fmtPrice, itemHasSauce, parseMenuPrice } from '@/lib/store'

const CATEGORIES = [
  {
    id: 'kebab',
    label: 'KEBAB & GALETTES',
    icon: 'https://img.icons8.com/ios/100/1E4D3A/burrito.png',
    cats: ['Sandwichs Vedettes','Nos Spécialités','Tradition & Galettes'],
    img: '/uploads/Kebab.webp',
    imgAlt: 'Kebab',
    featuredName: 'Kebab', featuredPrice: 9, featuredMenuPrice: 12,
    desc: 'Pain rond, veau de broche tranché minute, crudités fraîches, sauce au choix. Seul 9 € — Menu 12 €',
  },
  {
    id: 'tacos',
    label: 'TACOS',
    icon: 'https://img.icons8.com/ios/100/1E4D3A/taco.png',
    cats: ['Tacos'],
    img: '/uploads/Tacos.webp',
    imgAlt: 'Tacos',
    featuredName: 'Tacos', featuredPrice: 10, featuredMenuPrice: 13,
    desc: 'Viande au choix, sauce et frites incluses. Format Maxi avec 2 viandes disponible.',
  },
  {
    id: 'burgers',
    label: 'BURGERS & FINGER FOOD',
    icon: 'https://img.icons8.com/ios/100/1E4D3A/hamburger.png',
    cats: ['Burgers','Finger Food'],
    img: '/uploads/Cheese Burger.webp',
    imgAlt: 'Burger',
    featuredName: 'Chicken Burger', featuredPrice: 6, featuredMenuPrice: 9,
    desc: 'Poulet croustillant, cheddar fondant, sauce maison. Menu burger +3 € (frites + boisson).',
  },
  {
    id: 'assiettes',
    label: 'ASSIETTES GOURMET',
    icon: 'https://img.icons8.com/ios/100/1E4D3A/french-fries.png',
    cats: ['Assiettes Gourmet','Assiettes Gourmet (Suite)','Assiettes & Salade'],
    img: '/uploads/Assiette Escalope.png',
    imgAlt: 'Assiette Mixte',
    featuredName: 'Assiette Mixte', featuredPrice: 18, featuredMenuPrice: 0,
    desc: 'Kebab + 2 viandes au choix. Frites, blé et crudités fraîches du jour inclus dans toutes les assiettes.',
  },
  {
    id: 'plats',
    label: 'PLATS MAISON & QOFTE',
    icon: 'https://img.icons8.com/ios/100/1E4D3A/poultry-leg.png',
    cats: ['Plats Maison','Qofte Grillées','Burek & Spécialités'],
    img: '/uploads/Qofte_x7.webp',
    imgAlt: 'Qofte',
    featuredName: 'Qofte ×7', featuredPrice: 11, featuredMenuPrice: 0,
    desc: '7 boulettes grillées maison. Frites, fromage, tomate, concombre et sauce blanche.',
  },
  {
    id: 'salades',
    label: 'SALADES & BUREK',
    icon: 'https://img.icons8.com/ios/100/1E4D3A/salad.png',
    cats: ['Salades Fraîches','Salades & Burek'],
    img: '/uploads/Salade du Berger.webp',
    imgAlt: 'Salade',
    featuredName: 'Salade du Berger', featuredPrice: 10, featuredMenuPrice: 0, hasSauce: false,
    desc: 'Salades fraîches du jour. Burek feuilleté fait maison — fromage, épinards ou viande.',
  },
  {
    id: 'drinks',
    label: 'DESSERTS & BOISSONS',
    icon: 'https://img.icons8.com/ios/100/1E4D3A/cake.png',
    cats: ['Desserts','Menu Enfants','Accompagnements & Sauces','Boissons & Boissons Chaudes'],
    img: '/uploads/Trilece.webp',
    imgAlt: 'Trilece',
    featuredName: 'Trilece', featuredPrice: 3.5, featuredMenuPrice: 0, hasSauce: false,
    desc: 'Douceurs maison, sodas, eaux et boissons chaudes. Menu Enfant disponible au choix.',
  },
]

export default function MenuSection() {
  const { openCategory, toggleCategory, menuData, setMenuData, openCustomizer } = useStore()

  useEffect(() => {
    fetch('https://hqfewokpvjmxezhnurbm.supabase.co/rest/v1/menu_items?order=sort_order', {
      headers: {
        'apikey': 'sb_publishable_NmIfxaQb5ncapzCtzI5uNQ_tHdCwAyc',
        'Authorization': 'Bearer sb_publishable_NmIfxaQb5ncapzCtzI5uNQ_tHdCwAyc',
      },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMenuData(data.map((item: Record<string,unknown>) => ({
            title: String(item.title ?? ''),
            price: String(item.price ?? ''),
            category: String(item.category ?? ''),
            menu_price: String(item.menu_price ?? item.menuPrice ?? ''),
            description: String(item.description ?? item.desc ?? ''),
          })))
        }
      })
      .catch(() => {})
  }, [setMenuData])

  const ArrowIcon = () => (
    <svg className="w-7 h-7 shrink-0 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/>
    </svg>
  )

  return (
    <section className="bg-[#F0E2BA] pb-24 pt-20 px-4" id="menu-full">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="font-extrabold text-[clamp(28px,4.5vw,56px)] text-brand uppercase tracking-tight leading-none" style={{ fontFamily: 'var(--font-baloo)' }}>
          NOTRE CARTE
        </h2>
        <p className="mt-3 max-w-lg mx-auto text-sm leading-relaxed text-brand/60">
          Kebabs, galettes, tacos, burgers, plats maison, salades, burek, desserts — viande halal certifiée.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {CATEGORIES.map((cat, catIdx) => {
          const isOpen = openCategory === cat.id
          const prevId = catIdx > 0 ? CATEGORIES[catIdx - 1].id : null
          const nextId = catIdx < CATEGORIES.length - 1 ? CATEGORIES[catIdx + 1].id : null
          const showHr = !isOpen && openCategory !== prevId && openCategory !== nextId && catIdx > 0

          return (
            <div key={cat.id}>
              {showHr && <hr className="border-t border-brand/35" />}

              <div className={isOpen ? 'rounded-2xl overflow-hidden my-4' : ''}>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center justify-between text-brand transition ${
                    isOpen
                      ? 'bg-accent py-5 px-6 font-extrabold text-2xl md:text-3xl tracking-wide'
                      : 'py-5 px-2 font-extrabold text-2xl md:text-3xl tracking-wide hover:opacity-70 group'
                  }`}
                  style={{ fontFamily: 'var(--font-baloo)' }}
                >
                  <div className="flex items-center gap-5">
                    <img src={cat.icon} alt="" loading="lazy" className={`w-12 h-12 object-contain shrink-0 ${!isOpen ? 'group-hover:scale-110 transition-transform' : ''}`} />
                    <span dangerouslySetInnerHTML={{ __html: cat.label.replace(/&/g, '&amp;') }} />
                  </div>
                  <span className={`${isOpen ? 'rotate-90' : !isOpen ? 'group-hover:translate-x-1' : ''} transition-transform duration-300`}>
                    <ArrowIcon />
                  </span>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[4000px]' : 'max-h-0'}`}>
                  <div className="pt-6 pb-4 px-2 md:px-3 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
                    {/* Featured image card */}
                    <div
                      className="md:col-span-4 bg-brand rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                      onClick={() => openCustomizer(cat.featuredName, cat.featuredPrice, cat.featuredMenuPrice, cat.hasSauce !== false)}
                    >
                      <div className="bg-[#F0E2BA] flex items-end justify-center h-56 overflow-hidden">
                        <img src={cat.img} alt={cat.imgAlt} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-5 text-center">
                        <h3 className="font-extrabold text-sm uppercase tracking-[.15em] text-cream mb-2" style={{ fontFamily: 'var(--font-baloo)' }}>INGRÉDIENTS</h3>
                        <p className="text-sm leading-relaxed text-cream mb-4">{cat.desc}</p>
                        <div className="w-full bg-cream text-brand font-extrabold text-xs uppercase tracking-wider py-3 rounded-full">AJOUTER AU PANIER</div>
                      </div>
                    </div>

                    {/* Item list */}
                    <div className="md:col-span-8">
                      {categoryItems(menuData, cat.cats).map((item, idx) => (
                        <div key={item.title} className={`flex justify-between items-start gap-3 ${idx === 0 ? 'pb-3' : 'py-3 border-t border-brand/20'}`}>
                          <div>
                            <h2 className="font-black text-base md:text-lg text-brand uppercase" style={{ fontFamily: 'var(--font-baloo)' }}>{item.title}</h2>
                            <p className="text-xs text-brand/55 mt-0.5">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-black text-lg text-brand tabular-nums" style={{ fontFamily: 'var(--font-baloo)' }}>{fmtPrice(item.price)}</span>
                            <button
                              onClick={() => openCustomizer(item.title, parseMenuPrice(item.price), parseMenuPrice(item.menu_price), itemHasSauce(item.category))}
                              className="w-8 h-8 rounded-full bg-brand text-cream font-bold hover:bg-brand/75 transition flex items-center justify-center"
                            >+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
