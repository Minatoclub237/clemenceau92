// Pare-brise fissuré devant l'atelier : l'impact s'étoile à l'arrivée, puis la fissure se résorbe au défilement.
// Géométrie générée avec une graine fixe (même dessin à chaque visite) : rayons brisés depuis le point
// d'impact, quelques ramifications et des arcs concentriques entre les rayons. Deux curseurs pilotent tout :
// draw (0 → 1, apparition) et heal (0 → 1, réparation) ; chaque trait en déduit sa longueur visible.
const NS = 'http://www.w3.org/2000/svg'
const clamp01 = (v) => Math.min(1, Math.max(0, v))

function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

export function initCrack(svg) {
  const state = { draw: 0, heal: 0 }
  let lines = [], impact = null

  const build = () => {
    const w = svg.clientWidth || window.innerWidth
    const h = svg.clientHeight || window.innerHeight
    const mobile = w < 900
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    svg.textContent = ''
    const rand = rng(92)
    const cx = w * (mobile ? 0.64 : 0.7), cy = h * (mobile ? 0.26 : 0.3)
    const R = Math.hypot(w, h) * 0.62
    svg.style.setProperty('--cx', `${(cx / w) * 100}%`)
    svg.style.setProperty('--cy', `${(cy / h) * 100}%`)
    const g = document.createElementNS(NS, 'g')
    svg.append(g)
    lines = []

    const addLine = (pts, kind, drawAt, healAt, width) => {
      const p = document.createElementNS(NS, 'path')
      p.setAttribute('d', 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L'))
      p.setAttribute('pathLength', '1')
      p.setAttribute('class', `crack__${kind}`)
      p.style.strokeWidth = width
      g.append(p)
      lines.push({ el: p, drawAt, healAt })
    }

    // Étoile d'impact : rayons courts et serrés, très brisés
    const k = Math.min(w, h) / 900
    const n = 22
    const rays = []
    for (let i = 0; i < n; i++) {
      let ang = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.25
      const len = (70 + rand() * 170) * k
      const segs = 4 + Math.floor(rand() * 3)
      let x = cx, y = cy
      const pts = [[x, y]]
      for (let s = 0; s < segs; s++) {
        ang += (rand() - 0.5) * 0.45
        const step = (len / segs) * (0.6 + rand() * 0.8)
        x += Math.cos(ang) * step
        y += Math.sin(ang) * step
        pts.push([x, y])
      }
      rays.push(pts)
      addLine(pts, 'ray', rand() * 0.1, 0.35 + rand() * 0.25, 0.9 + rand() * 0.9)
    }

    // Longues fissures : quelques lignes qui filent dans le verre, avec de petites ramifications
    for (let i = 0; i < 5; i++) {
      let ang = rand() * Math.PI * 2
      const len = R * (0.35 + rand() * 0.4)
      const segs = 12 + Math.floor(rand() * 6)
      let x = cx, y = cy
      const pts = [[x, y]]
      for (let s = 0; s < segs; s++) {
        ang += (rand() - 0.5) * 0.22
        const step = (len / segs) * (0.7 + rand() * 0.6)
        x += Math.cos(ang) * step
        y += Math.sin(ang) * step
        pts.push([x, y])
        if (s > 3 && rand() > 0.82) {
          let bx = x, by = y, bang = ang + (rand() > 0.5 ? 1 : -1) * (0.6 + rand() * 0.5)
          const bpts = [[bx, by]]
          for (let b = 0; b < 3; b++) {
            bang += (rand() - 0.5) * 0.4
            bx += Math.cos(bang) * 26 * k
            by += Math.sin(bang) * 26 * k
            bpts.push([bx, by])
          }
          addLine(bpts, 'branch', 0.45 + rand() * 0.2, 0.1 + rand() * 0.15, 0.7)
        }
      }
      addLine(pts, 'ray', 0.12 + rand() * 0.12, 0.3 + rand() * 0.2, 1 + rand() * 0.6)
    }

    // Anneaux concentriques : relient deux rayons voisins à même distance du point d'impact
    const at = (ray, r) => ray.find(([x, y]) => Math.hypot(x - cx, y - cy) >= r)
    ;[28, 62, 105].forEach((r0, ri) => {
      const r = r0 * k
      rays.forEach((ray, i) => {
        const a = at(ray, r), b = at(rays[(i + 1) % n], r)
        if (!a || !b || rand() < 0.2) return
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2
        const push = 0.04 + rand() * 0.08
        const pts = [a, [mx + (mx - cx) * push + (rand() - 0.5) * 4 * k, my + (my - cy) * push + (rand() - 0.5) * 4 * k], b]
        addLine(pts, 'ring', 0.3 + ri * 0.1 + rand() * 0.1, rand() * 0.2, 0.7)
      })
    })

    // Point d'impact : éclat de verre
    impact = document.createElementNS(NS, 'circle')
    impact.setAttribute('cx', cx)
    impact.setAttribute('cy', cy)
    impact.setAttribute('r', mobile ? 9 : 12)
    impact.setAttribute('class', 'crack__impact')
    g.append(impact)
    render()
  }

  const render = () => {
    const { draw, heal } = state
    for (const l of lines) {
      const d = clamp01((draw - l.drawAt) / (1 - l.drawAt))
      const hv = clamp01((heal - l.healAt) / 0.45)
      l.el.style.strokeDashoffset = String(1 - d * (1 - hv))
    }
    if (impact) impact.style.opacity = String(clamp01(draw * 3) * (1 - clamp01(heal / 0.85)))
  }

  build()
  let t = 0
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 200) })

  return { state, render }
}
