// Visionneuse des réalisations : photo avant / après en grand dans un <dialog> natif.
// Flèches, clavier (← →, Échap) et glissement du doigt ; les légendes sont lues dans les cartes.
export function initLightbox(section, { lenis }) {
  const dlg = document.getElementById('lightbox')
  const img = dlg.querySelector('.lightbox__img')
  const count = dlg.querySelector('.lightbox__count')
  const title = dlg.querySelector('.lightbox__title')
  const text = dlg.querySelector('.lightbox__text')
  const items = [...section.querySelectorAll('.realis__zoom')].map((btn) => {
    const card = btn.closest('.review__card')
    const pic = btn.querySelector('img')
    return { btn, src: pic.getAttribute('src'), alt: pic.alt, title: card.querySelector('.review__who b').textContent, text: card.querySelector('blockquote').textContent.trim() }
  })
  const pad = (n) => String(n).padStart(2, '0')
  let i = 0

  const show = (k) => {
    i = (k + items.length) % items.length
    const it = items[i]
    img.src = it.src
    img.alt = it.alt
    count.textContent = `${pad(i + 1)} / ${pad(items.length)}`
    title.textContent = it.title
    text.textContent = it.text
  }
  const open = (k) => { show(k); dlg.showModal(); lenis?.stop() }

  items.forEach((it, k) => it.btn.addEventListener('click', () => open(k)))
  dlg.querySelector('.lightbox__prev').addEventListener('click', () => show(i - 1))
  dlg.querySelector('.lightbox__next').addEventListener('click', () => show(i + 1))
  dlg.addEventListener('close', () => { lenis?.start(); items[i].btn.focus({ preventScroll: true }) })
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(i - 1)
    if (e.key === 'ArrowRight') show(i + 1)
  })
  dlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target === dlg) dlg.close()
  })

  // Glissement horizontal : photo suivante ou précédente
  let x0 = null
  dlg.addEventListener('pointerdown', (e) => { x0 = e.clientX })
  dlg.addEventListener('pointerup', (e) => {
    if (x0 === null) return
    const dx = e.clientX - x0
    x0 = null
    if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1))
  })
}
