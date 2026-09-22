// Impact de pare-brise réaliste (verre feuilleté), généré avec une graine fixe.
//
// Ce qu'on observe sur un vrai impact et qu'il faut reproduire :
//  - un noyau écrasé, blanc et opaque, fait de dizaines d'éclats courts ;
//  - des radiales en COIN : larges à la naissance, réduites à un cheveu au bout — jamais
//    des traits d'épaisseur constante, c'est ce qui faisait « vectoriel » ;
//  - des renflements le long des traits, là où les deux feuilles de verre se décollent ;
//  - des anneaux brisés qui relient deux radiales voisines et découpent des cellules ;
//  - quelques longues fissures qui filent loin, un peu courbes, avec des ramifications.
//
// Les formes sont donc des POLYGONES remplis (et non des traits), et l'apparition se fait par
// propagation : un masque circulaire s'ouvre depuis le point d'impact (draw), puis se referme
// (heal). Deux curseurs, pilotés au défilement par hero/offer.
const NS = 'http://www.w3.org/2000/svg'
const clamp01 = (v) => Math.min(1, Math.max(0, v))
let uid = 0

function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

export function initCrack(svg, { seed = 92, at = null, scale = 1 } = {}) {
  const state = { draw: 0, heal: 0 }
  let maskCircle = null, core = null, halo = null, R = 1, cx = 0, cy = 0

  const build = () => {
    const w = svg.clientWidth || window.innerWidth
    const h = svg.clientHeight || window.innerHeight
    const mobile = w < 900
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    svg.textContent = ''
    const rand = rng(seed)
    cx = w * (at ? at[0] : mobile ? 0.62 : 0.72)
    cy = h * (at ? at[1] : mobile ? 0.3 : 0.42)
    R = Math.hypot(w, h) * 0.62
    const k = (Math.min(w, h) / 900) * scale // échelle : mêmes proportions sur tous les écrans
    svg.style.setProperty('--cx', `${(cx / w) * 100}%`)
    svg.style.setProperty('--cy', `${(cy / h) * 100}%`)

    const id = `crk${++uid}`
    const defs = document.createElementNS(NS, 'defs')
    defs.innerHTML = `
      <radialGradient id="${id}-feather">
        <stop offset="0" stop-color="#fff"/><stop offset="0.82" stop-color="#fff"/><stop offset="1" stop-color="#000"/>
      </radialGradient>
      <radialGradient id="${id}-halo">
        <stop offset="0" stop-color="#fff" stop-opacity=".3"/>
        <stop offset="0.45" stop-color="#dff1ff" stop-opacity=".07"/>
        <stop offset="1" stop-color="#dff1ff" stop-opacity="0"/>
      </radialGradient>
      <mask id="${id}-mask" maskUnits="userSpaceOnUse">
        <circle cx="${cx}" cy="${cy}" r="0" fill="url(#${id}-feather)"/>
      </mask>`
    svg.append(defs)
    maskCircle = defs.querySelector('circle')

    const g = document.createElementNS(NS, 'g')
    g.setAttribute('mask', `url(#${id}-mask)`)
    svg.append(g)

    // Halo de décollement des feuilles autour du point d'impact
    halo = document.createElementNS(NS, 'circle')
    halo.setAttribute('cx', cx)
    halo.setAttribute('cy', cy)
    halo.setAttribute('r', 40 * k)
    halo.setAttribute('fill', `url(#${id}-halo)`)
    halo.setAttribute('class', 'crack__halo')
    g.append(halo)

    /* ---------- fabrique de fissures : une polyligne devient un coin rempli ---------- */
    const shards = []   // fissures principales
    const fines = []    // éclats et ramifications fines

    const wedge = (pts, w0, tipRatio = 0.06, swell = 0.9) => {
      // demi-largeur décroissante + renflements aléatoires (décollement du feuilleté)
      const n = pts.length - 1
      const left = [], right = []
      for (let i = 0; i <= n; i++) {
        const t = i / n
        const peak = Math.min(1, t / 0.12)                 // le coin s'ouvre juste après le noyau
        let hw = (w0 / 2) * peak * Math.pow(1 - t, 1.35) + tipRatio
        if (rand() > 0.72) hw *= 1 + swell * rand()          // renflement local
        const [x, y] = pts[i]
        const [px, py] = pts[Math.max(0, i - 1)]
        const [nx2, ny2] = pts[Math.min(n, i + 1)]
        let dx = nx2 - px, dy = ny2 - py
        const L = Math.hypot(dx, dy) || 1
        dx /= L; dy /= L
        left.push([x - dy * hw, y + dx * hw])
        right.push([x + dy * hw, y - dx * hw])
      }
      return 'M' + left.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') +
        'L' + right.reverse().map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z'
    }

    const walk = (ang, len, segs, wander) => {
      let x = cx, y = cy, a = ang
      const pts = [[x, y]]
      for (let s = 0; s < segs; s++) {
        a += (rand() - 0.5) * wander
        const step = (len / segs) * (0.65 + rand() * 0.7)
        x += Math.cos(a) * step
        y += Math.sin(a) * step
        pts.push([x, y])
      }
      return { pts, ang: a }
    }

    // 1. Noyau écrasé : masse blanche irrégulière, éclats très serrés autour
    {
      const blob = []
      const m = 14
      for (let j = 0; j < m; j++) {
        const a = (j / m) * Math.PI * 2
        const rr = (3.5 + rand() * 5.5) * k
        blob.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr])
      }
      shards.push({ d: 'M' + blob.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z', o: 0.96 })
    }
    for (let i = 0; i < 90; i++) {
      const a = rand() * Math.PI * 2
      const len = (5 + rand() * 30) * k
      const { pts } = walk(a, len, 2, 0.6)
      fines.push({ d: wedge(pts, (1.2 + rand() * 3) * k, 0.12, 1.6), o: 0.45 + rand() * 0.55 })
    }

    // 2. Réseau : sommets sur des anneaux successifs, puis segments radiaux et segments d'anneau.
    //    C'est ce maillage qui découpe les cellules polygonales caractéristiques du verre.
    const RINGS = [13, 23, 37, 56, 80, 112, 152, 205, 270, 345]
    const N = 34
    const V = []            // V[i][j] = sommet de la radiale i sur l'anneau j
    const reach = []        // jusqu'où va chaque radiale
    for (let i = 0; i < N; i++) {
      const base = (i / N) * Math.PI * 2 + (rand() - 0.5) * 0.16
      const row = []
      let a = base
      for (let j = 0; j < RINGS.length; j++) {
        a += (rand() - 0.5) * 0.13                       // la fissure serpente en s'éloignant
        const rr = RINGS[j] * k * (0.84 + rand() * 0.34)
        row.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr])
      }
      V.push(row)
      reach.push(0) // rempli juste après : la longueur varie doucement d'une radiale à l'autre
    }

    // Longueurs contiguës : une marche aléatoire lente autour de l'impact, sinon les anneaux
    // ne trouvent jamais deux voisines de même portée et les cellules ne se referment pas.
    {
      let cur = 4 + Math.floor(rand() * 3)
      for (let i = 0; i < N; i++) {
        cur += rand() < 0.42 ? (rand() < 0.5 ? -1 : 1) : 0
        cur = Math.max(2, Math.min(RINGS.length - 1, cur))
        reach[i] = cur
      }
      // quelques fissures qui filent jusqu'au bord
      for (let i = 0; i < 4; i++) reach[Math.floor(rand() * N)] = RINGS.length - 1
    }

    // 2a. Segments radiaux : largeur décroissante d'un anneau au suivant
    const rays = []
    for (let i = 0; i < N; i++) {
      const pts = [[cx, cy]]
      for (let j = 0; j <= reach[i]; j++) pts.push(V[i][j])
      rays.push(pts)
      const w0 = (1.6 + rand() * 2.2) * k * (reach[i] > 5 ? 1.1 : 0.85)
      shards.push({ d: wedge(pts, w0, 0.06, 0.9), o: 0.72 + rand() * 0.28 })
      // fissure qui file au-delà du dernier anneau (quelques-unes seulement)
      if (reach[i] >= RINGS.length - 2 && rand() > 0.25) {
        const last = V[i][reach[i]]
        let a = Math.atan2(last[1] - V[i][reach[i] - 1][1], last[0] - V[i][reach[i] - 1][0])
        let x = last[0], y = last[1]
        const far = [[x, y]]
        const steps = 7
        const len = R * (0.35 + rand() * 0.45)
        for (let s2 = 0; s2 < steps; s2++) {
          a += (rand() - 0.5) * 0.16
          x += Math.cos(a) * (len / steps)
          y += Math.sin(a) * (len / steps)
          far.push([x, y])
        }
        shards.push({ d: wedge(far, (1 + rand() * 1.1) * k, 0.04, 0.4), o: 0.45 + rand() * 0.3 })
      }
    }

    // 2b. Segments d'anneau : ils ferment les cellules entre deux radiales voisines
    for (let j = 0; j < RINGS.length; j++) {
      for (let i = 0; i < N; i++) {
        const i2 = (i + 1) % N
        if (reach[i] < j || reach[i2] < j) continue
        if (rand() > 0.96 - j * 0.03) continue
        const A = V[i][j], B = V[i2][j]
        const mid = []
        const steps = 2 + Math.floor(rand() * 2)
        for (let s2 = 1; s2 < steps; s2++) {
          const t = s2 / steps
          const mx = A[0] + (B[0] - A[0]) * t
          const my = A[1] + (B[1] - A[1]) * t
          const push = (rand() - 0.3) * 0.22                 // l'anneau bombe vers l'extérieur
          mid.push([mx + (mx - cx) * push, my + (my - cy) * push])
        }
        const w0 = Math.max(0.6 * k, (2 - j * 0.14) * k)
        fines.push({ d: wedge([A, ...mid, B], w0, 0.06, 1.2), o: 0.4 + rand() * 0.45 })
      }
    }

    // 2c. Échardes parallèles : par endroits le trait se dédouble (les deux feuilles de verre)
    for (let i = 0; i < N; i++) {
      if (rand() < 0.5 || reach[i] < 2) continue
      const j = 1 + Math.floor(rand() * (reach[i] - 1))
      const A = V[i][j], B = V[i][j + 1]
      if (!A || !B) continue
      const dx = B[0] - A[0], dy = B[1] - A[1]
      const L = Math.hypot(dx, dy) || 1
      const off = (2 + rand() * 5) * k * (rand() > 0.5 ? 1 : -1)
      const seg = [[A[0] - (dy / L) * off, A[1] + (dx / L) * off], [B[0] - (dy / L) * off * 0.4, B[1] + (dx / L) * off * 0.4]]
      fines.push({ d: wedge(seg, (0.9 + rand() * 1.1) * k, 0.05, 0.7), o: 0.3 + rand() * 0.35 })
    }

    // 3. Plaques de décollement : facettes claires accrochées aux fissures
    for (let i = 0; i < 30; i++) {
      const ray = rays[Math.floor(rand() * rays.length)]
      const pt = ray[1 + Math.floor(rand() * (ray.length - 1))]
      if (!pt) continue
      const sz = (3 + rand() * 10) * k
      const poly = []
      const m = 4 + Math.floor(rand() * 3)
      for (let j = 0; j < m; j++) {
        const a = (j / m) * Math.PI * 2 + rand() * 0.8
        const rr = sz * (0.4 + rand() * 0.95)
        poly.push([pt[0] + Math.cos(a) * rr, pt[1] + Math.sin(a) * rr * 0.75])
      }
      fines.push({ d: 'M' + poly.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z', o: 0.16 + rand() * 0.3 })
    }

    // Rendu : une couche diffuse (halo des fissures) puis la couche nette
    const layer = (cls, list, extra = '') => {
      const gg = document.createElementNS(NS, 'g')
      gg.setAttribute('class', cls)
      if (extra) gg.setAttribute('style', extra)
      gg.innerHTML = list.map((s) => `<path d="${s.d}" fill-opacity="${s.o.toFixed(2)}"/>`).join('')
      g.append(gg)
      return gg
    }
    layer('crack__blur', shards)
    layer('crack__fill', shards)
    layer('crack__fine', fines)

    // Cœur de l'impact : point le plus brillant
    core = null // le noyau écrasé (masse + éclats) suffit : pas de point lumineux artificiel

    render()
  }

  const render = () => {
    const { draw, heal } = state
    const grow = clamp01(draw) * (1 - clamp01(heal))
    // Propagation : le masque s'ouvre depuis l'impact, puis se referme
    if (maskCircle) maskCircle.setAttribute('r', (R * 1.12 * grow).toFixed(1))
    const o = clamp01(grow * 3)
    if (core) core.style.opacity = String(o)
    if (halo) halo.style.opacity = String(clamp01(grow * 2.2))
    svg.style.opacity = String(clamp01(grow * 6))
  }

  build()
  let t = 0
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 200) })

  return { state, render }
}
