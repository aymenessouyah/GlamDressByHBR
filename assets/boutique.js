/* ─────────────────────────────────────────────────────────────
   INFORMATIONS DE LA BOUTIQUE — Glam Dress by HBR
   ─────────────────────────────────────────────────────────────
   C'EST LE SEUL FICHIER À REMPLIR POUR L'ÉTAPE B.

   Tout est vide par défaut. La page n'affiche que ce qui est
   réellement renseigné ici : un champ laissé vide ne produit
   aucun bloc, aucun texte provisoire, aucun « à venir ».

   Règle du projet : on n'inscrit que des informations validées
   par la boutique. Aucune valeur inventée, aucun avis rédigé
   par le site.

   Après chaque modification : enregistrer, puis rafraîchir la
   page (Ctrl+F5) pour voir le résultat.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  window.BOUTIQUE = {

    /* ── 1. HORAIRES ───────────────────────────────────────────
       Une ligne par plage d'ouverture.
         jours   : texte affiché (obligatoire pour afficher la ligne)
         heures  : texte affiché (obligatoire)
         schema  : facultatif, sert au référencement Google.
                   days  = noms anglais schema.org, opens/closes en 24 h.

       Exemple :
         { jours: "Lundi – Samedi", heures: "10h – 19h",
           schema: { days: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                     opens: "10:00", closes: "19:00" } }

       Si `horaires` reste vide, les pages continuent d'afficher
       « horaires à confirmer / nous consulter » comme aujourd'hui. */
    horaires: [],

    /* Texte libre affiché sous les horaires (facultatif).
       Exemples : "Fermé le dimanche" · "Fermeture annuelle : 1re semaine d'août" */
    fermetures: "",

    /* Précision sur les rendez-vous (facultatif).
       Exemple : "Essayage uniquement sur rendez-vous." */
    rendezVous: "",

    /* ── 2. CONTACT ────────────────────────────────────────────
       Adresse e-mail de contact (facultatif). Affichée sur la page
       « Nous trouver » et ajoutée au référencement. */
    email: "",

    /* ── 3. RÉSEAUX SOCIAUX ────────────────────────────────────
       Adresses complètes, commençant par https://
       Les liens vides ne sont pas affichés. Seuls les domaines
       instagram.com, facebook.com et tiktok.com sont acceptés.
       Exemple : instagram: "https://www.instagram.com/glamdressbyhbr/" */
    reseaux: {
      instagram: "",
      facebook: "",
      tiktok: ""
    },

    /* ── 4. FOURCHETTE DE PRIX ─────────────────────────────────
       Une seule phrase, affichée dans le catalogue, la page Location
       et le référencement.
       Exemple : "Location à partir de 350 DT · achat à partir de 900 DT" */
    priceRange: "",

    /* ── 5. CONDITIONS DE LOCATION ─────────────────────────────
       Uniquement des faits validés par la boutique. Chaque ligne
       non renseignée est masquée sur la page Location.
         duree     : ex. "48 h, du samedi au lundi"
         caution   : ex. "Chèque de garantie restitué au retour"
         nettoyage : ex. "Nettoyage inclus" / "À la charge de la cliente"
         retouches : ex. "Retouches simples incluses, autres sur devis"
         retour    : ex. "Retour le lendemain avant 18 h, en boutique"
         delai     : ex. "Réservation 3 semaines à l'avance" */
    location: {
      duree: "",
      caution: "",
      nettoyage: "",
      retouches: "",
      retour: "",
      delai: ""
    },

    /* ── 6. AVIS DE CLIENTES ───────────────────────────────────
       Témoignages RÉELS, avec l'accord écrit de la personne.
       Format : { prenom: "Ines", occasion: "Mariage, juin 2026",
                  texte: "…" }
       Laisser la liste vide plutôt que d'écrire un avis à la place
       d'une cliente : un faux avis est un risque juridique et détruit
       la confiance. Le site précise que les témoignages sont recueillis
       avec l'accord des clientes. */
    avis: [],

    /* ── 7. PHOTOS DE LA BOUTIQUE / DE L'ATELIER ───────────────
       Facultatif. Format : { src: "assets/boutique-1.jpg",
                             alt: "Description précise de l'image",
                             legende: "L'atelier d'essayage" }
       Les fichiers doivent être déposés dans le dossier assets/.
       La galerie n'apparaît sur l'accueil que si au moins une photo
       est déclarée. Le portrait de la propriétaire n'est pas demandé. */
    photos: []
  };

  /* Le moteur d'affichage lit ce fichier : inutile de le modifier. */
})();
