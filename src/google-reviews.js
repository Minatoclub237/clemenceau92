// Avis de la fiche Google de l'atelier (5,0 sur 5, 291 avis, relevés le 22/09/2026), cités tels quels.
// Seuls les noms sont abrégés. Écartés : avis sans texte et avis d'un seul mot.
import gsap from 'gsap'
import { siGoogle } from 'simple-icons'

export const GOOGLE_URL = 'https://maps.app.goo.gl/KmsS6edu2QDk12WX9'

const REVIEWS = [
  { name: 'Rasmus S.', meta: 'Visite en juin 2026', text: 'Je vous remercier pour le travail réalisé sur mon véhicule. Résultat impeccable et j’apprécie votre professionnalisme et votre sérieux ! Merci également pour votre accueil et votre disponibilité. C’est un plaisir de faire appel à un artisan de confiance. Bonne continuation à toi Mourad et à toute l’équipe !' },
  { name: 'Jibril B.', meta: 'Local Guide · juin 2026', text: 'Très beau travail effectué par l’équipe sur un morceau de carénages qui avait été abîmé. Le résultat est impeccable, pas de différence avec la peinture d’origine. Je ne peux que recommander la carrosserie, Clemenceau 92.' },
  { name: 'Jacques F.', meta: 'Visite en avril 2026', text: 'Accueil très cordial et attentif à ma demande de réparation d’un léger choc sur l’aile avant gauche de ma voiture. Travail réalisé à la perfection en un court délai, notamment la peinture de l’aile complète, apparaissant comme neuve et sans différence de teinte avec les éléments de carrosserie existants. Le coût tout à fait modéré de cette prestation, me conduit donc à recommander très vivement et sans aucune réserve cet artisan carrossier.' },
  { name: 'Martina M.', meta: 'Local Guide · juin 2025', text: 'Excellent travail sur mon Ford Custom. Le gérant super agréable, pro et surtout sérieux. S’occupe de tout de A à Z c’est à dire du devis à la restitution du véhicule avec photos à l’appui. Je recommande vivement!' },
  { name: 'Yasser E.', meta: 'Visite en février 2026', text: 'Très bon garage, travail nickel, équipe professionnelle et accueillante. RDV rapide, rien à dire 👌 Je recommande !' },
  { name: 'Jean-Pierre P.', meta: 'Visite en novembre 2025', text: 'Je recommande vivement, excellente qualité de travaux de carrosserie, à un prix largement en dessous de tous ses concurrents, délai de réparation rapide…' },
  { name: 'Hosan', meta: 'Avis en anglais', text: 'Very nice and fast service ! Highly recommended !!' },
  { name: 'Patrick S.', meta: 'Avis en anglais', text: 'Nice people, quick service and reasonable price. I totally recommend!' },
  { name: 'M. B.', meta: 'Avis en anglais', text: 'Great customer service, great and clean work, delivered on time, i recommend!' },
]

const READ = 'Lire sur Google'
const initials = (n) => n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
const HUES = ['#1f3fb0', '#111110', '#00adee', '#3a3a35', '#3159f0']
const escape = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')

const cell = (r, i, hidden) => `
  <figure class="greview"${hidden ? ' aria-hidden="true"' : ''}>
    <blockquote class="greview__text">“${escape(r.text)}”</blockquote>
    <figcaption class="greview__who">
      <span class="greview__avatar" style="background:${HUES[i % HUES.length]}">${initials(r.name)}</span>
      <span class="greview__id"><b>${escape(r.name)}</b><small>${r.meta}</small></span>
    </figcaption>
    <a class="greview__btn" href="${GOOGLE_URL}" target="_blank" rel="noopener"${hidden ? ' tabindex="-1"' : ''}>${READ}</a>
  </figure>`

export function initGoogleReviews(section, { lenis, reduced }) {
  const track = section.querySelector('.greviews__track')
  const view = section.querySelector('.greviews__viewport')
  section.querySelector('.greviews__g').innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${siGoogle.path}" fill="#${siGoogle.hex}"/></svg>`

  // Deux jeux identiques : la boucle se referme sans raccord visible
  track.innerHTML = REVIEWS.map((r, i) => cell(r, i, false)).join('') + REVIEWS.map((r, i) => cell(r, i, true)).join('')

  let x = 0, setW = 0, cellW = 0, paused = false, visible = false, nudge = 0
  const measure = () => {
    const cells = track.children
    cellW = cells[1].getBoundingClientRect().left - cells[0].getBoundingClientRect().left
    setW = cellW * REVIEWS.length
  }
  measure()
  window.addEventListener('resize', measure)

  new IntersectionObserver(([e]) => { visible = e.isIntersecting }).observe(section)
  view.addEventListener('mouseenter', () => { paused = true })
  view.addEventListener('mouseleave', () => { paused = false })
  view.addEventListener('focusin', () => { paused = true })
  view.addEventListener('focusout', () => { paused = false })

  // Flèches : décalage d'une carte, lissé (s'ajoute au défilement continu)
  const shift = { v: 0 }
  const go = (dir) => {
    gsap.to(shift, { v: shift.v - dir * cellW, duration: 0.9, ease: 'power3.inOut', onUpdate: () => { nudge = shift.v } })
  }
  section.querySelector('[data-greviews-prev]').addEventListener('click', () => go(-1))
  section.querySelector('[data-greviews-next]').addEventListener('click', () => go(1))

  gsap.ticker.add((_, dt) => {
    if (!visible || !setW) return
    const boost = lenis ? Math.min(Math.abs(lenis.velocity), 40) * 0.12 : 0
    if (!paused && !reduced) x -= (0.55 + boost) * (dt / 16.7)
    track.style.transform = `translate3d(${gsap.utils.wrap(-setW, 0, x + nudge).toFixed(2)}px,0,0)`
  })
}
