'use client'

import { useState } from 'react'

export default function Footer() {
  const [newsletterMsg, setNewsletterMsg] = useState('Inscrivez-vous pour recevoir nos promos et nouveautés Chez Ramo.')

  const handleNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const input = e.currentTarget.querySelector('input')
    if (input?.value) {
      setNewsletterMsg('Merci, vous êtes inscrit !')
      input.value = ''
    }
  }

  return (
    <footer className="bg-[#F0E2BA] py-16 px-4" id="contact">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        <div>
          <h3 className="font-extrabold text-xl text-brand mb-4" style={{ fontFamily: 'var(--font-baloo)' }}>ADRESSE</h3>
          <div className="flex gap-4">
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80" alt="Restaurant" loading="lazy" className="w-20 h-20 object-cover rounded-2xl border-2 border-brand/20 flex-none" />
            <p className="text-sm leading-relaxed text-[#4C7A63]">
              32 Rue Pasteur,<br />01150 Lagnieu, France<br />
              <a href="https://maps.google.com/?q=32+Rue+Pasteur+Lagnieu" target="_blank" rel="noopener noreferrer" className="text-[#C8412F] hover:underline inline-flex items-center gap-1">
                Itinéraire <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-extrabold text-xl text-brand mb-4" style={{ fontFamily: 'var(--font-baloo)' }}>ABOUT US</h3>
          <p className="text-sm leading-relaxed text-[#4C7A63]">Chez Ramo, c'est la broche qui tourne depuis des années rue Pasteur à Lagnieu. Kebabs généreux, sauces secrètes et spécialités balkaniques — une adresse incontournable de la région.</p>
        </div>

        <div>
          <h3 className="font-extrabold text-xl text-brand mb-4" style={{ fontFamily: 'var(--font-baloo)' }}>CONTACT US</h3>
          <form onSubmit={handleNewsletter} className="flex gap-2 mb-4">
            <input type="email" placeholder="Join our email list" required className="flex-1 min-w-0 px-4 py-3.5 rounded-full border-2 border-brand bg-transparent text-sm text-brand placeholder:text-[#A0A0A0] focus:outline-none focus:border-brand" />
            <button type="submit" className="px-5 py-3.5 rounded-full border-2 border-brand bg-brand text-cream text-xs font-bold uppercase tracking-wider hover:bg-accent hover:text-brand transition">OK</button>
          </form>
          <p className="text-sm text-[#4C7A63] mb-3">{newsletterMsg}</p>
          <div className="space-y-2 text-sm">
            <span className="flex items-center gap-3 text-[#4C7A63]">
              <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              04 27 50 00 62
            </span>
            <span className="flex items-center gap-3 text-[#4C7A63]">
              <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              contact@chezramo.fr
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-brand/20 text-center text-xs tracking-[.1em] uppercase text-[#8A8A8A]">
        © 2026 Chez Ramo · 32 Rue Pasteur, 01150 Lagnieu · Mentions légales
      </div>
    </footer>
  )
}
