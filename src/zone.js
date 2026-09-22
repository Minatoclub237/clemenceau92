// Carte « Venir à l'atelier » : la scène est retenue à l'écran (sticky) et la carte se construit
// AU DÉFILEMENT — contours des communes, puis ville par ville : la liaison se trace, le point apparaît, le nom
// et la ligne correspondante de la liste s'affichent. Tout se rejoue à l'envers quand on remonte.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initZone(section, { reduced }) {
  const svg = section.querySelector('.zone__svg')
  const communes = svg.querySelectorAll('.zone__commune')
  const host = svg.querySelector('.zone__commune--host')
  const scale = svg.querySelector('.zone__scale')
  const points = [...svg.querySelectorAll('.zone__pt')]
  const rows = [...section.querySelectorAll('.zone__list li')]
  const landmark = svg.querySelector('.zone__landmark')
  const home = svg.querySelector('.zone__home')

  if (reduced) {
    section.classList.add('is-in') // tout visible, sans animation
  } else {
    // Sur mobile la scène n'est pas retenue : le tracé suit l'entrée de la section
    const desktop = window.matchMedia('(min-width: 901px)').matches
    const tl = gsap.timeline({
      scrollTrigger: desktop
        ? { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6 }
        : { trigger: section, start: 'top 78%', end: 'bottom 75%', scrub: 0.6 },
    })

    tl.fromTo(svg, { scale: 0.92, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'power2.out' }, 0)
      .fromTo(home, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.15)
      // Les communes se dessinent du centre vers l'extérieur
      .fromTo(communes, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.9, ease: 'none', stagger: { each: 0.03, from: 'center' } }, 0.25)
      .fromTo(host, { fillOpacity: 0 }, { fillOpacity: 0.06, duration: 0.6 }, 1)
      .fromTo(scale, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.2)

    // Ville par ville : liaison → point → nom → ligne de la liste
    points.forEach((pt, i) => {
      const at = 1.8 + i * 0.55
      tl.fromTo(pt.querySelector('.zone__ray'), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.5, ease: 'none' }, at)
        .fromTo(pt.querySelector('.zone__dot'), { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(2.4)' }, at + 0.35)
        .fromTo(pt.querySelector('.zone__name'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35 }, at + 0.4)
      if (rows[i]) tl.fromTo(rows[i], { opacity: 0.15, x: -14 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, at + 0.3)
    })
    tl.fromTo(landmark, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.8 + points.length * 0.55)
  }

  const pairs = rows.map((li) => [li, section.querySelector(`.zone__pt[data-town="${li.dataset.town}"]`)])
  const set = (on) => pairs.forEach(([li, pt]) => { const a = on === li || on === pt; li.classList.toggle('is-on', a); pt.classList.toggle('is-on', a) })
  pairs.forEach(([li, pt]) => {
    ;[li, pt].forEach((el) => {
      el.addEventListener('pointerenter', () => set(el))
      el.addEventListener('pointerleave', () => set(null))
    })
  })

  return { refresh: () => ScrollTrigger.refresh() }
}
