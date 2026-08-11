'use client'

import { useEffect } from 'react'

export default function ScrollEffects() {
  useEffect(() => {
    // scroll progress bar
    const bar = document.createElement('div')
    bar.className = 'scroll-progress'
    document.body.prepend(bar)

    const onScroll = () => {
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      bar.style.transform = `scaleX(${Math.min(progress, 1)})`
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // cursor glow
    const glow = document.createElement('div')
    glow.className = 'cursor-glow'
    document.body.appendChild(glow)

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let cx = mx
    let cy = my
    let rafId: number

    const onMouseMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    document.addEventListener('mousemove', onMouseMove)

    const tickGlow = () => {
      cx += (mx - cx) * 0.072
      cy += (my - cy) * 0.072
      glow.style.left = cx + 'px'
      glow.style.top = cy + 'px'
      rafId = requestAnimationFrame(tickGlow)
    }
    rafId = requestAnimationFrame(tickGlow)

    // stagger reveal observer
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in')
          obs.unobserve(en.target)
        }
      })
    }, { threshold: 0.1 })

    const revObs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in')
          revObs.unobserve(en.target)
        }
      })
    }, { threshold: 0.12 })

    document.querySelectorAll('.reveal-stagger').forEach(el => obs.observe(el))
    document.querySelectorAll('.reveal:not(.in)').forEach(el => revObs.observe(el))

    // hero parallax
    const heroBurger = document.querySelector<HTMLElement>('.hero-burger')
    const onScrollParallax = () => {
      if (heroBurger && window.scrollY < window.innerHeight * 1.2) {
        heroBurger.style.transform = `translateY(${window.scrollY * 0.22}px)`
      }
    }
    window.addEventListener('scroll', onScrollParallax, { passive: true })

    // magnetic buttons
    document.querySelectorAll<HTMLElement>('.magnetic').forEach(btn => {
      const onEnter = () => { btn.style.transition = 'none' }
      const onMove = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect()
        const x = (e.clientX - r.left - r.width / 2) * 0.38
        const y = (e.clientY - r.top - r.height / 2) * 0.38
        btn.style.transform = `translate(${x}px, ${y}px) scale(1.05)`
      }
      const onLeave = () => {
        btn.style.transition = 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)'
        btn.style.transform = ''
      }
      btn.addEventListener('mouseenter', onEnter)
      btn.addEventListener('mousemove', onMove)
      btn.addEventListener('mouseleave', onLeave)
    })

    // ── Smooth scroll maison (wheel uniquement, pas de touch) ──
    let sy = window.scrollY        // position actuelle interpolée
    let ty = window.scrollY        // position cible
    let smoothRaf = 0

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight

    const smoothTick = () => {
      const diff = ty - sy
      if (Math.abs(diff) < 0.5) { sy = ty; window.scrollTo(0, ty); smoothRaf = 0; return }
      sy += diff * 0.1
      window.scrollTo(0, sy)
      smoothRaf = requestAnimationFrame(smoothTick)
    }

    // Ne pas intercepter si la cible est dans un div scrollable (popup, sidebar…)
    const insideScrollable = (el: Element | null) => {
      while (el && el !== document.documentElement) {
        const oy = getComputedStyle(el).overflowY
        if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) return true
        el = el.parentElement
      }
      return false
    }

    const onWheel = (e: WheelEvent) => {
      if (insideScrollable(e.target as Element)) return
      e.preventDefault()
      ty = Math.max(0, Math.min(maxScroll(), ty + e.deltaY))
      if (!smoothRaf) smoothRaf = requestAnimationFrame(smoothTick)
    }

    // Sync quand le scroll change par autre chose (clavier, programmatique)
    const onScrollSync = () => { if (!smoothRaf) { sy = window.scrollY; ty = window.scrollY } }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onScrollSync, { passive: true })

    // Anchor links
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href')!.slice(1)
        e.preventDefault()
        const dest = id ? (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + window.scrollY - 72 : 0
        ty = Math.max(0, Math.min(maxScroll(), dest))
        if (!smoothRaf) smoothRaf = requestAnimationFrame(smoothTick)
      })
    })

    return () => {
      bar.remove()
      glow.remove()
      cancelAnimationFrame(rafId)
      if (smoothRaf) cancelAnimationFrame(smoothRaf)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScrollSync)
      document.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScrollParallax)
      obs.disconnect()
      revObs.disconnect()
    }
  }, [])

  return null
}
