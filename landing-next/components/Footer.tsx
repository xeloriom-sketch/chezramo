'use client'

import { useState } from 'react'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

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

        {/* Adresse — balisée schema.org pour les moteurs */}
        <div>
          <h3 className="font-extrabold text-xl text-brand mb-4" style={{ fontFamily: 'var(--font-baloo)' }}>ADRESSE</h3>
          <div className="flex gap-4" itemScope itemType="https://schema.org/Restaurant">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80"
              alt="Restaurant Chez Ramo Lagnieu"
              loading="lazy"
              width={80} height={80}
              className="w-20 h-20 object-cover rounded-2xl border-2 border-brand/20 flex-none"
            />
            <address
              className="not-italic text-sm leading-relaxed text-[#4C7A63]"
              itemProp="address"
              itemScope
              itemType="https://schema.org/PostalAddress"
            >
              <span itemProp="streetAddress">32 Rue Pasteur</span>,<br />
              <span itemProp="postalCode">01150</span>{' '}
              <span itemProp="addressLocality">Lagnieu</span>,{' '}
              <span itemProp="addressRegion">Ain</span>,{' '}
              <span itemProp="addressCountry">France</span>
              <br />
              <a
                href="https://maps.google.com/?q=32+Rue+Pasteur+01150+Lagnieu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C8412F] hover:underline inline-flex items-center gap-1 mt-1"
              >
                Itinéraire
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </address>
          </div>

          {/* Horaires */}
          <div className="mt-4 text-sm text-[#4C7A63] space-y-1">
            <p className="font-bold text-brand text-xs uppercase tracking-wider mb-2">Horaires · Lun – Sam</p>
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Midi : <strong>11h00 – 14h30</strong>
            </p>
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Soir : <strong>18h00 – 22h30</strong>
            </p>
          </div>
        </div>

        {/* À propos */}
        <div>
          <h3 className="font-extrabold text-xl text-brand mb-4" style={{ fontFamily: 'var(--font-baloo)' }}>CHEZ RAMO</h3>
          <p className="text-sm leading-relaxed text-[#4C7A63]">
            Le meilleur kebab halal de Lagnieu (Ain). Depuis notre cuisine rue Pasteur, nous préparons chaque jour des kebabs généreux, galettes, tacos et spécialités balkaniques — broche artisanale, sauces préparées sur place, ingrédients frais.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Halal ✓', 'Artisanal ✓', 'Commande en ligne ✓'].map(tag => (
              <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand px-3 py-1.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-extrabold text-xl text-brand mb-4" style={{ fontFamily: 'var(--font-baloo)' }}>CONTACT</h3>
          <form onSubmit={handleNewsletter} className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder="Votre email"
              required
              className="flex-1 min-w-0 px-4 py-3.5 rounded-full border-2 border-brand bg-transparent text-sm text-brand placeholder:text-[#A0A0A0] focus:outline-none focus:border-brand"
            />
            <button type="submit" className="px-5 py-3.5 rounded-full border-2 border-brand bg-brand text-cream text-xs font-bold uppercase tracking-wider hover:bg-accent hover:text-brand transition">OK</button>
          </form>
          <p className="text-sm text-[#4C7A63] mb-4">{newsletterMsg}</p>
          <div className="space-y-2.5 text-sm">
            {/* Phone — clickable (important pour mobile + local SEO) */}
            <a
              href="tel:+33427500062"
              className="flex items-center gap-3 text-[#4C7A63] hover:text-brand transition-colors group"
              itemProp="telephone"
            >
              <svg className="w-4 h-4 text-brand shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="group-hover:underline">04 27 50 00 62</span>
            </a>
            {/* Email — clickable */}
            <a
              href="mailto:contact@chezramo.fr"
              className="flex items-center gap-3 text-[#4C7A63] hover:text-brand transition-colors group"
              itemProp="email"
            >
              <svg className="w-4 h-4 text-brand shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span className="group-hover:underline">contact@chezramo.fr</span>
            </a>
          </div>

          {/* Social links */}
          <div className="mt-4 flex gap-3">
            <a href="https://www.facebook.com/chezramolagnieu" target="_blank" rel="noopener noreferrer" aria-label="Facebook Chez Ramo"
               className="w-9 h-9 rounded-full border-2 border-brand/30 flex items-center justify-center text-brand hover:bg-brand hover:text-cream transition">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://www.instagram.com/chez_ramo2026" target="_blank" rel="noopener noreferrer" aria-label="Instagram Chez Ramo"
               className="w-9 h-9 rounded-full border-2 border-brand/30 flex items-center justify-center text-brand hover:bg-brand hover:text-cream transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Carte Google Maps */}
      <div className="max-w-6xl mx-auto mt-12">
        <div className="relative rounded-[1.25rem] overflow-hidden shadow-lg">
          <iframe
            title="Chez Ramo — 32 Rue Pasteur, Lagnieu"
            src="https://maps.google.com/maps?q=32+Rue+Pasteur,+01150+Lagnieu,+France&output=embed&hl=fr&z=16"
            width="100%"
            height="300"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href="https://maps.google.com/?q=32+Rue+Pasteur+01150+Lagnieu"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 flex items-center gap-2 bg-white text-brand text-xs font-bold px-3 py-2 rounded-full shadow-md hover:bg-brand hover:text-white transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Voir sur Google Maps
          </a>
        </div>
      </div>

      {/* Copyright + NAP repeat (Google aime voir les infos cohérentes) */}
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-brand/20 text-center text-xs tracking-[.1em] uppercase text-[#8A8A8A]">
        © 2026 Chez Ramo · 32 Rue Pasteur, 01150 Lagnieu · 04 27 50 00 62
        <span className="mx-2">·</span>
        <a href={`${BASE}/mentions-legales`} className="hover:text-brand transition">Mentions légales</a>
      </div>
    </footer>
  )
}
