# Régénérer la carte du secteur

1. Télécharger les contours officiels (une fois) :

   ```sh
   mkdir -p scripts/geo
   curl -s "https://geo.api.gouv.fr/departements/92/communes?fields=nom,code,contour,centre&format=json&geometry=contour" -o scripts/geo/dep92.json
   for c in 95063 95018 78146 78124 78311 78190 78650 78586; do
     curl -s "https://geo.api.gouv.fr/communes/$c?fields=nom,code,contour,centre&format=json&geometry=contour" -o "scripts/geo/c$c.json"
   done
   ```

2. Régénérer le SVG dans `index.html` :

   ```sh
   python scripts/build_map.py
   ```

Le script projette les contours autour de l'atelier (95 av. de la Liberté), les simplifie
(Douglas-Peucker) et remplace le bloc `<svg class="zone__svg">` de la page.
