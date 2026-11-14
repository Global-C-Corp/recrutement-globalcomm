'use client'

export function StickyApply() {
  return (
    <div className="sticky">
      <a
        className="btn blue"
        href="#apply"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })
        }}
      >
        Postuler
      </a>
    </div>
  )
}
