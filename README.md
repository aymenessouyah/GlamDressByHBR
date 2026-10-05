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
