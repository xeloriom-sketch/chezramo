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

    // lenis smooth scroll
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenis: any = null
    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({ duration: 1.2, smoothWheel: true })
      const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf) }
      requestAnimationFrame(raf)
      document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          const id = a.getAttribute('href')!.slice(1)
          e.preventDefault()
          if (!id) { lenis.scrollTo(0); return }
          const target = document.getElementById(id)
          if (target) lenis.scrollTo(target, { offset: -72 })
        })
      })
    }).catch(() => {})

    return () => {
      bar.remove()
      glow.remove()
      cancelAnimationFrame(rafId)
      document.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScrollParallax)
      obs.disconnect()
      revObs.disconnect()
      lenis?.destroy()
    }
  }, [])

  return null
}
