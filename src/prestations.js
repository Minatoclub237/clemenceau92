// Catalogue des prestations — uniquement les services attestés (fiche Google, enseigne, ancien site de l'atelier).
// Présentation : carrousel 3D piloté par le défilement (scène sticky, pas de pin).
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const CATALOGUE = [
  { title: 'Carrosserie', items: ['Réparation après choc ou accident', 'Débosselage et redressage', 'Masticage et reprise des déformations', 'Ailes, portières et capots', 'Pare-chocs : réparation ou remplacement', 'Feux avant et arrière'] },
  { title: 'Peinture', items: ['Un élément sans bosse : 200 €', 'Un élément avec bosse légère : 300 €', 'Raccords de teinte', 'Peinture complète du véhicule', 'Cabine de peinture et de séchage'] },
  { title: 'Pare-brise', items: ['Remplacement du pare-brise', 'Garantie bris de glace, selon votre contrat', 'Démarches avec votre assureur'] },
  { title: 'Sinistre & assurance', items: ['Visite de l’expert à l’atelier', 'Suivi du dossier avec l’assurance', 'Libre choix du réparateur (loi Hamon)'] },
  { title: 'Utilitaires & motos', items: ['Fourgons et utilitaires', 'Véhicules de société', 'Carénages de moto'] },
]

const N = CATALOGUE.length
export const CATALOGUE_COUNT = CATALOGUE.reduce((n, c) => n + c.items.length, 0)
export const slug = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const pad = (n) => String(n).padStart(2, '0')
const countLabel = (n) => `${n} prestation${n > 1 ? 's' : ''}`
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export function initPrestations(section, { lenis, reduced }) {
  const deck = section.querySelector('.presta__deck')
  const rail = section.querySelector('.presta__ticks')
  const fill = section.querySelector('.presta__fill')
  const curEl = section.querySelector('.presta__current')
  const nameEl = section.querySelector('.presta__name')
  const countEl = section.querySelector('.presta__active-count')

  section.querySelector('[data-presta-count]').dataset.to = CATALOGUE_COUNT
  section.querySelector('[data-presta-domains]').textContent = N

  deck.innerHTML = CATALOGUE.map((c, i) => `
    <article class="pcard${c.items.length > 6 ? ' pcard--long' : ''}" id="presta-${slug(c.title)}" data-index="${i}">
      <div class="pcard__media" aria-hidden="true">
        <img class="pcard__img" src="/media/presta-${pad(i + 1)}.webp" width="1376" height="768" alt="" loading="lazy" decoding="async" />
        <span class="pcard__big">${pad(i + 1)}</span>
        <i class="pcard__sheen"></i>
      </div>
      <div class="pcard__body">
        <header class="pcard__head">
          <span class="pcard__num">${pad(i + 1)}</span>
          <h3 class="pcard__title">${c.title}</h3>
          <span class="pcard__count">${pad(c.items.length)}</span>
        </header>
        <ul class="pcard__list">${c.items.map((it) => `<li>${it}</li>`).join('')}</ul>
      </div>
    </article>`).join('')
  rail.innerHTML = CATALOGUE.map((c, i) => `<button type="button" class="presta__tick" data-i="${i}" aria-label="${c.title}"><span>${c.title}</span></button>`).join('')

  const cards = [...deck.children]
  const ticks = [...rail.children]

  // Position de défilement qui amène la carte i face à l'utilisateur
  const scrollFor = (i) => {
    const top = section.getBoundingClientRect().top + window.scrollY
    return top + (i / (N - 1)) * (section.offsetHeight - window.innerHeight)
  }
  const scrollToIndex = (i) => lenis ? lenis.scrollTo(scrollFor(i), { duration: 1.4 }) : window.scrollTo({ top: scrollFor(i), behavior: 'smooth' })
  rail.addEventListener('click', (e) => { const t = e.target.closest('.presta__tick'); if (t) scrollToIndex(+t.dataset.i) })

  /* ---------- Panneau d'information : bascule animée à chaque changement de carte ---------- */
  let active = -1, swapTl
  const setActive = (i) => {
    if (i === active) return
    const dir = i > active ? 1 : -1
    active = i
    cards.forEach((c, k) => c.classList.toggle('is-active', k === i))
    ticks.forEach((t, k) => t.classList.toggle('is-on', k === i))
    swapTl?.kill()
    const els = [curEl, nameEl, countEl]
    if (reduced) {
      curEl.textContent = pad(i + 1); nameEl.textContent = CATALOGUE[i].title; countEl.textContent = countLabel(CATALOGUE[i].items.length)
      return
    }
    swapTl = gsap.timeline()
      .to(els, { yPercent: -60 * dir, opacity: 0, duration: 0.18, ease: 'power2.in', stagger: 0.03 })
      .add(() => {
        curEl.textContent = pad(i + 1)
        nameEl.textContent = CATALOGUE[i].title
        countEl.textContent = countLabel(CATALOGUE[i].items.length)
      })
      .fromTo(els, { yPercent: 60 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.05 })
  }

  /* ---------- Géométrie du carrousel 3D ---------- */
  let geo = {}
  const measure = () => {
    const w = window.innerWidth, mobile = w < 900
    geo = mobile
      ? { near: w * 0.62, far: w * 0.16, depth: 150, rot: 38, lift: 40 }
      : { near: w * 0.19, far: w * 0.085, depth: 190, rot: 44, lift: 70 }
  }
  measure()
  window.addEventListener('resize', () => { measure(); layout(state.p) })

  const state = { p: 0 }
  const layout = (p) => {
    cards.forEach((card, i) => {
      const o = i - p, ao = Math.abs(o), s = Math.sign(o)
      const x = s * (ao < 1 ? ao * geo.near : geo.near + (ao - 1) * geo.far)
      const z = -Math.min(ao, 4.5) * geo.depth + Math.max(0, 1 - ao * 1.6) * geo.lift
      const ry = -clamp(o, -1, 1) * geo.rot - clamp(o, -4, 4) * 2
      const rz = clamp(o, -3, 3) * 1.2
      const y = Math.min(ao, 4) * 14
      const opacity = ao > 4.6 ? 0 : 1 - Math.max(0, ao - 3.2) * 0.7
      card.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`
      card.style.opacity = opacity.toFixed(3)
      card.style.zIndex = String(100 - Math.round(ao * 10))
      card.style.setProperty('--dim', Math.min(ao, 2.4) / 2.4)
      card.style.visibility = opacity <= 0 ? 'hidden' : 'visible'
    })
    fill.style.transform = `scaleX(${p / (N - 1)})`
    setActive(clamp(Math.round(p), 0, N - 1))
  }
  layout(0)

  if (reduced) {
    section.classList.add('presta--static')
    return { scrollToIndex, indexOf: (id) => cards.findIndex((c) => c.id === id) }
  }

  // Progression 0 → N-1 liée au défilement de la section (lissée), mise en page à chaque image
  gsap.to(state, {
    p: N - 1, ease: 'none',
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.9 },
    onUpdate: () => layout(state.p),
  })

  // Inclinaison du plateau selon la vitesse de défilement : donne du poids au mouvement
  const tiltX = gsap.quickTo(deck, 'rotateX', { duration: 0.6, ease: 'power3.out' })
  const tiltZ = gsap.quickTo(deck, 'rotateZ', { duration: 0.8, ease: 'power3.out' })
  let vel = 0, inView = false
  ScrollTrigger.create({
    trigger: section, start: 'top bottom', end: 'bottom top',
    onToggle: (self) => { inView = self.isActive },
    onUpdate: (self) => { vel = clamp(self.getVelocity() / 2600, -1, 1) },
  })
  // La vitesse retombe progressivement : le plateau revient au repos en douceur à l'arrêt
  gsap.ticker.add(() => {
    if (!inView) return
    vel *= 0.9
    tiltX(-vel * 9); tiltZ(vel * 1.5)
  })

  return { scrollToIndex, indexOf: (id) => cards.findIndex((c) => c.id === id) }
}
