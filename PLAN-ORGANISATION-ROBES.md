# Organiser les robes — méthode et outillage

Le lien de votre page : **https://www.instagram.com/glamdress_by_hbr/**

## 1. Je ne peux pas extraire les photos d'Instagram

Deux raisons distinctes, et aucune ne se contourne par un réglage de ma part :

1. **Accès technique refusé.** J'ai essayé d'ouvrir la page : Instagram répond **403** aux visites automatisées. Mon accès réseau est en outre limité à quelques domaines (GitHub, PyPI, npm) ; `instagram.com` n'en fait pas partie.
2. **Droits.** Les photos d'un compte — même le vôtre — sont publiées sous licence Instagram, pas sous licence libre. Un tiers ne peut pas les récupérer automatiquement et les republier ailleurs. En revanche, **vous**, vous pouvez récupérer et republier vos propres photos : elles vous appartiennent.

Ce n'est donc pas un manque d'outil : c'est vous qui devez sortir les fichiers, et moi qui les organise.

---

## 2. Récupérer vos photos : la voie propre

### Méthode A — l'export officiel Instagram (recommandé)
Sur votre téléphone, dans l'application :

**Profil → ☰ (en haut à droite) → Votre activité → Télécharger vos informations → Sélectionner des types d'informations → Publications / Photos → Format JSON (ou HTML) → Demander le téléchargement**

Vous recevez un e-mail avec un lien de téléchargement (quelques heures à 48 h). L'archive contient toutes vos publications, en qualité d'origine, avec les légendes dans un fichier texte. **Ce sont bien vos fichiers, vous en faites ce que vous voulez.**

Conseil : choisissez **JSON** si vous voulez que je lise les légendes automatiquement (noms, matières, tailles éventuellement mentionnés dans les descriptions).

### Méthode B — à la main depuis le téléphone
Pour sélectionner seulement les robes qui valent la peine : ouvrez la publication → ⋯ → **Enregistrer** (ou capture d'écran **non**, la qualité serait insuffisante). Privilégiez les fichiers d'origine si vous les avez encore sur le téléphone ou dans votre galerie.

### Méthode C — l'API Instagram Graph
Possible seulement avec un compte **professionnel** et une app Meta validée. À réserver au cas où vous voudriez publier automatiquement les nouveautés sur le site. Cela demande un jeton d'accès, qui ne doit jamais être écrit dans le code d'un site statique.

---

## 3. Comment on organise — le principe

**Une robe = une référence + un dossier de photos.**

```
assets/robes-source/
  gd-241/           ← une robe = un sous-dossier
    01.jpg
    02.jpg
    03.jpg
  gd-242/
    01.jpg
  gd-243/
    01.jpg
    02.jpg
```

Le numéro de photo donne l'ordre d'affichage. La première sert de couverture, les autres apparaissent en vignettes dans la fiche.

À défaut de sous-dossiers, un nommage à plat fonctionne aussi : `gd-241-1.jpg`, `gd-241-2.jpg`, `gd-242.jpg`.

### Références
- Format **`gd-000`** ou **`GD-241`**, trois chiffres, stable dans le temps.
- Si vous avez déjà des références en boutique, gardez-les : une cliente qui cite « la GD-241 » au téléphone doit retrouver la même robe sur le site.
- Une robe retirée garde sa référence (on la masque, on ne la renumérote pas).

---

## 4. La taxonomie proposée

### Catégories (une seule par robe)
| Catégorie | Pour qui |
|---|---|
| `Mariage` | Robe de mariée, cortège |
| `Soirée` | Gala, dîner, cocktail long |
| `Orientale` | Caftan, tenue traditionnelle |
| `Cérémonie` | Invitée de mariage, fiançailles |
| `Fiançailles` | À ajouter seulement si vous avez assez de pièces dédiées |

**Les boutons de filtre sont désormais générés depuis le catalogue** : ajouter une catégorie dans `catalog.js` crée le bouton tout seul, sans toucher au HTML. Inutile de multiplier les catégories pour autant — au-delà de six, le filtre devient illisible sur téléphone.

### Autres champs
| Champ | Valeurs conseillées |
|---|---|
| `colorName` | Ivoire, Champagne, Rose poudré, Bordeaux, Vert profond, Noir, Or, Sable, Sauge, Bleu nuit… |
| `sizes` | `XS`, `S`, `M`, `L`, `XL` (réellement disponibles, pas la taille théorique) |
| `mode` | `Location`, `Achat`, `Achat et location` |
| `priceFrom` | Prix de départ en DT, nombre seul (`420`). Laisser `0` pour « sur demande » |
| `ref` | Référence boutique |
| `photos` | Une image ou une liste d'images |
| `alt` | Décrire ce qu'on voit, utile pour Google et les lecteurs d'écran |

---

## 5. La fiche à remplir (10 colonnes)

Une ligne par robe. Recopiez ce tableau dans un tableur ou répondez-moi dans l'ordre.

| Réf. | Nom | Catégorie | Couleur | Tailles dispo | Formule | Prix dès (DT) | Photos | Statut | Remarque |
|---|---|---|---|---|---|---|---|---|---|
| gd-241 | | | | | | | 3 | disponible | |
| gd-242 | | | | | | | 1 | louée jusqu'au… | |
| gd-243 | | | | | | | 2 | | |

- **Nom** : parlez comme vos clientes. « L'allure nuptiale » se retient mieux que « Robe longue 3 ».
- **Statut** : `disponible`, `louée`, `pièce unique`, `sur commande`. À n'utiliser que si vous le tenez à jour ; sinon laissez vide.
- **Prix** : si vous ne voulez rien publier, laissez vide — le site affichera « tarifs sur demande », ce qui reste honnête.

---

## 6. L'outillage (déjà prêt)

Une fois le dossier de photos placé dans le dépôt :

```bash
python3 tools/importer-robe.py assets/robes-source
```

Le script :
1. regroupe les photos par robe (sous-dossier ou préfixe de nom) ;
2. redimensionne à 1600 px de large, JPEG progressif qualité 82 (≈ 30 Ko par photo, indispensable sur mobile en 3G) ;
3. supprime les métadonnées EXIF, dont la **géolocalisation** — une photo prise chez une cliente ne doit pas révéler son adresse ;
4. écarte les vignettes trop petites (moins de 200 px de large) ;
5. **génère les fiches prêtes à coller dans `catalog.js`**, avec les photos déjà regroupées par robe.

Testé sur un jeu d'essai : 3 robes, 6 photos, dont une vignette rejetée et un nom de fichier avec espace géré.

L'affichage multi-photos est également en place : couverture sur la grille, vignettes cliquables dans la fiche, navigation au clavier et `aria-pressed` tenu à jour.

---

## 7. Ce que je fais dès que je reçois les fichiers

1. J'importe et je renomme selon vos références.
2. Je remplis `catalog.js` : une fiche par robe, avec les photos.
3. Je classe par catégorie, couleur, taille et budget — les filtres s'activent automatiquement.
4. Je vérifie le poids total et le rendu mobile.
5. Je vous livre un tableau récapitulatif : combien de robes, combien de photos, ce qui manque (prix, tailles, descriptions).

**Comment me les transmettre** : déposez l'archive ou le dossier dans **Google Drive** (connecté à cette conversation) ou poussez les fichiers dans le dépôt. Je m'occupe du reste.

---

## 8. Ce que je ne ferai pas

- Télécharger des photos depuis Instagram par des moyens détournés (contournement de blocage, service tiers de « downloader ») : c'est contraire aux conditions d'Instagram et cela exposerait le site.
- Publier une photo où une personne est reconnaissable sans son accord.
- Reprendre les photos d'une autre boutique ou d'un compte de modèles.
- Inventer des noms, des prix ou des tailles pour « remplir » la grille : une fiche vide vaut mieux qu'une fiche fausse.

---

*Document de travail — la boutique décide de ce qui est publié.*
