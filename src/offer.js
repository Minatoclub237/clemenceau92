// Offre pare-brise — « le verre se pose ».
// Scène retenue à l'écran : les trois cartes arrivent de chant, comme des plaques de verre tirées
// d'un rack, pivotent à plat une par une, un reflet balaie chacune quand elle se pose, et la
// fissure qui traverse la rangée se referme lorsque la dernière est en place. Tout est piloté par
// le défilement (scrub) et se rejoue à l'envers en remontant.
import gsap from 'gsap'
import { initCrack } from './crack.js'
import { tilt3d } from './motion3d.js'

export function initOffer(section, { reduced }) {
  const cards = [...section.querySelectorAll('.ocard')]
  const crackSvg = section.querySelector('.offer__crack')

  if (reduced) {
    crackSvg?.remove()
    return
  }

  const crack = crackSvg ? initCrack(crackSvg) : null
  const desktop = window.matchMedia('(min-width: 901px)').matches
  const tl = gsap.timeline({
    scrollTrigger: desktop
      ? { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.7 }
      : { trigger: section, start: 'top 80%', end: 'bottom 85%', scrub: 0.7 },
  })

  cards.forEach((card, i) => {
    const at = i * 0.5
    tl.fromTo(card, {
      rotationY: -72, rotationZ: -5, xPercent: -55 - i * 10, z: -620, scale: 0.9, opacity: 0, transformOrigin: 'left center',
    }, {
      rotationY: 0, rotationZ: 0, xPercent: 0, z: 0, scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out',
    }, at)
    // Le reflet balaie la plaque au moment où elle se pose
    tl.fromTo(card.querySelector('.ocard__glint'), { xPercent: -130, opacity: 0 }, { xPercent: 130, opacity: 1, duration: 0.6, ease: 'power2.inOut' }, at + 0.8)
    tl.fromTo(card.querySelectorAll('.ocard__num, .ocard__title, .ocard__text, .wa-btn'),
      { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out' }, at + 0.55)
  })

  if (crack) {
    // La fissure court sur la rangée pendant la pose, puis se referme : le pare-brise est remplacé
    tl.to(crack.state, { draw: 1, duration: 0.9, ease: 'none', onUpdate: crack.render }, 0.15)
      .to(crack.state, { heal: 1, duration: 0.9, ease: 'none', onUpdate: crack.render }, 1.95)
  }

  cards.forEach((card) => tilt3d(card, { max: 6 }))
}
