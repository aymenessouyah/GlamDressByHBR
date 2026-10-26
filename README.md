# Glam Dress by HBR — refonte

Site statique sans dépendance, compatible GitHub Pages. Ouvrir index.html via un serveur statique pour tester.

## Inclus
- Deux logos extraits du PDF fourni, noir sur fond clair et blanc sur fond sombre.
- Responsive, navigation mobile, recherche et filtres, fiches d’inspiration, sélection locale avec taille, dialogues natifs accessibles, réduction des animations.
- WhatsApp confirmé : +216 54 218 118. Formulaire sans faux message de réussite, message prérempli et lien de secours. Aucun backend ni paiement.
- Métadonnées, données structurées, sitemap, pages légales préparatoires.

## À valider AVANT publication
1. Remplacer les illustrations d’inspiration par les photographies autorisées des robes réelles ; saisir références, tailles, tarifs et conditions. Les quatre cartes sont explicitement des inspirations, pas du stock. Modifier les données et le rendu dans app.js.
2. Confirmer l’adresse, les services, les horaires et fournir les profils sociaux. Aucun faux avis, chiffre marketing, email ni lien social factice n’a été conservé.
3. Compléter mentions-legales.html et confidentialite.html avec les informations réelles de l’entreprise et faire valider leur conformité locale. Les pages ne sont pas des textes juridiques définitifs.
4. Vérifier la réception WhatsApp sur le téléphone de la boutique et un vrai mobile. La cliente doit envoyer le message ; la confirmation du créneau se fait ensuite manuellement.
5. Faire un audit Lighthouse sur la version publiée et tester Safari/iOS, Android et le clavier. Aucun score de performance n’est revendiqué.

## Publication
Sauvegarder le dépôt existant. Copier le contenu de ce dossier (index.html, style.css, app.js, assets/, pages légales, robots.txt, sitemap.xml) à la racine de la source GitHub Pages du dépôt GlamDressByHBR. Commit puis push. Vérifier Settings > Pages. Aucun accès GitHub n’a été utilisé et le site public n’a pas été modifié.

Le visuel d’accueil est généré par IA, signalé comme hors catalogue. La sélection est stockée dans localStorage ; elle ne contient pas le prénom ni le message du formulaire. Les liens WhatsApp contiennent les informations du formulaire après action explicite. Aucune newsletter factice ni fonctionnalité de paiement n’est présente.

## Vérifications réalisées
Tests automatisés Chromium : recherche, catégories, aucun résultat, fiche et taille, persistance après rechargement, fermeture par Échap, composition du message WhatsApp (ouverture interceptée, aucun message envoyé), lien de secours, menu mobile et absence de débordement horizontal à 320, 390 et 768 px. Vérification visuelle de la capture bureau. Aucun test de réception réelle WhatsApp, Safari, ni audit juridique.

## Page « Styliste » (d’après AI-StyleSense)

Page `styliste-ia.html` : la cliente charge une photo, choisit son occasion, sa saison et son style, et reçoit une **palette de couleurs** et **3 suggestions de tenues**.

### Deux modes
- **Local (par défaut, sans clé)** : l’analyse est faite **entièrement dans le navigateur** (extraction des couleurs de la photo + estimation indicative du teint + suggestions). **Aucune clé requise, aucun serveur, aucune photo envoyée.** Fonctionne immédiatement.
- **Enrichi (optionnel, Google Gemini 2.5 Flash)** : si une clé est renseignée dans `assets/styliste-config.js` (constante `GEMINI_API_KEY`, clé commençant par `AIza`), la page bascule sur l’analyse par Gemini. La photo est alors envoyée à Google après le consentement affiché.

### Points de vigilance
- **Mode local** : l’estimation du teint est indicative ; les suggestions sont des inspirations, non contractuelles.
- **Mode enrichi** : prévoir la clé (gratuite jusqu’à un certain volume, puis facturée), une clé restreinte à l’API Gemini avec plafond de dépense (sur un site statique la clé est visible dans le code), et la base légale / information des clientes pour l’envoi de la photo à Google.
- Les suggestions ne remplacent pas l’essayage en boutique.

---

## Étape A — améliorations techniques (livrée)

Aucun contenu inventé n'a été ajouté : les seules informations factuelles du site restent celles fournies par la boutique (adresse, téléphone, horaires « nous consulter », tarifs « sur demande »).

### Nouveaux fichiers
| Fichier | Rôle |
|---|---|
| `catalog.js` | **Source unique du catalogue.** Les fiches ne sont plus dupliquées dans `app.js`. Champs facultatifs `sizes`, `mode`, `priceFrom`, `colorName`, `ref`, `photo` : les remplir active automatiquement les filtres taille / formule / budget et remplace l'illustration par une photo réelle. |
| `assets/tailles.js` | Calculateur de taille (poitrine / taille / hanches → repère XS–XL, mention honnête si la mesure sort du tableau) + lien WhatsApp prérempli avec les mesures. |
| `manifest.webmanifest` + `assets/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | Site installable sur l'écran d'accueil (Android/iOS), sans service worker : pas de contenu mis en cache, donc pas de site figé après une mise à jour. |
| `404.html` | Page d'erreur avec retour aux collections, WhatsApp et liens utiles. À activer dans GitHub Pages (`404.html` à la racine suffit). |
| `conseil-robe-mariee.html`, `conseil-robe-soiree.html`, `conseil-achat-location.html`, `conseil-entretien-robe.html` | Les 4 conseils ont désormais **une URL chacun** (avant : une seule page à ancres, impossible à positionner séparément). `blog.html` devient le sommaire. Chaque article a `BreadcrumbList`, `Article`, un encadré « conseil de l'atelier » et des liens croisés. |

### Modifications
- **`sitemap.xml`** : passe de 1 à 7 URL (l'accueil, tailles, nous trouver, blog + 4 articles). `styliste-ia.html` en est volontairement exclue car la page est en `noindex`.
- **`<link rel="canonical">`** sur toutes les pages indexables.
- **Données structurées** : `ClothingStore` enrichi (`url`, `image`, `logo`, `priceRange`, `currenciesAccepted: TND`, `areaServed`, `hasMap`, `makesOffer`) + `FAQPage` sur l'accueil (les 4 questions de la FAQ) + `ItemList` sur le sommaire + `BreadcrumbList` + `Article` par conseil.
- **Filtres avancés** (accueil) : couleur, taille, formule, budget. Les listes sont **construites à partir des données réelles** de `catalog.js` ; un filtre sans donnée correspondante reste masqué, donc rien ne casse tant que le catalogue n'est pas rempli.
- **Partage de sélection** : bouton « Partager ma sélection » (Web Share API sur mobile, sinon copie du lien). Le lien ne contient **aucune donnée personnelle**, uniquement des références courtes et un code de taille (`?sel=I01.2,I03.0`). Sélection limitée à 4 inspirations, avec message explicite (avant : dépassement silencieux possible).
- **Fiche inspiration** : bloc factuel (tarifs, tailles, formule) au lieu d'une simple phrase ; référence boutique affichée si `ref` est renseigné.
- **Robustesse** : les dialogues s'ouvrent et se ferment même sur un navigateur dépourvu de l'API `<dialog>` native.

### Tests exécutés (jsdom, sans navigateur graphique)
Catalogue rendu, recherche, état « aucun résultat », ajout à la sélection et enregistrement de la taille, ouverture de fiche, import d'un lien partagé (`?sel=`) avec restauration des tailles, construction des filtres, calculateur de taille (dans le tableau et hors tableau), réinitialisation, liens et ressources internes, présence de `canonical` et du manifest, validité de tous les blocs JSON-LD, JSON du manifest, XML du sitemap, `node --check` sur tous les scripts. **Aucune erreur console.**

### Non testé / à faire à la main
- Rendu visuel réel : aucun navigateur graphique dans l'environnement de travail. À vérifier sur **Safari/iOS** (barre d'adresse, `position: sticky`, `<dialog>`), Android et au clavier.
- `Article` JSON-LD sans `datePublished` : à ajouter quand les dates de publication seront fixées.
- Toujours en attente de la boutique : horaires, prix, réseaux sociaux, photos réelles, conditions de location.
