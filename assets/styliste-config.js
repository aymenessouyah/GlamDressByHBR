// ─────────────────────────────────────────────────────────────
//  STYLISTE — configuration (optionnelle)
//
//  La page « Styliste » fonctionne SANS clé, en mode local :
//  l’analyse est faite dans le navigateur, aucune photo n’est envoyée.
//
//  En OPTION, collez ici une clé API Google Gemini (Gemini 2.5 Flash)
//  pour activer le mode « enrichi » (analyse par Google). La clé
//  commence par "AIza".
//
//   Où l’obtenir : Google Cloud Console > activer l’API « Gemini API »
//   > Credentials > Create credentials > API key.
//
//   Coût : gratuite jusqu’à un certain volume, puis facturée.
//
//   Sécurité : sur un site statique (GitHub Pages) cette clé reste
//   visible dans le code. Utilisez une clé restreinte à l’API Gemini
//   avec un plafond de dépense.
//
//   Vie privée (mode enrichi) : la photo est envoyée à Google pour
//   l’analyse ; elle n’est pas conservée par le site.
// ─────────────────────────────────────────────────────────────
const GEMINI_API_KEY = "";
