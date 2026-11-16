'use client'

import { useEffect, useRef } from 'react'

// Replace `image` with a URL later; the gradient is the placeholder.
const GALLERY = { defaultIndex: 0, expandRatio: 0.52, parallax: 0.5, tilt: 8, stagger: 0.06 }

const STEPS = [
  {
    title: 'Candidature',
    text: 'Vous remplissez le formulaire et joignez votre CV. Aucun compte à créer.',
    image: '/images/process/01-candidature.avif',
  },
  {
    title: 'Étude de candidature',
    text: 'Notre équipe RH lit votre dossier, CV et portfolio, et le compare au poste.',
    image: '/images/process/02-etude-candidature.avif',
  },
  {
    title: 'Premier échange',
    text: 'Un appel court avec notre équipe RH pour faire connaissance et valider votre profil.',
    image: '/images/process/03-premier-echange.avif',
  },
  {
    title: 'Entretien',
    text: 'Rencontre avec l’équipe, puis réponse, positive ou non.',
    image: '/images/process/04-entretien.avif',
  },
]

export function AccordionGallery() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = ref.current
    if (!box) return
    const G = GALLERY
    const n = STEPS.length
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const vertical = () => matchMedia('(max-width:720px)').matches
    const panels = [...box.querySelectorAll<HTMLElement>('.ag-p')]

    const setActive = (a: number) =>
      panels.forEach((p, k) => {
        const on = k === a
        p.classList.toggle('on', on)
        p.style.flexGrow = String(on ? G.expandRatio : (1 - G.expandRatio) / (n - 1))
        p.querySelector<HTMLElement>('.ag-d')!.style.transitionDelay = on ? `${G.stagger * 2}s` : '0s'
      })

    const cleanups: (() => void)[] = []
    panels.forEach((p, i) => {
      const img = p.querySelector<HTMLElement>('.ag-img')!
      const enter = (e: PointerEvent) => { if (e.pointerType === 'mouse') setActive(i) }
      const click = () => setActive(i)
      const focus = () => setActive(i)
      const move = (e: PointerEvent) => {
        if (reduce || vertical() || !p.classList.contains('on') || e.pointerType !== 'mouse') return
        const r = p.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        p.style.transform = `perspective(900px) rotateY(${px * G.tilt}deg) rotateX(${-py * G.tilt}deg)`
        img.style.transform = `translate(${-px * 40 * G.parallax}px,${-py * 40 * G.parallax}px) scale(1.04)`
      }
      const leave = () => { p.style.transform = ''; img.style.transform = '' }
      p.addEventListener('pointerenter', enter)
      p.addEventListener('click', click)
      p.addEventListener('focus', focus)
      p.addEventListener('pointermove', move)
      p.addEventListener('pointerleave', leave)
      cleanups.push(() => {
        p.removeEventListener('pointerenter', enter)
        p.removeEventListener('click', click)
        p.removeEventListener('focus', focus)
        p.removeEventListener('pointermove', move)
        p.removeEventListener('pointerleave', leave)
      })
    })

    const ag = box.querySelector('.ag')!
    ag.classList.add('ag-init')
    setActive(G.defaultIndex)
    requestAnimationFrame(() => requestAnimationFrame(() => ag.classList.remove('ag-init')))
    return () => cleanups.forEach((c) => c())
  }, [])

  return (
    <div ref={ref}>
      <div className="ag">
        {STEPS.map((st, i) => (
          <div className="ag-p" key={st.title} tabIndex={0} role="button" aria-label={`Étape ${i + 1} : ${st.title}`}>
            <div className="ag-img" style={{ backgroundImage: `url('${st.image}')` }} />
            <div className="ag-ov" />
            <span className="ag-n">0{i + 1}</span>
            <div className="ag-cap">
              <h3 className="ag-t">{st.title}</h3>
              <p className="ag-d">{st.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
