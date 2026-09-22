// Carte « Venir à l'atelier » : le tracé se construit AU DÉFILEMENT (scrub), comme le reste du site —
// anneaux, liaisons, points puis noms. Le mouvement se rejoue à l'envers quand on remonte.
// Chaque ville de la liste s'allume aussi sur la carte (et inversement) au survol.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initZone(section, { reduced }) {
  const svg = section.querySelector('.zone__svg')
  const rings = svg.querySelectorAll('.zone__rings circle')
  const ringLabels = svg.querySelectorAll('.zone__rings text')
  const rays = svg.querySelectorAll('.zone__ray')
  const dots = svg.querySelectorAll('.zone__dot')
  const names = svg.querySelectorAll('.zone__name')
  const landmark = svg.querySelector('.zone__landmark')
  const home = svg.querySelector('.zone__home')

  if (reduced) {
    section.classList.add('is-in') // tout visible, sans animation
  } else {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 78%', end: 'center 58%', scrub: 0.7 },
    })
    tl.fromTo(svg, { scale: 0.94, opacity: 0.35 }, { scale: 1, opacity: 1, duration: 1, ease: 'none' }, 0)
      .fromTo(home, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.05)
      .fromTo(rings, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.12, ease: 'none' }, 0.1)
      .fromTo(ringLabels, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.08 }, 0.5)
      .fromTo(rays, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.09, ease: 'none' }, 0.45)
      .fromTo(dots, { scale: 0 }, { scale: 1, duration: 0.45, stagger: 0.09, ease: 'back.out(2.2)' }, 0.7)
      .fromTo(names, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.09 }, 0.8)
      .fromTo(landmark, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.1)
    // La carte respire légèrement après le tracé
    gsap.fromTo(svg, { yPercent: 4 }, {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  }

  const pairs = [...section.querySelectorAll('.zone__list [data-town]')].map((li) => [li, section.querySelector(`.zone__pt[data-town="${li.dataset.town}"]`)])
  const set = (on) => pairs.forEach(([li, pt]) => { const a = on === li || on === pt; li.classList.toggle('is-on', a); pt.classList.toggle('is-on', a) })
  pairs.forEach(([li, pt]) => {
    ;[li, pt].forEach((el) => {
      el.addEventListener('pointerenter', () => set(el))
      el.addEventListener('pointerleave', () => set(null))
    })
  })

  return { refresh: () => ScrollTrigger.refresh() }
}
