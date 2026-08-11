import os
import random
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except AttributeError:
    pass

# ==========================================
# CONFIGURATION — MODIFIE ICI SI BESOIN
# ==========================================


DOSSIER_RACINE = "."

# Tes catégories : "nom du dossier": "Titre affiché sur le site"
CATEGORIES = {
    "photos": "Photos",
    "sculptures": "Sculptures / Installations",
    "graphiques": "Arts graphiques"
}

FICHIER_SORTIE = "travaux.html"

# Pages de galerie individuelles : dossier -> (fichier html, titre h1, préfixe alt)
PAGES_GALERIE = {
    "photos": ("photos.html", "Photos", "Photo"),
    "graphiques": ("graphiques.html", "Arts graphiques", "Graphique"),
    "sculptures": ("sculpture.html", "Sculpture / Installation", "Sculpture"),
}

# Extensions acceptées (insensible à la casse : .JPG fonctionne aussi)
EXTENSIONS = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp')

# ==========================================
# NE RIEN TOUCHER EN DESSOUS
# ==========================================

def lister_images(chemin_dossier):
    """Liste les images d'un dossier, dans un ordre mélangé aléatoirement"""
    chemin_complet = os.path.join(DOSSIER_RACINE, chemin_dossier)

    if not os.path.exists(chemin_complet):
        print(f"⚠️  Dossier introuvable : {chemin_complet}")
        return []

    images = []
    for fichier in os.listdir(chemin_complet):
        ext = os.path.splitext(fichier)[1].lower()
        if ext in EXTENSIONS:
            images.append(fichier)

    random.shuffle(images)
    return images

def creer_onglet(dossier, titre, actif):
    """Crée le bouton d'onglet correspondant à une catégorie"""
    classes = "tab-btn active" if actif else "tab-btn"
    return f'  <button class="{classes}" data-tab="{dossier}">{titre}</button>\n'

def creer_galerie(dossier, titre, actif):
    """Crée le bloc HTML de la galerie (prévisualisation aléatoire) d'une catégorie"""
    images = lister_images(dossier)
    classes = "gallery active" if actif else "gallery"

    if not images:
        return f'<div class="{classes}" id="tab-{dossier}">\n  <p class="vide">Aucune image.</p>\n</div>\n'

    # Chemin pour le HTML
    prefixe = dossier if DOSSIER_RACINE == "." else f"{DOSSIER_RACINE}/{dossier}"

    html = f'<div class="{classes}" id="tab-{dossier}">\n'
    for img in images:
        src = f"{prefixe}/{img}"
        nom = os.path.splitext(img)[0]
        html += f'  <img src="{src}" alt="{nom}" loading="lazy">\n'
    html += '</div>\n'
    return html

def creer_page_galerie(dossier, fichier_sortie, titre, alt_prefixe):
    """Crée une page de galerie autonome (photos.html, graphiques.html, sculpture.html)
    avec la vraie liste des fichiers du dossier, en gardant le comportement lightbox existant."""
    images = lister_images(dossier)
    images_js = ", ".join(f'"{img}"' for img in images)

    page = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{titre}</title>
<link rel="stylesheet" href="style.css">
<style>
  :root {{ --m: #111; }}
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ font-family: var(--font); color: var(--m); background:#fff; padding:6rem 2rem 3rem; }}
  .back {{ display:inline-block; margin-bottom:2rem; text-decoration:none; color:var(--m); border-bottom:1px solid #ccc; font-size:0.9rem; }}
  .back:hover {{ border-bottom:1px solid var(--m); }}
  h1 {{ font-weight:400; margin-bottom:2rem; font-size:1.6rem; }}
  .grid {{ display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:1rem; }}
  .item {{ aspect-ratio:1; overflow:hidden; cursor:pointer; background:#f5f5f5; }}
  .item img {{ width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.3s; }}
  .item:hover img {{ transform:scale(1.03); }}
  #lightbox {{ display:none; position:fixed; inset:0; background:rgba(255,255,255,0.96); z-index:200; cursor:zoom-out; }}
  #lightbox img {{ position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); max-width:90vw; max-height:90vh; object-fit:contain; box-shadow:0 4px 20px rgba(0,0,0,0.1); }}
  @media (max-width:600px){{ body {{ padding:5rem 1.2rem 2rem; }} }}
</style>
</head>
<body>

<nav>
  <div class="logo"><a href="index.html">Chahîd EL BATTI</a></div>
  <div>
    <a href="index.html">Accueil</a>
    <a href="travaux.html">Travaux</a>
    <a href="music.html">Music</a>
    <a href="arena.html">Are.na</a>
    <a href="parcours.html">Parcours</a>
    <a href="about.html">About</a>
  </div>
</nav>

<a href="travaux.html" class="back">← Retour aux travaux</a>
<h1>{titre}</h1>

<div class="grid" id="gallery"></div>

<div id="lightbox" onclick="this.style.display='none'">
  <img id="lightbox-img" src="" alt="">
</div>

<script>
const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

// Liste des vraies images du dossier {dossier}/
const images = [{images_js}];

images.forEach((fichier, i) => {{
  const div = document.createElement('div');
  div.className = 'item';
  const img = document.createElement('img');
  img.src = `{dossier}/${{fichier}}`;
  img.alt = `{alt_prefixe} ${{i + 1}}`;
  img.loading = 'lazy';

  // Si l'image n'existe pas, on supprime la case proprement
  img.onerror = function() {{ div.remove(); }};

  // Au clic : plein écran
  img.onclick = function(e) {{
    e.stopPropagation();
    lightboxImg.src = this.src;
    lightbox.style.display = 'block';
  }};

  div.appendChild(img);
  gallery.appendChild(div);
}});
</script>

</body>
</html>"""

    with open(fichier_sortie, "w", encoding="utf-8") as f:
        f.write(page)

    print(f"✅ {fichier_sortie} créé avec {len(images)} image(s).")

def generer():
    print("🔧 Génération de travaux.html...")

    items = list(CATEGORIES.items())

    # Barre d'onglets (les 3 parties accessibles)
    sub_nav = '<div class="sub-nav">\n'
    for i, (dossier, titre) in enumerate(items):
        sub_nav += creer_onglet(dossier, titre, actif=(i == 0))
    sub_nav += '</div>\n'

    # Galeries (prévisualisation aléatoire de chaque section)
    galeries = ""
    for i, (dossier, titre) in enumerate(items):
        galeries += creer_galerie(dossier, titre, actif=(i == 0))

    # Template HTML complet
    page = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Travaux — Chahîd EL BATTI</title>
<link rel="stylesheet" href="style.css">
<style>
:root {{ --m: #111; }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: var(--font); color: var(--m); background: #fff; padding: 6rem 2rem 3rem; line-height: 1.5; }}
h1 {{ font-weight: 400; margin-bottom: 1rem; font-size: 1.6rem; }}
@media (max-width: 600px) {{ body {{ padding: 5rem 1.2rem 2rem; }} }}
</style>
</head>
<body>

<nav>
  <div class="logo"><a href="index.html">Chahîd EL BATTI</a></div>
  <div>
    <a href="index.html">Accueil</a>
    <a href="travaux.html">Travaux</a>
    <a href="music.html">Music</a>
    <a href="arena.html">Are.na</a>
    <a href="parcours.html">Parcours</a>
    <a href="about.html">About</a>
  </div>
</nav>

<h1>Travaux</h1>

{sub_nav}
{galeries}

<script>
document.querySelectorAll('.tab-btn').forEach(btn => {{
  btn.addEventListener('click', () => {{
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.gallery').forEach(g => g.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  }});
}});
</script>

</body>
</html>"""

    with open(FICHIER_SORTIE, "w", encoding="utf-8") as f:
        f.write(page)

    total = sum(len(lister_images(d)) for d in CATEGORIES)
    print(f"✅ Terminé ! {FICHIER_SORTIE} créé avec {total} image(s).")

    for dossier, (fichier_sortie, titre, alt_prefixe) in PAGES_GALERIE.items():
        creer_page_galerie(dossier, fichier_sortie, titre, alt_prefixe)

if __name__ == "__main__":
    generer()
