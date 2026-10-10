/* Page « Styliste » — Glam Dress by HBR
   Analyse de style 100 % locale dans le navigateur (aucune photo envoyée,
   aucune clé requise). Si une clé Gemini est configurée dans
   assets/styliste-config.js, la page bascule en mode enrichi (Google Gemini
   2.5 Flash, photo analysée par Google après consentement).
   Inspiré de AI-StyleSense, adapté à un site statique. */
(function () {
  "use strict";
  const key = (typeof GEMINI_API_KEY !== "undefined") ? String(GEMINI_API_KEY).trim() : "";
  const useGemini = /^AIza/.test(key);

  const form = document.getElementById("styForm");
  const status = document.getElementById("styStatus");
  const btn = document.getElementById("analyzeBtn");
  const photo = document.getElementById("photo");
  const preview = document.getElementById("preview");
  const dropText = document.getElementById("dropText");
  const results = document.getElementById("results");
  const resultContent = document.getElementById("resultContent");
  const modeNote = document.getElementById("modeNote");
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  if (modeNote) modeNote.textContent = useGemini
    ? "Mode enrichi (Google Gemini) : la photo est analysée par Google après votre consentement."
    : "Mode local : l’analyse se fait entièrement dans votre navigateur, aucune photo n’est envoyée."

  if (photo) {
    photo.addEventListener("change", () => {
      const f = photo.files && photo.files[0];
      if (!f) { preview.hidden = true; dropText.hidden = false; return; }
      const r = new FileReader();
      r.onload = () => { preview.src = r.result; preview.hidden = false; dropText.hidden = true; };
      r.readAsDataURL(f);
    });
  }

  /* ── Couleurs ── */
  function hexToRgb(h) { h = (h || "").replace("#", ""); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgbToHex(r, g, b) { return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase(); }
  function rgbToHsl(r, g, b) { r /= 255; g /= 255; b /= 255; const M = Math.max(r, g, b), m = Math.min(r, g, b); let h, s, l = (M + m) / 2; if (M === m) { h = s = 0; } else { const d = M - m; s = l > 0.5 ? d / (2 - M - m) : d / (M + m); switch (M) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; default: h = (r - g) / d + 4; } h /= 6; } return [h * 360, s * 100, l * 100]; }
  function hslToRgb(h, s, l) { h /= 360; s /= 100; l /= 100; let r, g, b; if (s === 0) { r = g = b = l; } else { const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; const f = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }; r = f(p, q, h + 1 / 3); g = f(p, q, h); b = f(p, q, h - 1 / 3); } return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]; }
  function shift(hex, ds, dl, dh) { const rgb = hexToRgb(hex); let hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]); const h = (hsl[0] + (dh || 0) + 360) % 360, s = Math.max(0, Math.min(100, hsl[1] + (ds || 0))), l = Math.max(0, Math.min(100, hsl[2] + (dl || 0))); const o = hslToRgb(h, s, l); return rgbToHex(o[0], o[1], o[2]); }

  const NAMED = [
    ["Noir", 18, 18, 18], ["Blanc", 250, 250, 250], ["Ivoire", 244, 240, 226], ["Crème", 240, 231, 214],
    ["Beige", 222, 205, 175], ["Camel", 185, 150, 100], ["Terracotta", 190, 106, 70], ["Abricot", 232, 160, 120],
    ["Rouge", 160, 35, 45], ["Bordeaux", 110, 25, 40], ["Rose poudré", 230, 180, 180], ["Corail", 235, 140, 120],
    ["Orange", 230, 140, 60], ["Jaune doré", 224, 190, 90], ["Or", 200, 165, 70], ["Vert olive", 120, 125, 80],
    ["Émeraude", 25, 120, 90], ["Vert sapin", 40, 90, 60], ["Turquoise", 60, 160, 170], ["Azur", 120, 170, 210],
    ["Bleu roi", 30, 60, 150], ["Bleu nuit", 25, 35, 80], ["Violet", 120, 80, 150], ["Lavande", 180, 160, 200],
    ["Gris", 120, 120, 120], ["Gris perle", 200, 200, 205], ["Marron", 95, 65, 45]
  ];
  function nameColor(r, g, b) { let best = "Teinte", bd = Infinity; for (const n of NAMED) { const d = (r - n[1]) ** 2 + (g - n[2]) ** 2 + (b - n[3]) ** 2; if (d < bd) { bd = d; best = n[0]; } } return best; }
  const dist = (a, b) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

  function drawToCanvas(img) {
    const c = document.createElement("canvas"); c.width = 120; c.height = 120;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    try { ctx.drawImage(img, 0, 0, 120, 120); return ctx; } catch (e) { return null; }
  }
  function extractPalette(img) {
    const ctx = drawToCanvas(img); if (!ctx) return [];
    let data; try { data = ctx.getImageData(0, 0, 120, 120).data; } catch (e) { return []; }
    const buckets = new Map();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const sum = r + g + b;
      if (sum > 726 || sum < 66) continue;
      const k = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
      let o = buckets.get(k); if (!o) { o = { c: 0, r: 0, g: 0, b: 0 }; buckets.set(k, o); }
      o.c++; o.r += r; o.g += g; o.b += b;
    }
    const arr = [...buckets.values()].sort((x, y) => y.c - x.c);
    const out = [];
    for (const o of arr) {
      const rgb = [Math.round(o.r / o.c), Math.round(o.g / o.c), Math.round(o.b / o.c)];
      if (out.every(p => dist(p.rgb, rgb) > 42)) out.push({ hex: rgbToHex(rgb[0], rgb[1], rgb[2]), rgb, name: nameColor(rgb[0], rgb[1], rgb[2]) });
      if (out.length >= 6) break;
    }
    return out;
  }
  function estimateUndertone(img) {
    const ctx = drawToCanvas(img); if (!ctx) return { warmth: "neutre", hex: "#c9a387" };
    let data; try { data = ctx.getImageData(0, 0, 120, 120).data; } catch (e) { return { warmth: "neutre", hex: "#c9a387" }; }
    let n = 0, rs = 0, gs = 0, bs = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 80 && g > 40 && b > 20 && r > g && r > b && (Math.max(r, g, b) - Math.min(r, g, b)) > 12 && (r - g) > 12) { n++; rs += r; gs += g; bs += b; }
    }
    if (n < 40) return { warmth: "neutre", hex: "#c9a387" };
    const r = rs / n, g = gs / n, b = bs / n;
    const h = rgbToHsl(r, g, b)[0];
    let warmth = "neutre"; if (h >= 21) warmth = "chaud"; else if (h < 17) warmth = "froid";
    return { warmth, hex: rgbToHex(Math.round(r), Math.round(g), Math.round(b)) };
  }

  function nameColorHex(hex) { const rgb = hexToRgb(hex); return nameColor(rgb[0], rgb[1], rgb[2]); }
  function accessoryFor(cols, und) {
    const metal = und.warmth === "froid" ? "argent" : (und.warmth === "chaud" ? "or" : "doré ou perle");
    const echo = (cols && cols[1]) ? nameColorHex(cols[1]) : "une teinte de votre palette";
    return "Bijoux " + metal + ", une pochette qui fait écho à " + echo + " et des chaussures dans un ton neutre pour allonger la silhouette.";
  }
  function atelierNote(prefs, palette, und) {
    const occ = (prefs.occasion || "votre occasion").toLowerCase();
    const baseName = (palette[0] && palette[0].name) || "votre teinte dominante";
    const w = { chaud: "réchauffent et illuminent votre regard", froid: "subliment la fraîcheur de votre éclat", neutre: "complètent élégamment votre silhouette" }[und.warmth] || "complètent élégamment votre silhouette";
    return "Selon l’œil de l’atelier, votre carnation paraît plutôt " + und.warmth + ". Pour " + occ + ", les teintes qui " + w + " s'accordent à votre dominante " + baseName.toLowerCase() + ". Voici une première direction, à affiner ensemble en boutique.";
  }
  function seasonTipText(season) {
    const T = { "Printemps": "Des matières légères et fluides (soie, mousseline, organza) s'accordent à la saison.", "Été": "Privilégiez des matières respirantes (mousseline, crêpe léger, coton noble).", "Automne": "Des matières plus structurées (crêpe de chine, velours léger) s'accordent à la saison.", "Hiver": "Les matières nobles (velours, satin, faille) subliment la saison." };
    return T[season] || "L’atelier privilégie des matières nobles et fluides, choisies selon votre occasion.";
  }
  function buildSuggestions(prefs, palette, und) {
    const occ = prefs.occasion || "Autre occasion";
    const base = (palette[0] && palette[0].hex) || "#b8a176";
    const neu = (palette.find(p => /gris|perle|noir|blanc|ivoire|crème|beige/i.test(p.name)) || { hex: "#8a8a80" });
    const light = shift(base, -2, 16), soft = shift(base, 4, -14), acc1 = shift(base, 8, -2, 155), acc2 = shift(base, 6, 4, 32);
    const T = {
      "Mariage": [
        { t: "La mariée lumineuse", d: "Une robe ivoire ou crème aux lignes pures, rehaussée d’un détail délicat.", c: [light, acc2, neu.hex] },
        { t: "L’élégance satin", d: "Un satin fluide dans une teinte douce qui suit votre carnation, pour une allure feutrée.", c: [soft, base, neu.hex] },
        { t: "L’accent signé", d: "Une tenue sobre relevée d’un accessoire coloré qui crée la différence.", c: [neu.hex, acc1, base] }
      ],
      "Fiançailles": [
        { t: "La fiancée éclatante", d: "Une tenue claire et lumineuse, sublimée par une teinte qui vous ressemble.", c: [light, base, neu.hex] },
        { t: "Le raffinement discret", d: "Des matières nobles dans des tons feutrés, pour une élégance posée.", c: [soft, neu.hex, acc2] },
        { t: "Le clin d’œil romantique", d: "Une note de couleur douce qui apporte la personnalité à une base intemporelle.", c: [neu.hex, acc2, light] }
      ],
      "Soirée / Gala": [
        { t: "La nuit signée", d: "Une teinte profonde et précieuse qui capte la lumière du soir.", c: [soft, acc1, neu.hex] },
        { t: "L’éclat du velours", d: "Une couleur riche et enveloppante, portée avec simplicité.", c: [base, neu.hex, acc2] },
        { t: "Le chic intemporel", d: "Un jeu de tons maîtrisés, élégant et facile à vivre.", c: [neu.hex, light, base] }
      ],
      "Cérémonie": [
        { t: "La tenue de cérémonie", d: "Une silhouette soignée dans une couleur qui suit votre occasion.", c: [soft, neu.hex, acc2] },
        { t: "L’élégance feutrée", d: "Des tons calmes et raffinés, à la fois sobres et chaleureux.", c: [neu.hex, base, light] },
        { t: "Le regard capté", d: "Une couleur affirmée portée avec délicatesse, sans excès.", c: [acc1, neu.hex, base] }
      ],
      "Autre occasion": [
        { t: "L’allure juste", d: "Une base douce et polyvalente, simple à porter pour l’occasion.", c: [base, neu.hex, light] },
        { t: "La touche de couleur", d: "Une note colorée qui donne du caractère à une tenue équilibrée.", c: [acc2, neu.hex, soft] },
        { t: "L’ensemble harmonieux", d: "Un accord de teintes qui s’épousent et vous mettent en valeur.", c: [light, acc1, neu.hex] }
      ]
    };
    const list = T[occ] || T["Autre occasion"];
    const conseil = {
      chaud: "Votre carnation semble plutôt chaude : les teintes dorées, terracotta et abricot la réchauffent joliment.",
      froid: "Votre carnation semble plutôt froide : les bleus, bordeaux et roses poudrés vous subliment.",
      neutre: "Votre carnation semble polyvalente : n’hésitez pas à mêler teintes chaudes et froides."
    }[und.warmth];
    return list.map(L => ({ titre: L.t, occasion: occ, description: L.d, conseil, couleurs: L.c, accessoire: accessoryFor(L.c, und) }));
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve({ img, url });
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image")); };
      img.src = url;
    });
  }
  function analyzeLocal(file, prefs) {
    return loadImage(file).then(({ img, url }) => {
      try {
        const palette = extractPalette(img);
        const und = estimateUndertone(img);
        return {
          noteAtelier: atelierNote(prefs, palette, und),
        carnation: { description: "Teint " + und.warmth + " (estimation indicative)", hex: und.hex },
          palette,
          seasonTip: seasonTipText(prefs.season),
        suggestions: buildSuggestions(prefs, palette, und)
        };
      } finally { URL.revokeObjectURL(url); }
    });
  }

  const schema = {
    type: "OBJECT",
    properties: {
      carnation: { type: "OBJECT", properties: { description: { type: "STRING" }, hex: { type: "STRING" } } },
      faceShape: { type: "OBJECT", properties: { shape: { type: "STRING" }, description: { type: "STRING" } } },
      palette: { type: "ARRAY", items: { type: "OBJECT", properties: { hex: { type: "STRING" }, name: { type: "STRING" }, reason: { type: "STRING" } } } },
      suggestions: { type: "ARRAY", items: { type: "OBJECT", properties: { titre: { type: "STRING" }, occasion: { type: "STRING" }, description: { type: "STRING" }, conseil: { type: "STRING" }, couleurs: { type: "ARRAY", items: { type: "STRING" } } } } }
    }
  };
  function analyzeWithGemini(file, prefs) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = () => reject(new Error("read"));
      r.onload = async () => {
        try {
          const b64 = String(r.result).split(",")[1];
          const prompt = "Tu es une styliste de mode experte, spécialisée dans les robes de cérémonie et de location. Analyse cette image pour aider une cliente.\n" +
            "Contexte : la cliente se trouve à Tunis, Tunisie. Occasion souhaitée : " + prefs.occasion + ". Saison : " + prefs.season + ". Style préféré : " + prefs.style + ".\n" +
            "Tâches :\n1. Détecte sa carnation (teint chaud, froid ou neutre) et donne une description courte.\n" +
            "2. Détermine la forme de son visage.\n" +
            "3. Propose 6 couleurs harmonieuses qui la mettent en valeur, avec un code hex valide pour chacune.\n" +
            "4. Propose 3 tenues ou robes adaptées, avec pour chacune : un titre, une courte description, un conseil, et 2 à 4 couleurs (codes hex).\n" +
            "Sois élégante et précise. Donne toujours des codes hex valides. Ne donne aucun conseil médical.";
          const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(key), {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ inlineData: { mimeType: "image/jpeg", data: b64 } }, { text: prompt }] }],
              generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.4 }
            })
          });
          if (!res.ok) throw new Error("HTTP " + res.status);
          const data = await res.json();
          const cand = data.candidates && data.candidates[0];
          const text = cand && cand.content && cand.content.parts && cand.content.parts[0] && cand.content.parts[0].text;
          if (!text) throw new Error("no response");
          resolve(JSON.parse(text));
        } catch (e) { reject(e); }
      };
      r.readAsDataURL(file);
    });
  }

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function render(o) {
    let html = "";
    if (o.noteAtelier) {
      html += '<div class="res-block res-note"><h3>L’œil de l’atelier</h3><p>' + esc(o.noteAtelier) + "</p></div>";
    }
    if (o.carnation) {
      html += '<div class="res-block"><h3>Votre carnation</h3><p>' + esc(o.carnation.description) +
        ' <span class="swatch" style="background:' + esc(o.carnation.hex) + '" title="' + esc(o.carnation.hex) + '"></span></p></div>';
    }
    if (o.faceShape) {
      html += '<div class="res-block"><h3>Forme du visage</h3><p><strong>' + esc(o.faceShape.shape) + "</strong> — " + esc(o.faceShape.description) + "</p></div>";
    }
    if (o.palette && o.palette.length) {
      html += '<div class="res-block"><h3>Votre palette de couleurs</h3><div class="palette">';
      o.palette.forEach((c) => {
        const nm = c.name || (c.rgb ? nameColor(c.rgb[0], c.rgb[1], c.rgb[2]) : c.hex);
        html += '<div class="chip"><span class="swatch" style="background:' + esc(c.hex) + '"></span><div><b>' + esc(nm) + "</b><small>" + esc(c.reason || c.hex) + "</small></div></div>";
      });
      html += "</div></div>";
    }
    if (o.seasonTip) {
      html += '<div class="res-block"><h3>Conseil de saison</h3><p>' + esc(o.seasonTip) + "</p></div>";
    }
    if (o.suggestions && o.suggestions.length) {
      html += '<div class="res-block"><h3>Vos suggestions de tenues</h3><div class="sugg">';
      o.suggestions.forEach((s) => {
        const cols = (s.couleurs || []).map((h) => '<span class="swatch" style="background:' + esc(h) + '" title="' + esc(h) + '"></span>').join("");
        html += "<article><h4>" + esc(s.titre || "") + "</h4>" + (s.occasion ? '<span class="occ">' + esc(s.occasion) + "</span>" : "") +
          "<p>" + esc(s.description || "") + "</p>" + (cols ? '<div class="cols">' + cols + "</div>" : "") +
          (s.conseil ? '<p class="tip">' + esc(s.conseil) + "</p>" : "") +
          (s.accessoire ? '<p class="tip acc">À porter avec — ' + esc(s.accessoire) + "</p>" : "") + "</article>";
      });
      html += "</div></div>";
    }
    resultContent.innerHTML = html || '<p>L’analyse n’a pas produit de résultat exploitable. Réessayez avec une autre photo.</p>';
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const f = photo.files && photo.files[0];
      if (!f) { status.textContent = "Merci d’ajouter une photo."; return; }
      const fd = new FormData(form);
      const prefs = { occasion: fd.get("occasion"), season: fd.get("season"), style: fd.get("style") };
      btn.disabled = true; btn.innerHTML = "L’atelier analyse…";
      results.hidden = true;
      status.textContent = useGemini ? "Analyse en cours, cela peut prendre quelques secondes…" : "L’atelier examine votre photo…";
      try {
        const out = useGemini ? await analyzeWithGemini(f, prefs) : await analyzeLocal(f, prefs);
        render(out);
        status.textContent = "";
        results.hidden = false;
        if (results.scrollIntoView) results.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (err) {
        console.error("Œil de l’atelier :", err);
        status.textContent = "L’analyse a rencontré un problème. Réessayez." + (useGemini ? " Vérifiez que la clé API est correcte." : "");
      } finally {
        btn.disabled = false; btn.innerHTML = "Recevoir le regard de l’atelier <span>↗</span>";
      }
    });
  }
})();
