#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Synchronisation Instagram → tableau de bord
   Glam Dress by HBR

   Interroge l'API officielle Meta (Instagram Graph) et écrit
   data/instagram.json, lu ensuite par dashboard.html.

   Le jeton n'est JAMAIS écrit dans le dépôt : il est lu dans la
   variable d'environnement IG_ACCESS_TOKEN (GitHub Secrets).

   USAGE
     IG_ACCESS_TOKEN=... IG_USER_ID=... node tools/instagram-sync.mjs
     node tools/instagram-sync.mjs --mock        # données de démo, aucun réseau
     node tools/instagram-sync.mjs --dry-run     # affiche sans écrire

   VARIABLES
     IG_ACCESS_TOKEN   obligatoire (sauf --mock)
     IG_USER_ID        identifiant du compte professionnel
                       (obligatoire avec graph.facebook.com)
     IG_API_HOST       graph.instagram.com (défaut) ou graph.facebook.com
     IG_API_VERSION    v21.0 (défaut)

   NOTES
   · Seules les statistiques AGRÉGÉES sont conservées : aucun nom
     d'abonné, aucun contenu de message privé, aucun commentaire.
   · Un commentaire Instagram n'est pas un avis publié : il n'est
     jamais repris ici (voir AGENT-INSTAGRAM.md).
   ───────────────────────────────────────────────────────────── */
import { writeFileSync, appendFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data");
const OUT = join(DATA_DIR, "instagram.json");
const HISTORY = join(DATA_DIR, "history.jsonl");

const HOST = process.env.IG_API_HOST || "graph.instagram.com";
const VERSION = process.env.IG_API_VERSION || "v21.0";
const TOKEN = process.env.IG_ACCESS_TOKEN || "";
const USER_ID = process.env.IG_USER_ID || "me";

const args = process.argv.slice(2);
const MOCK = args.includes("--mock");
const DRY = args.includes("--dry-run");

/* Métriques demandées en lots, puis une par une en secours :
   l'API refuse l'appel entier si une seule métrique est inconnue
   pour ce type de média. */
const MEDIA_METRICS = ["views", "reach", "saved", "shares", "total_interactions"];
const ACCOUNT_METRICS = ["reach", "profile_views", "website_clicks"];

const api = (path, params = {}) => {
  const url = new URL(`https://${HOST}/${VERSION}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("access_token", TOKEN);
  return fetch(url, { headers: { accept: "application/json" } }).then(async (r) => {
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = body?.error?.message || `HTTP ${r.status}`;
      const err = new Error(msg);
      err.code = body?.error?.code;
      throw err;
    }
    return body;
  });
};

async function fetchMetrics(kind, id, wanted) {
  const out = {};
  const path = `${id}/insights`;
  try {
    const data = await api(path, { metric: wanted.join(",") });
    for (const row of data.data || []) {
      const value = row.values?.[0]?.value ?? row.total_value?.value;
      if (typeof value === "number") out[row.name] = value;
    }
    return out;
  } catch {
    /* repli : une métrique à la fois */
    for (const metric of wanted) {
      try {
        const data = await api(path, { metric });
        const row = (data.data || [])[0];
        const value = row?.values?.[0]?.value ?? row?.total_value?.value;
        if (typeof value === "number") out[metric] = value;
      } catch {
        /* métrique indisponible pour ce média : on l'ignore */
      }
    }
    return out;
  }
}

/* Référence de robe dans la légende : GD-241, gd241, #gd-241… */
function extractRef(caption) {
  if (!caption) return null;
  const m = caption.match(/\bgd[\s_-]?(\d{3})\b/i);
  return m ? `GD-${m[1]}` : null;
}

function excerpt(text, max = 90) {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + "…" : clean;
}

async function collectReal() {
  if (!TOKEN) throw new Error("IG_ACCESS_TOKEN absent : impossible d'interroger l'API.");

  const account = await api(USER_ID, {
    fields: "id,username,followers_count,media_count",
  });

  let accountInsights = {};
  try {
    const ins = await api(`${USER_ID}/insights`, {
      metric: ACCOUNT_METRICS.join(","),
      period: "day",
    });
    for (const row of ins.data || []) {
      const values = row.values || [];
      if (values.length) {
        accountInsights[row.name] = values.reduce((s, v) => s + (Number(v.value) || 0), 0);
      }
    }
  } catch {
    /* insights de compte indisponibles : on continue sans */
  }

  const media = [];
  let next = null;
  do {
    const page = await api(`${USER_ID}/media`, {
      fields:
        "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
      limit: "50",
      ...(next ? { after: next } : {}),
    });
    for (const item of page.data || []) {
      const metrics = await fetchMetrics("media", item.id, MEDIA_METRICS);
      media.push({
        id: item.id,
        ref: extractRef(item.caption),
        type: item.media_product_type || item.media_type || "",
        permalink: item.permalink || "",
        timestamp: item.timestamp || "",
        excerpt: excerpt(item.caption),
        views: metrics.views ?? null,
        reach: metrics.reach ?? null,
        saved: metrics.saved ?? null,
        shares: metrics.shares ?? null,
        interactions: metrics.total_interactions ?? null,
        likes: item.like_count ?? null,
        comments: item.comments_count ?? null,
      });
    }
    next = page.paging?.next ? page.paging.cursors?.after : null;
  } while (next);

  return {
    source: "instagram-graph",
    account: {
      username: account.username || "",
      followers: account.followers_count ?? null,
      media_count: account.media_count ?? null,
      reach: accountInsights.reach ?? null,
      profile_views: accountInsights.profile_views ?? null,
      website_clicks: accountInsights.website_clicks ?? null,
    },
    media,
  };
}

/* Données de démonstration : servent à valider le tableau de bord
   avant l'obtention du jeton. Elles sont explicitement marquées
   « mock » et le tableau de bord l'affiche en bandeau. */
function collectMock() {
  const day = 86400000;
  const now = Date.now();
  const posts = [
    { ref: "GD-241", type: "FEED", views: 4820, reach: 3610, saved: 214, shares: 96, likes: 342, comments: 28, caption: "Robe ivoire drapée, collection mariage #gd-241" },
    { ref: "GD-242", type: "FEED", views: 3150, reach: 2405, saved: 158, shares: 61, likes: 210, comments: 17, caption: "Caftan or, broderie main #gd-242" },
    { ref: "GD-243", type: "REELS", views: 12480, reach: 9920, saved: 640, shares: 312, likes: 1180, comments: 74, caption: "Essayage en vidéo — la robe en mouvement #gd-243" },
    { ref: null, type: "REELS", views: 8020, reach: 6410, saved: 402, shares: 188, likes: 866, comments: 51, caption: "Dans l'atelier, avant l'ouverture" },
    { ref: "GD-241", type: "STORY", views: 1640, reach: 1480, saved: null, shares: 12, likes: null, comments: null, caption: "Dernier jour d'essayage #gd-241" },
  ];
  return {
    source: "mock",
    account: {
      username: "glamdress_by_hbr",
      followers: 2480,
      media_count: 57,
      reach: 21400,
      profile_views: 3860,
      website_clicks: 412,
    },
    media: posts.map((p, i) => ({
      id: `mock-${i + 1}`,
      ref: p.ref,
      type: p.type,
      permalink: "",
      timestamp: new Date(now - (i + 1) * 6 * day).toISOString(),
      excerpt: excerpt(p.caption),
      views: p.views,
      reach: p.reach,
      saved: p.saved,
      shares: p.shares,
      interactions: (p.likes || 0) + (p.saved || 0) + (p.shares || 0) + (p.comments || 0),
      likes: p.likes,
      comments: p.comments,
    })),
  };
}

function summarise(payload) {
  const media = payload.media || [];
  const sum = (key) => media.reduce((s, m) => s + (Number(m[key]) || 0), 0);
  const views = sum("views");
  const reach = sum("reach");
  const interactions = sum("interactions");
  return {
    media: media.length,
    views,
    reach,
    saved: sum("saved"),
    shares: sum("shares"),
    likes: sum("likes"),
    comments: sum("comments"),
    engagement_rate: reach > 0 ? Math.round(((interactions + sum("saved")) / reach) * 1000) / 10 : null,
  };
}

async function main() {
  const payload = MOCK ? collectMock() : await collectReal();
  const result = {
    generated_at: new Date().toISOString(),
    ...payload,
    totals: summarise(payload),
  };

  if (DRY) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n", "utf8");
  console.log(`✓ ${OUT} — ${result.media.length} publication(s), source : ${result.source}`);

  /* Historique : une ligne par synchronisation, pour voir l'évolution.
     On n'ajoute pas deux fois la même journée. */
  const today = new Date().toISOString().slice(0, 10);
  let already = false;
  if (existsSync(HISTORY)) {
    const lines = readFileSync(HISTORY, "utf8").trim().split("\n").filter(Boolean);
    already = lines.some((l) => {
      try { return JSON.parse(l).date === today; } catch { return false; }
    });
  }
  if (!already) {
    appendFileSync(
      HISTORY,
      JSON.stringify({
        date: today,
        source: result.source,
        followers: result.account.followers,
        media_count: result.account.media_count,
        views: result.totals.views,
        reach: result.totals.reach,
        interactions: result.totals.likes + result.totals.comments + result.totals.saved,
      }) + "\n",
      "utf8"
    );
    console.log(`✓ ${HISTORY} — ligne du ${today} ajoutée`);
  } else {
    console.log(`· ${HISTORY} — ${today} déjà présent, pas de doublon`);
  }
}

main().catch((err) => {
  console.error("Échec de la synchronisation :", err.message);
  if (/401|OAuth|token/i.test(err.message)) {
    console.error("Le jeton est probablement expiré (durée de vie ~60 jours). Voir AGENT-INSTAGRAM.md.");
  }
  process.exit(1);
});
