# Glam Dress by HBR — quoi ajouter au site ?
Audit de la version actuelle et feuille de route, par ordre d’impact.

---

## 1. Ce qui est déjà en place (à ne pas refaire)

- Identité visuelle cohérente (logos clair/sombre, palette ivoire/vert, typographie éditoriale), responsive jusqu’à 320 px.
- Parcours complet : inspirations → filtres + recherche → fiche → sélection avec taille → formulaire → message WhatsApp prérempli.
- Pages de soutien : guide des tailles, nous trouver (carte intégrée), conseils, mentions légales, confidentialité.
- « L’Œil de l’Atelier » : analyse de photo 100 % locale, sans envoi ni clé API.
- Accessibilité de base : lien d’évitement, dialogues natifs, `aria-live`, respect de `prefers-reduced-motion`, fermeture par Échap.
- QR codes (site, WhatsApp), carte de visite `.vcf`, bouton WhatsApp flottant, bouton retour en haut.
- Aucune fausse promesse : pas de faux avis, pas de faux stock, pas de paiement factice. **C’est un vrai atout de confiance — gardez cette ligne.**

---

## 2. Priorité 1 — Ce qui bloque encore la conversion

Ce sont les seuls points qui empêchent une visiteuse de passer à l’acte.

| # | À ajouter | Pourquoi | Effort |
|---|---|---|---|
| 1 | **Photos réelles des robes** (remplacer les 4 illustrations SVG) | Une boutique de robes qui montre des dessins ne peut pas vendre. C’est LE point n°1. | Photos à fournir |
| 2 | **Fiche modèle complète** : référence, tailles disponibles, prix ou fourchette en DT, achat/location, délai, état | « Tarifs sur demande » partout = friction. Même une fourchette (« à partir de 350 DT ») augmente fortement les demandes qualifiées. | Faible (données) |
| 3 | **Statut de disponibilité** : « Disponible », « Louée jusqu’au 12/06 », « Sur commande » | Évite les demandes pour des pièces indisponibles et donne un signe de vie au catalogue. | Faible |
| 4 | **Avis clientes réels** (prénom + occasion + 1–2 phrases, avec accord écrit) | Le plus fort levier de confiance, à condition qu’ils soient authentiques. | Faible |
| 5 | **Horaires réels** (au lieu de « nous consulter ») + jours de fermeture | Une cliente qui doit écrire pour savoir si c’est ouvert abandonne. | Faible |
| 6 | **Liens Instagram / Facebook / TikTok réels** dans le pied de page (`sameAs` en JSON-LD) | C’est là que vos clientes vérifient que la boutique existe. | Faible |
| 7 | **Page « Location » dédiée** : durée, caution, nettoyage, retouches, conditions de retour | Aujourd’hui tout est renvoyé vers WhatsApp ; une page claire filtre les questions répétitives. | Moyen |
| 8 | **Photos de la boutique / de l’atelier / d’un essayage** dans « La maison » | Montre le lieu, réduit l’angoisse du premier rendez-vous. | Photos à fournir |

> Sans les points 1, 2, 5 et 6, le reste du site reste une belle vitrine vide. C’est là que doit aller votre énergie.

---

## 3. Priorité 2 — Rendez-vous et contact

| # | À ajouter | Détail |
|---|---|---|
| 9 | **Créneaux réels** | Un lien Google Agenda « Réserver un créneau » ou un Calendly gratuit. Aujourd’hui le formulaire ne fait que composer un WhatsApp : la cliente ne sait pas quand vous êtes libre. |
| 10 | **Canal de secours par e-mail** | Un `mailto:` ou un vrai formulaire (Formspree/Brevo) pour les clientes sans WhatsApp ou hors horaires. |
| 11 | **Confirmation et rappel** | Après envoi, un texte clair (« nous répondons sous 24 h ouvrées ») + la possibilité d’ajouter le rendez-vous au calendrier (fichier `.ics`). |
| 12 | **Avant l’essayage** | Une courte liste « quoi apporter / comment se préparer » (sous-vêtements adaptés, chaussures, photos d’inspiration, délai avant l’événement). |
| 13 | **Carte cadeau / bon d’essayage** | Très demandé en Tunisie pour les fiançailles et les mariages ; peut rester simple (bon imprimable + WhatsApp). |
| 14 | **Fidélité / parrainage** | « Une amie vous recommande » : un simple code mentionné dans le message WhatsApp, sans système technique. |

---

## 4. Priorité 3 — Être trouvée (SEO local)

| # | À corriger / ajouter | Constat actuel |
|---|---|---|
| 15 | **`sitemap.xml` incomplet** | Il ne contient que la page d’accueil. `tailles.html`, `nous-trouver.html`, `blog.html`, `styliste-ia.html` manquent → invisibles pour Google. **Correction rapide et à fort effet.** |
| 16 | **Balises `canonical` absentes** | Sur toutes les pages. Risque de duplication (index.html / `/` / `#ancre`). |
| 17 | **JSON-LD enrichi** | Actuellement : nom, téléphone, adresse. Ajouter `url`, `image`, `priceRange`, `openingHoursSpecification`, `sameAs`, `geo`, `currenciesAccepted`, `paymentAccepted`, `hasMap`. |
| 18 | **Données structurées secondaires** | `FAQPage` (la FAQ existe déjà en HTML), `Article` pour les conseils, `BreadcrumbList` sur les pages internes. |
| 19 | **Pages d’article séparées** | Les 4 conseils vivent sur une seule page `blog.html#ancre` : impossible de les positionner individuellement. 4 URLs = 4 portes d’entrée. |
| 20 | **Fiche Google Business Profile** | Le meilleur levier local à Tunis ; à lier depuis « Nous trouver ». |
| 21 | **Version arabe (et anglaise)** | Une grande partie de la clientèle tunisienne cherche en arabe. Prévoir un vrai `dir="rtl"` et `hreflang`, pas une traduction automatique. |
| 22 | **`styliste-ia.html` en `noindex`** | La page la plus originale du site est volontairement exclue de l’index. À réexaminer : soit on l’indexe, soit on assume que c’est un outil privé. |
| 23 | **Images en WebP/AVIF** | `editorial.jpg` pèse 190 Ko ; les photos réelles pèseront bien plus. Prévoir compression + `srcset`. |
| 24 | **Page 404 personnalisée** | Aujourd’hui une URL erronée renvoie la 404 brute de GitHub. Une 404 avec recherche + WhatsApp récupère la visiteuse. |

---

## 5. Priorité 4 — Fonctionnalités qui font revenir

| # | À ajouter | Bénéfice |
|---|---|---|
| 25 | **Partager ma sélection** (Web Share API + lien encodé dans l’URL) | La cliente envoie sa sélection à sa mère/sa sœur sur WhatsApp : viralité gratuite. Aujourd’hui la sélection reste dans son navigateur. |
| 26 | **Bouton « Demander ce modèle » sur chaque fiche** | Message WhatsApp contextualisé (référence + taille) sans passer par le formulaire complet. |
| 27 | **Filtres avancés** : taille, couleur, budget, achat/location | Utile dès que le catalogue dépasse ~15 pièces. |
| 28 | **Mode PWA (`manifest.json` + service worker)** | Site installable sur l’écran d’accueil, fonctionne en connexion faible — courant en Tunisie. |
| 29 | **Galerie « lookbook »** | Photos portées, par occasion ; alimentée par vos vraies séances. |
| 30 | **« Vu récemment » / favoris persistants** | Déjà en `localStorage` ; ajouter une section « reprises de votre dernière visite ». |
| 31 | **Calculateur de taille interactif** | Le guide des tailles est statique ; trois champs (poitrine/taille/hanches) → taille conseillée. |
| 32 | **Aide au choix par occasion** | Un mini-parcours « Mariage / Fiançailles / Soirée » vers les bons modèles, en complément de l’Œil de l’Atelier. |
| 33 | **Avis / témoignages vidéo courts** | Format le plus convaincant en mode/robe. |

---

## 6. Priorité 5 — Mesure et finitions techniques

- **Mesure d’audience respectueuse** (Plausible, Umami ou GoatCounter) : sans données, impossible de savoir si ce sont les photos, la page tailles ou WhatsApp qui convertit. À déclarer dans la page confidentialité.
- **`manifest.json` + jeu d’icônes** (192/512, `apple-touch-icon`).
- **`preload` de l’image héros** + `fetchpriority` déjà présent ; ajouter `srcset` quand les photos arrivent.
- **Tests** : Safari/iOS réel (les `<dialog>` et `position: sticky` posent souvent problème), Android, clavier, Lighthouse sur la version publiée.
- **`protect.js`** : vérifier qu’il ne bloque pas les lecteurs d’écran, la sélection de texte utile ou le clic droit légitime ; l’anti-copie n’a qu’un effet dissuasif.
- **Clé Gemini** : ne jamais laisser une clé `AIza` en clair dans un dépôt public. Le mode local suffit ; si le mode enrichi est activé, passer par une fonction serverless (Cloudflare Worker) avec plafond.

---

## 7. Ce qu’il ne faut PAS ajouter

- De faux avis, faux compteurs (« 500 mariées »), faux stocks ou faux délais.
- Un paiement en ligne sans backend, sans CGV et sans cadre légal : sur un site statique c’est un risque, pas une fonctionnalité.
- Une newsletter sans service d’envoi réel (le README a déjà tranché : pas de faux formulaire).
- Un chatbot générique qui répond à la place de la boutique.
- Une clé API visible dans le code source.
- Un lecteur vidéo lourd en page d’accueil : il tuerait la performance mobile.

---

## 8. Plan proposé

**Étape A — fait ✅**
- [x] `sitemap.xml` complet (1 → 7 URL)
- [x] `canonical` sur toutes les pages indexables
- [x] JSON-LD : `ClothingStore` enrichi, `FAQPage`, `ItemList`, `BreadcrumbList`, `Article`
- [x] Page 404 personnalisée
- [x] Partage de sélection (lien sans donnée personnelle, Web Share API)
- [x] `manifest.webmanifest` + icônes 192/512/maskable/apple-touch
- [x] Filtres avancés (couleur, taille, formule, budget), construits depuis les données
- [x] Calculateur de taille + envoi des mesures sur WhatsApp
- [x] Conseils éclatés en 4 pages d'article + sommaire
- [x] Catalogue centralisé dans `catalog.js` avec champs prêts pour les photos réelles
- [x] Ouverture de secours pour `<dialog>` sur navigateurs anciens
- [ ] Rendu visuel à valider dans un vrai navigateur (pas de navigateur graphique dans l'environnement)
- [ ] `datePublished` des articles, à ajouter quand les dates seront fixées

**Étape B — dès que vous fournissez les informations**
Horaires, Instagram/Facebook, fourchettes de prix, conditions de location, photos de la boutique, avis authentiques.

**Étape C — dès que vous fournissez les photos**
Catalogue réel avec fiches complètes, lookbook, `srcset` WebP, page par modèle (SEO).

**Étape D — plus tard**
Version arabe (RTL), réservation de créneaux réelle, avis vidéo, PWA hors ligne.

---

*Document de travail — les éléments « à fournir » dépendent d’informations que seule la boutique détient. Aucune donnée inventée n’a été ajoutée au site.*
