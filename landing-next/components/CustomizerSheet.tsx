'use client'

import { useStore } from '@/lib/store'
import { SAUCES, REMOVABLES, DRINKS } from '@/lib/constants'

export default function CustomizerSheet() {
  const {
    customizer, closeCustomizer, confirmCustomizer,
    custMode, setCustMode, custDrink, setCustDrink,
    custSauces, toggleSauce, sauceExtra,
    custRemovals, toggleRemoval,
    custQty, setCustQty, custUnitPrice,
    money,
  } = useStore()

  if (!customizer) return null

  const unitPrice = custUnitPrice()

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div onClick={() => closeCustomizer()} className="absolute inset-0 bg-brand/60 backdrop-blur-sm" />

      <div className="relative w-full sm:w-[min(500px,96vw)] bg-cream shadow-2xl rounded-t-[2rem] sm:rounded-3xl anim-sheet-up overflow-y-auto" style={{ maxHeight: '92vh', WebkitOverflowScrolling: 'touch' }}>
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-brand/25" />
        </div>

        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-2 sm:pt-6 safe-pb2">
          {/* header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[.18em] uppercase text-[#8A8A8A]">Personnaliser</p>
              <h3 className="font-extrabold text-2xl leading-tight mt-0.5" style={{ fontFamily: 'var(--font-baloo)' }}>{customizer.name}</h3>
              <p className="text-xs text-[#8A8A8A] mt-0.5">À partir de {money(customizer.price)}</p>
            </div>
            <button onClick={() => closeCustomizer()} className="shrink-0 w-9 h-9 rounded-full border-2 border-brand hover:bg-accent transition flex items-center justify-center mt-1">
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Seul / Menu */}
          {customizer.menuPrice > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-bold tracking-[.18em] uppercase text-[#8A8A8A] mb-3">Format</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setCustMode('seul'); setCustDrink('') }}
                  className={`py-4 rounded-2xl border-2 border-brand font-extrabold transition-all ${custMode === 'seul' ? 'bg-brand text-cream shadow-md' : 'bg-transparent text-brand'}`}
                  style={{ fontFamily: 'var(--font-baloo)' }}
                >
                  <span className="block text-base">SEUL</span>
                  <span className="block text-xs mt-0.5 opacity-80">{money(customizer.price)}</span>
                </button>
                <button
                  onClick={() => { setCustMode('menu'); if (!custDrink) setCustDrink('Coca-Cola') }}
                  className={`relative py-4 rounded-2xl border-2 border-brand font-extrabold transition-all ${custMode === 'menu' ? 'bg-brand text-cream shadow-md' : 'bg-transparent text-brand'}`}
                  style={{ fontFamily: 'var(--font-baloo)' }}
                >
                  <span className="block text-base">MENU</span>
                  <span className="block text-xs mt-0.5 opacity-80">{money(customizer.menuPrice)}</span>
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-accent text-brand whitespace-nowrap">
                    + FRITES + BOISSON
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Boisson */}
          {customizer.menuPrice > 0 && custMode === 'menu' && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[10px] font-bold tracking-[.18em] uppercase text-[#8A8A8A]">Boisson</p>
                <span className="text-[10px] text-[#1E4D3A]/60">Incluse dans le menu</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {DRINKS.map(drink => (
                  <button
                    key={drink}
                    onClick={() => setCustDrink(drink)}
                    className={`pill-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-widest transition-all duration-150 flex items-center gap-1 ${
                      custDrink === drink
                        ? 'bg-[#1E4D3A] border-[#1E4D3A] text-[#F5ECD9] scale-105 shadow-md'
                        : 'bg-transparent border-[#1E4D3A]/40 text-[#1E4D3A] hover:border-[#1E4D3A] hover:scale-[1.03]'
                    }`}
                  >
                    {custDrink === drink && (
                      <svg className="w-3 h-3 text-[#F5ECD9] shrink-0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {drink}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sauces */}
          {customizer.hasSauce && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold tracking-[.18em] uppercase text-[#8A8A8A]">Sauces</p>
                  {custSauces.length > 0 && (
                    <span className="text-[10px] font-extrabold bg-brand text-cream px-2 py-0.5 rounded-full">{custSauces.length}</span>
                  )}
                </div>
                <div className="text-right">
                  {custSauces.length <= 2
                    ? <span className="text-[10px] text-[#8A8A8A]">2 offertes · 3ème +1,00 €</span>
                    : <span className="text-[10px] font-bold text-[#C8412F]">+{sauceExtra()},00 € (sauce{sauceExtra() > 1 ? 's sup.)' : ' sup.)'}</span>
                  }
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAUCES.map(sauce => (
                  <button
                    key={sauce}
                    onClick={() => toggleSauce(sauce)}
                    className={`pill-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-widest transition-all duration-150 flex items-center gap-1 ${
                      custSauces.includes(sauce)
                        ? 'bg-accent border-accent text-brand scale-105 shadow-md'
                        : 'bg-transparent border-brand/50 text-brand hover:border-brand hover:scale-[1.03]'
                    }`}
                  >
                    {custSauces.includes(sauce) && (
                      <svg className="w-3 h-3 text-brand shrink-0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {sauce}
                  </button>
                ))}
              </div>
              {custSauces.length > 0 && (
                <div className="mt-3 px-4 py-2.5 rounded-2xl bg-brand/[0.08] border border-brand/20 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A] shrink-0">Choisies :</span>
                  <span className="text-xs font-bold text-brand">{custSauces.join(' · ')}</span>
                </div>
              )}
            </div>
          )}

          {/* Enlever */}
          {customizer.hasCrudites && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[10px] font-bold tracking-[.18em] uppercase text-[#8A8A8A]">Enlever</p>
                <span className="text-[10px] text-[#1E4D3A]/60">Ingrédients à retirer</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {REMOVABLES.map(ingr => (
                  <button
                    key={ingr}
                    onClick={() => toggleRemoval(ingr)}
                    className={`pill-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-widest transition-all duration-150 flex items-center gap-1 ${
                      custRemovals.includes(ingr)
                        ? 'bg-[#C8412F] border-[#C8412F] text-cream scale-105 shadow-md'
                        : 'bg-transparent border-brand/40 text-brand hover:border-brand hover:scale-[1.03]'
                    }`}
                  >
                    {custRemovals.includes(ingr) && (
                      <svg className="w-3 h-3 text-cream shrink-0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    )}
                    Sans {ingr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantité */}
          <div className="mb-7 flex items-center justify-between py-4 border-t border-b border-brand/15">
            <p className="text-sm font-bold text-brand tracking-wide">Quantité</p>
            <div className="flex items-center gap-5">
              <button onClick={() => setCustQty(Math.max(1, custQty - 1))} className="w-11 h-11 rounded-full border-2 border-brand text-xl font-bold flex items-center justify-center hover:bg-accent transition active:scale-90">–</button>
              <span className="font-extrabold text-2xl w-8 text-center" style={{ fontFamily: 'var(--font-baloo)' }}>{custQty}</span>
              <button onClick={() => setCustQty(custQty + 1)} className="w-11 h-11 rounded-full bg-brand text-cream text-xl font-bold flex items-center justify-center hover:bg-accent hover:text-brand transition active:scale-90">+</button>
            </div>
          </div>

          <button
            onClick={() => confirmCustomizer()}
            className="w-full py-4 rounded-full bg-brand text-cream font-extrabold text-base uppercase tracking-widest hover:bg-accent hover:text-brand transition-all btn-hover-scale shadow-lg active:scale-95 flex items-center justify-center gap-2"
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            <span>Ajouter au panier</span>
            <span className="opacity-80">— {money(unitPrice * custQty)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
