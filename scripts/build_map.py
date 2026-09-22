# Carte réelle du secteur : contours officiels des communes (geo.api.gouv.fr / IGN),
# projetés autour de l'atelier, simplifiés puis écrits en SVG dans index.html.
import json, glob, math, os

GEO = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'geo')  # contours téléchargés depuis geo.api.gouv.fr
HTML = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'index.html')

LAT0, LON0 = 48.8908464, 2.212844          # atelier, 95 av. de la Liberté
PX_PER_KM = 56.8
W, H = 500, 520                              # zone cartographiée (rognée)
VW = 660                                     # cadre SVG élargi : les étiquettes de villes tiennent dedans
KX = 111.320 * math.cos(math.radians(LAT0))  # km par degré de longitude
KY = 110.574                                 # km par degré de latitude

# Villes : mêmes points que les distances affichées (api-adresse, chef-lieu)
TOWNS = [
    ('Nanterre', '1,1 km', 48.89809, 2.20231),
    ('Puteaux', '1,9 km', 48.88416, 2.23720),
    ('Suresnes', '2,2 km', 48.87098, 2.21809),
    ('Rueil-Malmaison', '3,0 km', 48.87453, 2.18045),
    ('Colombes', '4,4 km', 48.92254, 2.24780),
]
LA_DEFENSE = (48.8925, 2.2360)
HOST = '92050'  # Nanterre


def project(lat, lon):
    return ((lon - LON0) * KX * PX_PER_KM, -(lat - LAT0) * KY * PX_PER_KM)


def rdp(pts, eps):
    """Simplification Douglas-Peucker"""
    if len(pts) < 3:
        return pts
    x1, y1 = pts[0]
    x2, y2 = pts[-1]
    dx, dy = x2 - x1, y2 - y1
    n = math.hypot(dx, dy)
    idx, dmax = 0, 0.0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / n if n else math.hypot(x - x1, y - y1)
        if d > dmax:
            idx, dmax = i, d
    if dmax <= eps:
        return [pts[0], pts[-1]]
    return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)


def load():
    out = []
    for f in glob.glob(os.path.join(GEO, '*.json')):
        d = json.load(open(f, encoding='utf-8'))
        out.extend(d if isinstance(d, list) else [d])
    return out


def rings_of(geom):
    if not geom:
        return []
    if geom['type'] == 'Polygon':
        return [geom['coordinates'][0]]
    if geom['type'] == 'MultiPolygon':
        return [p[0] for p in geom['coordinates']]
    return []


MARGIN = 60
paths, host_paths = [], []
for com in load():
    for ring in rings_of(com.get('contour')):
        pts = [project(lat, lon) for lon, lat in ring]
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        # hors cadre : on ignore
        if max(xs) < -W / 2 - MARGIN or min(xs) > W / 2 + MARGIN or max(ys) < -H / 2 - MARGIN or min(ys) > H / 2 + MARGIN:
            continue
        s = rdp(pts, 1.1)
        d = 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in s) + 'Z'
        (host_paths if com.get('code') == HOST else paths).append(d)

svg = []
svg.append(f'<svg class="zone__svg" viewBox="{-VW // 2} {-H // 2} {VW} {H}" role="img" aria-labelledby="zone-map-title">')
svg.append('          <title id="zone-map-title">Carte du secteur : l’atelier au 95 avenue de la Liberté à Nanterre, et les communes voisines — Nanterre 1,1 km, Puteaux 1,9 km, Suresnes 2,2 km, Rueil-Malmaison 3 km, Colombes 4,4 km, La Défense 1,7 km</title>')
svg.append(f'          <defs><clipPath id="zone-clip"><rect x="{-W // 2}" y="{-H // 2}" width="{W}" height="{H}" rx="14" /></clipPath></defs>')
svg.append('          <g class="zone__shapes" clip-path="url(#zone-clip)" aria-hidden="true">')
for d in paths:
    svg.append(f'            <path class="zone__commune" pathLength="100" d="{d}" />')
for d in host_paths:
    svg.append(f'            <path class="zone__commune zone__commune--host" pathLength="100" d="{d}" />')
svg.append('          </g>')

# Échelle : 1 km en bas à gauche
sx, sy = -W / 2 + 20, H / 2 - 26
svg.append('          <g class="zone__scale" aria-hidden="true">')
svg.append(f'            <path d="M{sx:.0f} {sy - 5:.0f}V{sy:.0f}h{PX_PER_KM:.0f}v-5" />')
svg.append(f'            <text x="{sx + PX_PER_KM / 2:.0f}" y="{sy - 10:.0f}" text-anchor="middle">1 km</text>')
svg.append('          </g>')

# La Défense : repère
dx, dy = project(*LA_DEFENSE)
svg.append('          <g class="zone__landmark" aria-hidden="true">')
svg.append(f'            <rect x="{dx - 5:.0f}" y="{dy - 5:.0f}" width="10" height="10" rx="2" />')
svg.append(f'            <text x="{dx + 12:.0f}" y="{dy + 4:.0f}">La Défense · 1,7 km</text>')
svg.append('          </g>')

# Villes : liaison, point, nom, distance
for i, (name, dist, lat, lon) in enumerate(TOWNS):
    x, y = project(lat, lon)
    anchor = 'end' if x < 0 else 'start'
    lx = x - 12 if x < 0 else x + 12
    ly = y + 4
    svg.append(f'          <g class="zone__pt" data-town="{i}" style="--i:{i}">')
    svg.append(f'            <line class="zone__ray" x1="0" y1="0" x2="{x:.1f}" y2="{y:.1f}" pathLength="100" />')
    svg.append(f'            <circle class="zone__dot" cx="{x:.1f}" cy="{y:.1f}" r="5" />')
    svg.append(f'            <text class="zone__name" x="{lx:.1f}" y="{ly:.1f}" text-anchor="{anchor}">{name}<tspan class="zone__km" x="{lx:.1f}" dy="16">{dist}</tspan></text>')
    svg.append('          </g>')

# Atelier
svg.append('          <g class="zone__home" aria-hidden="true">')
svg.append('            <circle class="zone__pulse" r="13" />')
svg.append('            <circle class="zone__pin" r="8" />')
svg.append('            <text x="-14" y="30" text-anchor="end">L’atelier</text>')
svg.append('          </g>')
svg.append('        </svg>')
new = '\n'.join(svg)

s = open(HTML, encoding='utf-8').read()
start = s.index('<svg class="zone__svg"')
end = s.index('</svg>', start) + len('</svg>')
s = s[:start] + new + s[end:]
open(HTML, 'w', encoding='utf-8').write(s)
print('communes tracées :', len(paths), '+ hôte', len(host_paths), '| poids SVG', round(len(new) / 1024, 1), 'Ko')
