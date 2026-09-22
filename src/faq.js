// FAQ : objections réelles d'un client de carrosserie, réponses fondées sur les faits vérifiés
// (fiche Google de l'atelier, enseigne, registre). Chaque réponse porte son propre CTA bleu.
const TEL = 'tel:+33777007176'
const MAPS = 'https://maps.app.goo.gl/KmsS6edu2QDk12WX9'

const CATEGORIES = [
  { key: 'devis', label: 'Devis & prix' },
  { key: 'assurance', label: 'Assurance & sinistre' },
  { key: 'atelier', label: 'Atelier & pratique' },
]

const FAQS = {
  devis: [
    { q: 'Le devis est-il vraiment gratuit ?',
      a: 'Oui. Le devis est gratuit et sans engagement : envoyez quelques photos des dégâts, ou passez à l’atelier du lundi au vendredi.',
      cta: { label: 'Demander mon devis gratuit', href: '#devis' } },
    { q: 'Combien coûte la peinture d’un élément ?',
      a: 'À titre indicatif, la fiche Google de l’atelier affiche 200 € pour la peinture d’un élément sans bosse et 300 € avec une bosse légère. Le prix exact dépend du véhicule et des dégâts : il figure sur votre devis.',
      cta: { label: 'Faire chiffrer ma réparation', href: '#devis' } },
    { q: 'Dois-je me déplacer pour obtenir un chiffrage ?',
      a: 'Non. Des photos nettes de la zone abîmée, prises de face et de biais, suffisent pour un premier chiffrage. L’atelier examine ensuite le véhicule sur place.',
      cta: { label: 'Voir les 4 étapes', href: '#etapes' } },
    { q: 'Le devis est-il établi avant les travaux ?',
      a: 'Oui : les dégâts sont évalués et un devis détaillé est établi avant de commencer la réparation.',
      cta: { label: 'Appeler l’atelier', href: TEL } },
  ],
  assurance: [
    { q: 'Puis-je choisir mon carrossier, même si mon assurance m’en propose un ?',
      a: 'Oui. Depuis la loi Hamon de 2014, vous êtes libre de faire réparer votre véhicule chez le réparateur de votre choix, y compris lorsque votre assureur vous oriente vers un garage partenaire.',
      cta: { label: 'Appeler avec mon dossier sinistre', href: TEL } },
    { q: 'L’expert de l’assurance doit-il se déplacer ?',
      a: 'Pour un sinistre pris en charge, l’expert mandaté par votre assureur évalue les dégâts. Il peut examiner le véhicule directement à l’atelier : c’est écrit sur notre enseigne, « visite expert ».',
      cta: { label: 'Itinéraire vers l’atelier', href: MAPS, external: true } },
    { q: 'Mon pare-brise est-il couvert par mon assurance ?',
      a: 'S’il est couvert par la garantie bris de glace de votre contrat, votre assureur prend en charge le remplacement, franchise éventuelle déduite. L’atelier vous aide dans les démarches.',
      cta: { label: 'Demander un devis pare-brise', href: '#devis' } },
    { q: 'Qui s’occupe des démarches avec l’assurance ?',
      a: 'Nous gérons votre sinistre avec vous : passage de l’expert à l’atelier, suivi du dossier et réparation, jusqu’à la restitution du véhicule.',
      cta: { label: 'Voir les 4 étapes', href: '#etapes' } },
  ],
  atelier: [
    { q: 'Quels sont vos horaires ?',
      a: 'Du lundi au vendredi, de 9 h à 13 h et de 14 h à 18 h. L’atelier est fermé le samedi et le dimanche.',
      cta: { label: 'Appeler l’atelier', href: TEL } },
    { q: 'Réparez-vous les utilitaires et les motos ?',
      a: 'Oui. Fourgons et véhicules de société, comme Ford Transit, Renault Master ou Mercedes Vito, et carénages de moto, en plus des voitures particulières.',
      cta: { label: 'Voir les réalisations', href: '#realisations' } },
    { q: 'Travaillez-vous pour les entreprises ?',
      a: 'Oui, pour les particuliers comme pour les entreprises : l’atelier répare aussi les véhicules de société.',
      cta: { label: 'Appeler l’atelier', href: TEL } },
    { q: 'Où se trouve l’atelier ?',
      a: 'Au 95 avenue de la Liberté, 92000 Nanterre. L’entrée et le stationnement sont accessibles en fauteuil roulant.',
      cta: { label: 'Itinéraire vers l’atelier', href: MAPS, external: true } },
  ],
}

const CHEVRON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"/></svg>'
const ARROW = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const ring = (cls = '') => `<span class="spot-ring ${cls}" aria-hidden="true"></span>`

/* ---------- FadeUp : opacité 0 → 1 et y 24 → 0, une seule fois, à 30 % visible ---------- */
function fadeUp(el, delay, reduced) {
  el.classList.add('fade-up')
  if (reduced) el.classList.add('fade-up--reduced')
  el.style.transitionDelay = `${delay}s`
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    el.classList.add('is-in')
    io.disconnect()
  }, { threshold: 0.3 })
  io.observe(el)
}

/* ---------- Accordéon : un seul ouvert, refermable, hauteur animée 0,2 s ---------- */
function animateHeight(content, open) {
  const full = content.scrollHeight
  content.getAnimations().forEach((a) => a.cancel())
  content.style.height = 'auto'
  const anim = content.animate(
    open ? [{ height: '0px' }, { height: `${full}px` }] : [{ height: `${full}px` }, { height: '0px' }],
    { duration: 200, easing: 'ease-out' },
  )
  content.style.height = open ? 'auto' : '0px'
  anim.onfinish = () => { content.style.height = open ? 'auto' : '0px' }
}

export function initFaq(root, { reduced = false } = {}) {
  const tabs = root.querySelector('.faq__tabs')
  const list = root.querySelector('.faq__list')
  let active = 'devis'

  // Typographie française : espace insécable avant ? : ; ! pour ne jamais les isoler en début de ligne
  const nb = (t) => t.replace(/ ([?:;!])/g, ' $1')

  const renderTabs = () => {
    tabs.innerHTML = ring() + CATEGORIES.map((c) =>
      `<button type="button" class="faq__tab spot" data-key="${c.key}" aria-pressed="${c.key === active}">${ring('spot-ring--pill')}${c.label}</button>`).join('')
  }
  const render = () => {
    list.innerHTML = FAQS[active].map((f, i) => {
      const id = `faq-${active}-${i}`
      const ext = f.cta.external ? ' target="_blank" rel="noopener"' : ''
      return `<div class="faq-item spot" data-state="closed">${ring()}
        <h3 class="faq-item__h"><button type="button" class="faq-item__trigger" aria-expanded="false" aria-controls="${id}">
          <span class="faq-item__q">${nb(f.q)}</span><span class="faq-item__icon">${CHEVRON}</span>
        </button></h3>
        <div class="faq-item__content" id="${id}" role="region" style="height:0px">
          <div class="faq-item__body"><p>${nb(f.a)}</p><a class="faq-cta" href="${f.cta.href}"${ext}>${f.cta.label} ${ARROW}</a></div>
        </div>
      </div>`
    }).join('')
    ;[...list.children].forEach((item, i) => fadeUp(item, 0.15 * i, reduced))
  }
  renderTabs()
  render()

  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq__tab')
    if (!btn || btn.dataset.key === active) return
    active = btn.dataset.key
    tabs.querySelectorAll('.faq__tab').forEach((t) => t.setAttribute('aria-pressed', String(t === btn)))
    render() // nouvelle liste : tout est refermé
  })

  list.addEventListener('click', (e) => {
    const trigger = e.target.closest('.faq-item__trigger')
    if (!trigger) return
    const item = trigger.closest('.faq-item')
    const opening = item.dataset.state !== 'open'
    list.querySelectorAll('.faq-item[data-state="open"]').forEach((other) => {
      if (other === item) return
      other.dataset.state = 'closed'
      other.querySelector('.faq-item__trigger').setAttribute('aria-expanded', 'false')
      animateHeight(other.querySelector('.faq-item__content'), false)
    })
    item.dataset.state = opening ? 'open' : 'closed'
    trigger.setAttribute('aria-expanded', String(opening))
    animateHeight(item.querySelector('.faq-item__content'), opening)
  })

  root.querySelectorAll('[data-fade]').forEach((el) => fadeUp(el, +el.dataset.fade, reduced))

  /* ---------- Anneau lumineux qui suit le curseur : chaque conteneur et chaque carte ---------- */
  let inView = false, mx = -9999, my = -9999, raf = 0
  new IntersectionObserver(([e]) => { inView = e.isIntersecting }).observe(root)
  const paint = () => {
    raf = 0
    root.querySelectorAll('.spot').forEach((el) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--spot-x', `${mx - r.left}px`)
      el.style.setProperty('--spot-y', `${my - r.top}px`)
    })
  }
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY
    if (inView && !raf) raf = requestAnimationFrame(paint)
  }, { passive: true })

  /* ---------- Données structurées FAQPage ---------- */
  const ld = document.createElement('script')
  ld.type = 'application/ld+json'
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: Object.values(FAQS).flat().map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  })
  document.head.append(ld)
}
