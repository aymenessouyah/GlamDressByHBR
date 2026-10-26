# L'agent Instagram — ce qu'il fait, ce qu'il ne fait pas

Objectif : voir les **vues**, la **portée** et l'intérêt pour chaque robe, puis recueillir des **avis clientes** sans jamais publier un faux témoignage.

---

## 1. Ce qui est déjà livré

| Élément | Rôle |
|---|---|
| `tools/instagram-sync.mjs` | Interroge l'API Instagram officielle et écrit `data/instagram.json` + une ligne d'historique. Zéro dépendance, zéro installation. |
| `.github/workflows/instagram-sync.yml` | Lance la synchronisation **chaque jour à 07:10 (Tunis)** et publie les données. Le jeton vit dans les secrets GitHub, jamais dans le code. |
| `dashboard.html` + `assets/dashboard.js` | Tableau de bord : 6 indicateurs, vues **par robe**, évolution des abonnés, tableau triable par vues / portée / enregistrements / date. |
| `data/instagram.json` | Jeu de **démonstration** (5 publications fictives). Le tableau de bord l'annonce en bandeau orange tant que ce ne sont pas de vraies données. |
| `supabase/avis.sql` | Schéma des avis avec consentement obligatoire et modération. À appliquer quand le projet Supabase sera choisi. |

Le tableau de bord est exclu de l'indexation (`noindex`) et du `robots.txt`. Une publication est rattachée à une robe quand sa légende contient sa référence — `GD-241`, `gd241` ou `#gd-241`.

---

## 2. L'API officielle, pas le scraping

Tout passe par **Instagram Graph API** (Meta). Il n'y a pas d'autre voie légale, et j'ai écarté les autres : aspirer la page (`instagram.com` répond d'ailleurs 403 aux robots) ou passer par un service de téléchargement serait contraire aux conditions d'Instagram et exposerait le compte.

### Ce que l'API permet

| Donnée | Disponible | Remarque |
|---|---|---|
| Vues, portée, enregistrements, partages par publication | ✅ | Vos médias uniquement |
| J'aime et commentaires (nombre) | ✅ | Le *contenu* des commentaires n'est pas repris ici |
| Abonnés, visites de profil, clics sur le lien | ✅ | Compte professionnel requis |
| Publier une photo | ✅ | Image à une URL publique, 50 publications / 24 h, pas de story |
| Répondre aux commentaires | ✅ | Sur vos propres médias |
| Statistiques d'un autre compte | ❌ | Interdit par l'API |
| Stories de plus de 24 h | ❌ | Métriques expirées |

**Conséquence pratique** : les données des stories disparaissent si la synchronisation est espacée. Une fois par jour suffit.

---

## 3. Mise en route, étape par étape

Ces trois premières étapes ne peuvent pas être faites à votre place : elles demandent votre mot de passe Meta.

### a) Passer le compte en professionnel
Application Instagram → **Paramètres → Compte → Passer à un compte professionnel** → choisir *Entreprise*. Gratuit.

### b) Relier une Page Facebook
Toujours dans les paramètres du compte professionnel : **Page Facebook → Connecter**. Créez la Page si besoin (une Page, pas un profil).

### c) Créer l'app Meta
1. `developers.facebook.com` → **Mes apps** → *Créer une app* → type **Entreprise**.
2. Ajouter le produit **Instagram** → *API setup with Instagram login* (ou *Instagram Graph API* selon l'écran).
3. Ajouter votre compte Instagram comme utilisateur de test, puis générer un **jeton d'accès** avec les permissions :
   - `instagram_basic`
   - `instagram_manage_insights`
   - `pages_show_list`
   - `business_management`
4. Échanger le jeton court contre un **jeton longue durée (60 jours)**.

### d) Ranger le jeton dans GitHub
Dépôt → **Settings → Secrets and variables → Actions** :

| Nom | Type | Valeur |
|---|---|---|
| `IG_ACCESS_TOKEN` | Secret | le jeton longue durée |
| `IG_USER_ID` | Secret | identifiant numérique du compte (visible dans l'API setup) |
| `IG_API_HOST` | Variable | `graph.instagram.com` (défaut) ou `graph.facebook.com` |

Puis onglet **Actions → Instagram — synchronisation des statistiques → Run workflow** pour un premier essai immédiat.

### e) Vérifier en local (facultatif)
```bash
# sans jeton : jeu de démonstration, aucun réseau
node tools/instagram-sync.mjs --mock

# avec un jeton, sans rien écrire
IG_ACCESS_TOKEN=... IG_USER_ID=... node tools/instagram-sync.mjs --dry-run
```

---

## 4. Le jeton expire — c'est le point de fragilité

Un jeton longue durée vit **environ 60 jours**. Passé ce délai, la synchronisation échoue avec une erreur d'authentification (le script le dit explicitement).

Deux façons de gérer :

- **Simple** : notez un rappel tous les 50 jours, régénérez le jeton, mettez à jour le secret. Cinq minutes.
- **Automatique** : un second workflow mensuel appelle `GET /refresh_access_token` et met le secret à jour. Cela demande un jeton GitHub avec droit d'écriture sur les secrets (fine-grained PAT) — plus de pièces mobiles, donc à faire seulement si le rappel devient pénible.

Ne mettez jamais le jeton dans `catalog.js`, dans un `<script>` ou dans un fichier du dépôt : un site statique est public, et GitHub scanne les dépôts à la recherche de jetons fuités.

---

## 5. Les avis clientes — le sujet à ne pas rater

### Le problème juridique
Un commentaire Instagram **n'est pas** un avis publiable. Son auteur n'a pas consenti à ce qu'il apparaisse sur un site, et recopier automatiquement des commentaires revient à traiter des données personnelles sans base légale. Pire : si un agent **reformule** un commentaire, cela devient un avis rédigé par la boutique — donc un faux avis.

### La solution retenue
1. **Collecte sur le site** : un formulaire « Racontez votre essayage » avec prénom, occasion, note et texte, plus une case à cocher explicite : *« J'autorise la publication de mon prénom et de mon témoignage sur le site. »*
2. **File d'attente** : chaque avis arrive en `en_attente`. Rien n'est visible.
3. **Validation humaine** : vous passez le statut à `publie` depuis Supabase (Table editor). Un clic, pas de code.
4. **Affichage** : seuls les avis `publie` **et** consentis sont lisibles par le site — la sécurité est dans la base (`supabase/avis.sql`), pas dans le navigateur. Le bloc `[data-reviews]` de l'accueil est déjà prêt à les recevoir.

La base refuse elle-même un avis sans consentement et interdit à un visiteur de s'auto-publier. C'est vérifiable dans le fichier SQL.

### Ce que l'agent peut faire, et ce qu'il ne fera pas
- ✅ Repérer un doublon ou un envoi en série (même empreinte d'IP).
- ✅ Suggérer une correction d'orthographe, que vous validez.
- ✅ Vous envoyer un rappel hebdomadaire : « 3 avis attendent une décision ».
- ❌ Publier à votre place.
- ❌ Écrire un avis à la place d'une cliente.
- ❌ Reprendre un commentaire Instagram sans consentement.

---

## 6. Confidentialité du tableau de bord

Aujourd'hui `dashboard.html` est sur le site public : `noindex`, absent du sitemap et du `robots.txt`, mais accessible à qui connaît l'adresse. Ce sont des chiffres agrégés, sans donnée personnelle — donc le risque est faible, mais ce n'est pas privé.

Trois options, par ordre de simplicité :

1. **Ne rien faire** — acceptable pour des totaux de vues. C'est le choix actuel.
2. **Déplacer la page** vers un hébergement privé (Netlify/Vercel avec mot de passe, ou Cloudflare Access). Simple, mais un second hébergement à gérer.
3. **Authentification Supabase** (lien magique par e-mail) sur une page protégée. Le plus propre, et réutilisable pour la modération des avis — c'est ce que je recommande quand vous voudrez modérer depuis le site plutôt que dans Supabase.

⚠️ Un mot de passe codé en JavaScript n'est **pas** une protection : n'importe qui lit le fichier. Je ne l'ai donc pas fait.

---

## 7. Prochaines étapes possibles

| Chantier | Intérêt | Effort |
|---|---|---|
| Formulaire d'avis + modération | Le plus rentable commercialement | Moyen |
| Page privée de modération (Supabase Auth) | Confort, une fois les avis en place | Moyen |
| Import Instagram → fiches catalogue pré-remplies | Moins de saisie | Faible |
| Rapport hebdomadaire par e-mail | Vous n'ouvrez rien | Faible |
| Publication automatique d'une robe | Risqué sans relecture | Élevé |

Rien de tout cela ne démarre sans votre accord : chaque brique touche soit à des données clientes, soit à des droits d'écriture sur Instagram.

---

*Document de travail — l'agent prépare, la boutique décide.*
