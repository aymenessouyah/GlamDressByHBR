# Étape B — les informations à fournir

Toute la mécanique est en place. Il ne reste qu'à **remplir un seul fichier** : `assets/boutique.js`.

Règle du projet : on n'inscrit que des faits validés par la boutique. Un champ laissé vide **n'affiche rien du tout** — pas de bloc vide, pas de « à venir », pas de texte provisoire. Le site reste donc en ligne sans risque pendant que vous rassemblez les informations.

---

## 1. Comment remplir

Ouvrir `assets/boutique.js`, remplir les champs, enregistrer, rafraîchir la page (Ctrl+F5 / Cmd+Shift+R).

| Champ | Ce que ça change sur le site |
|---|---|
| `horaires` | Remplace « horaires à confirmer » sur **Nous trouver** et « nous consulter » sur l'**accueil**. Ajoute aussi les horaires au référencement Google. |
| `fermetures` / `rendezVous` | Une ligne de précision sous les horaires. |
| `email` | Ajoute l'adresse sur **Nous trouver**. |
| `reseaux` | Ajoute les liens dans le **pied de page de toutes les pages** + `sameAs` pour Google. |
| `priceRange` | Affiché dans le bandeau du catalogue et sur la page **Location**. |
| `location` | Remplit la page **Location**, ligne par ligne. |
| `avis` | Fait apparaître une section témoignages sur l'accueil. |
| `photos` | Fait apparaître une galerie « la boutique » sur l'accueil. |

---

## 2. Modèle à copier

Voici un exemple **entièrement fictif**, uniquement pour montrer la forme. Ne pas recopier ces valeurs.

```js
horaires: [
  { jours: "Lundi – Samedi", heures: "10h – 19h",
    schema: { days: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
              opens: "10:00", closes: "19:00" } },
  { jours: "Dimanche", heures: "sur rendez-vous" }
],
fermetures: "Fermé le vendredi après-midi.",
rendezVous: "Essayage uniquement sur rendez-vous.",

email: "contact@exemple.tn",

reseaux: {
  instagram: "https://www.instagram.com/…",
  facebook: "https://www.facebook.com/…",
  tiktok: ""
},

priceRange: "Location à partir de 350 DT · achat à partir de 900 DT",

location: {
  duree: "48 h, du samedi au lundi",
  delai: "Réservation 3 semaines à l'avance",
  caution: "Chèque de garantie restitué au retour",
  nettoyage: "Nettoyage inclus",
  retouches: "Retouches simples incluses, autres sur devis",
  retour: "Retour le lendemain avant 18 h, en boutique"
},

avis: [
  { prenom: "Ines", occasion: "Mariage, juin 2026",
    texte: "Un essayage calme, sans pression, et une robe prête à temps." }
],

photos: [
  { src: "assets/boutique-1.jpg", alt: "Espace d'essayage avec portants et miroir",
    legende: "L'espace d'essayage" }
]
```

---

## 3. Ce qu'il me faut de votre part

Le plus simple : envoyez-moi ces réponses en vrac, je remplis le fichier et je vérifie le rendu.

### Horaires
1. Quels jours êtes-vous ouverte, et de quelle heure à quelle heure ?
2. Fermez-vous certains jours, ou une pause le midi ?
3. Recevez-vous uniquement sur rendez-vous ? Y a-t-il des jours dédiés aux essayages ?
4. Une fermeture annuelle à signaler ?

### Contact et réseaux
5. Une adresse e-mail à publier (ou « aucune », c'est très bien aussi) ?
6. Les adresses exactes Instagram / Facebook / TikTok (copier-coller depuis le navigateur) ?

### Prix
7. Une fourchette de prix que vous acceptez de rendre publique ? Même approximative. Si vous préférez ne rien publier, on garde « tarifs sur demande ».
8. Les prix varient-ils entre achat et location ? Précisez les deux si possible.

### Location
9. Durée standard d'une location (ex. 48 h, week-end, 3 jours) ?
10. Caution demandée, et sous quelle forme ?
11. Nettoyage : inclus, ou à la charge de la cliente ?
12. Retouches : autorisées ? incluses ou en supplément ?
13. Modalités de retour (jour, heure, lieu, état attendu) ?
14. Délai conseillé pour réserver avant l'événement ?

### Avis
15. Deux ou trois témoignages de clientes, **avec leur accord**. Le site précise qu'ils sont recueillis avec l'accord des clientes. Si vous n'en avez pas encore, on laisse la section vide : c'est mieux que des avis inventés.

### Photos
16. Des photos de la boutique ou de l'espace d'essayage (intérieur, portants, miroir). À défaut, on laisse la galerie vide.

---

## 4. Photos : le format qui va bien

- **Largeur** 1600 px suffit (3000 px est inutile et ralentit le site sur mobile).
- **Poids** viser moins de 300 Ko par image (`editorial.jpg` pèse 190 Ko : c'est la bonne cible).
- **Format** JPEG ou WebP. Un convertisseur gratuit suffit ; je peux aussi le faire.
- **Nom** explicite : `boutique-essayage.jpg`, `robe-gd-241.jpg`…
- **Droits** vérifier que vous avez le droit de publier la photo (photographe, personne reconnaissable). Une personne identifiable sur une photo publiée doit avoir donné son accord.
- **Alt** décrire ce qu'on voit : « portant de robes longues dans un salon clair » plutôt que « photo 1 ».

---

## 5. Vérifications après remplissage

1. Ouvrir **Nous trouver** : les horaires doivent remplacer le texte « à confirmer ».
2. Ouvrir l'**accueil** : le bandeau du catalogue et le pied de page.
3. Ouvrir **Location** : seules les lignes que vous avez remplies apparaissent.
4. Vérifier que les liens Instagram/Facebook s'ouvrent dans un nouvel onglet.
5. Passer une page dans le [test des résultats enrichis de Google](https://search.google.com/test/rich-results) pour confirmer que les horaires et le prix sont bien lus.
6. Sur mobile, vérifier que les horaires restent lisibles (deux colonnes face à face).

---

## 6. Ce que je ne mettrai pas en ligne

- Un avis rédigé par nous à la place d'une cliente.
- Un prix inventé ou une fourchette « pour faire joli ».
- Des horaires supposés : une cliente qui se déplace pour rien, c'est pire que « nous consulter ».
- Un lien social qui pointe vers un compte inexistant.
- Une photo prise sur Google Images ou sur le site d'une autre boutique.

---

*Document de travail — la boutique reste seule source des informations publiées.*
