#!/usr/bin/env python3
# ─────────────────────────────────────────────────────────────
#  Importer et organiser les photos des robes
#  Glam Dress by HBR
#
#  Transforme un dossier de photos en catalogue prêt à publier :
#    · une référence par robe
#    · plusieurs photos par robe (défilement dans la fiche)
#    · redimensionnement 1600 px, JPEG progressif
#    · génération des fiches à coller dans catalog.js
#
#  UTILISATION
#     python3 tools/importer-robe.py <dossier_source> [--dest assets/robes]
#
#  DEUX FAÇONS D'ORGANISER LE DOSSIER SOURCE
#
#  A. Un sous-dossier par robe (recommandé)
#       source/
#         gd-241/  photo1.jpg  photo2.jpg  photo3.jpg
#         gd-242/  photo1.jpg
#         gd-243/  photo1.jpg  photo2.jpg
#     → la référence est le nom du sous-dossier, l'ordre est alphabétique.
#
#  B. Toutes les photos à plat, nommées avec la référence
#       source/
#         gd-241-1.jpg   gd-241-2.jpg   gd-242.jpg
#     → on regroupe sur tout ce qui précède le dernier « -nombre ».
#
#  Le script n'envoie rien sur Internet et ne modifie pas les originaux.
#  Il refuse les fichiers de moins de 200 px de large (vignettes floues).
# ─────────────────────────────────────────────────────────────
import argparse
import re
import shutil
import subprocess
import sys
import unicodedata
from collections import OrderedDict
from pathlib import Path

EXTS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_W = 1600
QUALITY = 82
MIN_W = 200


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text


def have_imagemagick() -> bool:
    return shutil.which("convert") is not None or shutil.which("magick") is not None


def convert_cmd() -> list:
    return ["magick"] if shutil.which("magick") else ["convert"]


def image_width(path: Path):
    """Largeur via identify, None si illisible."""
    exe = convert_cmd()[0]
    ident = "identify" if exe == "convert" else "magick"
    try:
        out = subprocess.run(
            [ident, "-format", "%w", str(path)],
            capture_output=True, text=True, check=True
        ).stdout.strip()
        return int(out)
    except Exception:
        return None


def collect(src: Path):
    """Retourne un OrderedDict {référence: [chemins...]}."""
    groups = OrderedDict()
    subdirs = sorted([d for d in src.iterdir() if d.is_dir()], key=lambda d: d.name.lower())

    if subdirs:
        for d in subdirs:
            photos = sorted(
                [p for p in d.iterdir() if p.is_file() and p.suffix.lower() in EXTS],
                key=lambda p: p.name.lower(),
            )
            if photos:
                groups[slugify(d.name)] = photos
        # fichiers isolés à la racine, en plus des sous-dossiers
        loose = sorted(
            [p for p in src.iterdir() if p.is_file() and p.suffix.lower() in EXTS],
            key=lambda p: p.name.lower(),
        )
        for p in loose:
            groups.setdefault(slugify(p.stem), []).append(p)
    else:
        files = sorted(
            [p for p in src.iterdir() if p.is_file() and p.suffix.lower() in EXTS],
            key=lambda p: p.name.lower(),
        )
        for p in files:
            m = re.match(r"^(.*?)-\d+$", p.stem)
            key = m.group(1) if m else p.stem
            groups.setdefault(slugify(key), []).append(p)
    return groups


def main():
    ap = argparse.ArgumentParser(description="Importe et organise les photos des robes.")
    ap.add_argument("source", help="dossier contenant les photos")
    ap.add_argument("--dest", default="assets/robes", help="dossier de sortie (défaut: assets/robes)")
    ap.add_argument("--force", action="store_true", help="écrase les fichiers déjà présents")
    args = ap.parse_args()

    src = Path(args.source).expanduser()
    if not src.is_dir():
        sys.exit(f"Dossier introuvable : {src}")
    if not have_imagemagick():
        sys.exit("ImageMagick est requis (« convert » ou « magick » introuvable).")

    root = Path(__file__).resolve().parent.parent
    dest = (root / args.dest) if not Path(args.dest).is_absolute() else Path(args.dest)
    dest.mkdir(parents=True, exist_ok=True)

    groups = collect(src)
    if not groups:
        sys.exit(f"Aucune image trouvée dans {src}")

    total = sum(len(v) for v in groups.values())
    print(f"{len(groups)} robe(s), {total} photo(s) à traiter\n")

    kept = OrderedDict()
    ignored = []
    for ref, photos in groups.items():
        for i, photo in enumerate(photos, 1):
            width = image_width(photo)
            if width is not None and width < MIN_W:
                ignored.append((photo, f"largeur {width} px < {MIN_W} px"))
                continue
            name = f"{ref}.jpg" if len(photos) == 1 else f"{ref}-{i}.jpg"
            out = dest / name
            if out.exists() and not args.force:
                print(f"  · conservé (existe déjà) : {name}")
                kept.setdefault(ref, []).append(f"{dest.relative_to(root)}/{name}")
                continue
            try:
                subprocess.run(
                    convert_cmd() + [
                        str(photo), "-auto-orient",
                        "-resize", f"{MAX_W}x{MAX_W}>",
                        "-strip", "-interlace", "Plane",
                        "-quality", str(QUALITY), str(out),
                    ],
                    check=True, capture_output=True,
                )
            except subprocess.CalledProcessError as e:
                ignored.append((photo, e.stderr.decode()[:80]))
                continue
            ko = out.stat().st_size // 1024
            print(f"  ✓ {photo.name} → {out.relative_to(root)} ({ko} Ko)")
            kept.setdefault(ref, []).append(f"{dest.relative_to(root)}/{name}")

    if ignored:
        print("\nIgnorés :")
        for p, why in ignored:
            print(f"  ✗ {p.name} — {why}")

    if not kept:
        sys.exit("\nAucune photo exploitable : rien n'a été généré.")

    print("\n── À coller dans catalog.js, puis à compléter ─────────────")
    print("   Les champs vides (name, description, prix) sont à remplir.")
    print("   Laissez priceFrom à 0 si vous ne publiez pas de prix.\n")
    print("const CATALOG = [")
    for idx, (ref, paths) in enumerate(kept.items(), 1):
        if len(paths) == 1:
            photos_js = f'"{paths[0]}"'
        else:
            photos_js = "[" + ", ".join(f'"{p}"' for p in paths) + "]"
        ref_label = ref.upper().replace("-", "-")
        print(f'  {{ id:"R{idx:02d}", ref:"{ref_label}", name:"", cat:"Mariage",')
        print(f'    color:"#eee8da", bg:"#e3ded2", colorName:"", description:"",')
        print(f'    sizes:[], mode:"Location", priceFrom:0, photos:{photos_js} }},')
    print("];")
    print(
        "\nRappel : ne publiez que vos propres photos, et vérifiez l'accord des\n"
        "personnes reconnaissables. Une photo d'un autre compte ou trouvée sur\n"
        "Google Images n'a pas sa place ici."
    )


if __name__ == "__main__":
    main()
