'use client'

import { useEffect, useRef } from 'react'

const CFG = { from: 400, to: 900, radius: 110, smoothing: 0.2 }

/** Port of React Bits VariableProximity (weight 400→900, radius 110, linear falloff, smoothing 0.2). */
export function VariableProximity({ label, className }: { label: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const sec = el.closest('section') ?? document.body
    const chars = [...el.querySelectorAll<HTMLElement>('.ch')]
    const cur = chars.map(() => CFG.from)
    let mx = -9999, my = -9999, running = true, raf = 0, visible = true
    const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY }
    const onLeave = () => { mx = my = -9999 }
    sec.addEventListener('pointermove', onMove as EventListener)
    sec.addEventListener('pointerleave', onLeave)
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting })
    io.observe(sec)
    const frame = () => {
      if (!running) return
      raf = requestAnimationFrame(frame)
      if (!visible) return
      chars.forEach((c, i) => {
        let target = CFG.from
        if (mx > -9000) {
          const r = c.getBoundingClientRect()
          const dist = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2))
          if (dist < CFG.radius) target = CFG.from + (CFG.to - CFG.from) * (1 - dist / CFG.radius)
        }
        cur[i] += (target - cur[i]) * CFG.smoothing
        c.style.fontVariationSettings = `'wght' ${cur[i].toFixed(0)}`
      })
    }
    raf = requestAnimationFrame(frame)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      sec.removeEventListener('pointermove', onMove as EventListener)
      sec.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <h2 ref={ref} className={className} aria-label={label}>
      {label.split(' ').map((w, wi, arr) => (
        <span key={wi}>
          <span className="w" aria-hidden="true">
            {[...w].map((c, ci) => (
              <span className="ch" key={ci}>{c}</span>
            ))}
          </span>
          {wi < arr.length - 1 ? ' ' : null}
        </span>
      ))}
    </h2>
  )
}
