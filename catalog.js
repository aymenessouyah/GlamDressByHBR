/* ─────────────────────────────────────────────────────────────
   CATALOGUE — Glam Dress by HBR
   Source unique des fiches affichées sur l'accueil.

   Chaque entrée décrit une INSPIRATION (pas un modèle du stock).
   Les champs facultatifs ci-dessous sont faits pour être remplis
   le jour où les photographies et les informations réelles des
   robes seront disponibles : les filtres « taille », « budget »
   et « formule » apparaissent alors automatiquement.

   Champs :
   id          référence courte affichée (obligatoire)
   name        nom de l'inspiration (obligatoire)
   cat         Mariage | Soirée | Orientale | Cérémonie (obligatoire)
   description phrase de présentation (obligatoire)
   color       teinte principale de l'illustration (obligatoire)
   bg          fond de l'illustration (obligatoire)
   colorName   libellé de la teinte, utilisé par le filtre couleur
   sizes       ex. ['S','M','L']  → active le filtre taille
   mode        'Achat' | 'Location' | 'Achat et location'
               → active le filtre formule
   priceFrom   prix de départ en DT (nombre) → active le filtre budget
   ref         référence boutique réelle (ex. 'GD-241')
   photo       chemin d'une photo réelle ; si présent, elle remplace
               l'illustration générée

   Exemple pour une fiche complète :
   { id:'I05', name:'Le drapé ivoire', cat:'Mariage', color:'#efe7d6',
     bg:'#e3ded2', description:'…', colorName:'Ivoire',
     sizes:['S','M','L'], mode:'Location', priceFrom:420,
     ref:'GD-241', photo:'assets/robes/gd-241.jpg' }
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var CATALOG = [
    { id: "I01", name: "L’allure nuptiale", cat: "Mariage", color: "#f6f1df", bg: "#e5e1d6",
      colorName: "Ivoire",
      description: "Des lignes délicates et une silhouette lumineuse pour imaginer votre tenue de mariage." },
    { id: "I02", name: "L’éclat du soir", cat: "Soirée", color: "#303d32", bg: "#d9dbd0",
      colorName: "Vert profond",
      description: "Une inspiration aux lignes longues et au drapé profond pour les grandes soirées." },
    { id: "I03", name: "L’esprit oriental", cat: "Orientale", color: "#b8a176", bg: "#e6ddcf",
      colorName: "Or",
      description: "Une inspiration de caftan aux détails ornementaux et aux tons chaleureux." },
    { id: "I04", name: "La douceur satinée", cat: "Soirée", color: "#ac7d70", bg: "#e7dbd6",
      colorName: "Rose poudré",
      description: "Des teintes douces et une silhouette fluide pour imaginer une tenue de cérémonie." }
  ];

  /* Tailles proposées dans les fiches et le sélecteur. */
  var SIZES = ["À préciser", "XS", "S", "M", "L", "XL", "Autre / besoin de conseils"];

  window.CATALOG = CATALOG;
  window.SIZES = SIZES;
})();
