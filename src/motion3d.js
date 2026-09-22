// Primitives de mouvement réutilisables — composées par section plutôt qu'une animation ad hoc à chaque fois.
// Toutes sont créées dans le contexte GSAP de main.js (nettoyage automatique) et sautent si l'utilisateur
// demande moins d'animations. `speed` négatif = premier plan (l'élément monte plus vite que la page).
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** Translation verticale scrubée sur la traversée de l'écran */
export function parallax(el, { speed = 0.08, x = 0 } = {}) {
  const d = () => window.innerHeight * speed
  gsap.fromTo(el, { y: () => d(), x: () => -x }, {
    y: () => -d(), x: () => x, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
  })
}

/** La carte arrive couchée dans la profondeur et se redresse */
export function scroll3d(el, { rotateX = 26, z = -160, y = 60, start = 'top 92%', end = 'top 52%' } = {}) {
  gsap.fromTo(el, { rotateX, z, y, opacity: 0.25 }, {
    rotateX: 0, z: 0, y: 0, opacity: 1, ease: 'power3.out',
    scrollTrigger: { trigger: el, start, end, scrub: 0.8 },
  })
}

/** Bascule 3D suivant la souris (ordinateur seulement), sans re-rendu ni listener par image.
 *  ⚠ quickTo ne résout pas les alias : utiliser rotationX / rotationY, pas rotateX / rotateY. */
export function tilt3d(el, { max = 7, scale = 1.015 } = {}) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' })
  const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' })
  const sc = gsap.quickTo(el, 'scale', { duration: 0.5, ease: 'power3.out' })
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect()
    rx(((r.top + r.height / 2 - e.clientY) / r.height) * 2 * max)
    ry(((e.clientX - r.left - r.width / 2) / r.width) * 2 * max)
    sc(scale)
  })
  el.addEventListener('pointerleave', () => { rx(0); ry(0); sc(1) })
}

/** Couches internes détachées en Z : exige preserve-3d sur tous les parents */
export function depth(el, { z = 40 } = {}) {
  gsap.set(el, { z, transformStyle: 'preserve-3d' })
}

/** Entrée en cascade d'une liste d'éléments */
export function stagger(els, { y = 40, each = 0.08, start = 'top 88%' } = {}) {
  const list = gsap.utils.toArray(els)
  if (!list.length) return
  gsap.fromTo(list, { y, opacity: 0 }, {
    y: 0, opacity: 1, ease: 'power3.out', duration: 0.7, stagger: each,
    scrollTrigger: { trigger: list[0].parentElement || list[0], start, once: false, toggleActions: 'play none none reverse' },
  })
}

/** Applique parallax() à tout élément portant data-parallax="0.06" dans une section */
export function autoParallax(root) {
  gsap.utils.toArray(root.querySelectorAll('[data-parallax]')).forEach((el) => parallax(el, { speed: parseFloat(el.dataset.parallax) || 0.06 }))
}

/** Applique tilt3d() à tout élément portant data-tilt */
export function autoTilt(root, opts) {
  gsap.utils.toArray(root.querySelectorAll('[data-tilt]')).forEach((el) => tilt3d(el, opts))
}

export { ScrollTrigger }
