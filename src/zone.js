// Carte « Venir à l'atelier » : les anneaux et les liaisons se tracent à l'arrivée dans l'écran,
// et chaque ville de la liste s'allume sur la carte (et inversement) au survol ou au focus.
export function initZone(section, { reduced }) {
  if (reduced) section.classList.add('is-in')
  else {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      section.classList.add('is-in')
      io.disconnect()
    }, { threshold: 0.35 })
    io.observe(section.querySelector('.zone__map'))
  }

  const pairs = [...section.querySelectorAll('.zone__list [data-town]')].map((li) => [li, section.querySelector(`.zone__pt[data-town="${li.dataset.town}"]`)])
  const set = (on) => pairs.forEach(([li, pt]) => { const a = on === li || on === pt; li.classList.toggle('is-on', a); pt.classList.toggle('is-on', a) })
  pairs.forEach(([li, pt]) => {
    ;[li, pt].forEach((el) => {
      el.addEventListener('pointerenter', () => set(el))
      el.addEventListener('pointerleave', () => set(null))
    })
  })
}
