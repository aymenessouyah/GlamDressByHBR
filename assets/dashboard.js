/* ─────────────────────────────────────────────────────────────
   Tableau de bord Instagram — Glam Dress by HBR
   Lit data/instagram.json (écrit par tools/instagram-sync.mjs) et
   affiche les statistiques agrégées. Aucune donnée personnelle.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function n(v) {
    if (v === null || v === undefined || v === "") return "—";
    return new Intl.NumberFormat("fr-FR").format(Number(v));
  }
  function pct(v) {
    if (v === null || v === undefined) return "—";
    return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(v) + " %";
  }
  function dateFr(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  }
  function typeLabel(t) {
    var map = { FEED: "Publication", REELS: "Reel", STORY: "Story", CAROUSEL_ALBUM: "Carrousel", IMAGE: "Photo", VIDEO: "Vidéo" };
    return map[t] || t || "—";
  }

  var state = { sort: "views", rows: [] };

  function kpi(label, value, note) {
    return (
      '<article class="kpi"><span class="kpi-label">' + esc(label) + "</span>" +
      '<strong class="kpi-value">' + value + "</strong>" +
      (note ? '<span class="kpi-note">' + note + "</span>" : "") +
      "</article>"
    );
  }

  function renderKpis(data) {
    var box = $("#kpis");
    var t = data.totals || {};
    var a = data.account || {};
    box.innerHTML = [
      kpi("Abonnés", n(a.followers), a.media_count ? n(a.media_count) + " publications" : ""),
      kpi("Vues", n(t.views), t.media ? "sur " + t.media + " publication(s)" : ""),
      kpi("Portée", n(t.reach), "comptes distincts"),
      kpi("Enregistrements", n(t.saved), "mises de côté"),
      kpi("Partages", n(t.shares), ""),
      kpi("Taux d’engagement", pct(t.engagement_rate), "interactions / portée"),
    ].join("");
  }

  function renderRefs(data) {
    var box = $("#byRef");
    var map = Object.create(null);
    (data.media || []).forEach(function (m) {
      var key = m.ref || "Sans référence";
      if (!map[key]) map[key] = { ref: key, posts: 0, views: 0, saved: 0, reach: 0 };
      map[key].posts += 1;
      map[key].views += Number(m.views) || 0;
      map[key].saved += Number(m.saved) || 0;
      map[key].reach += Number(m.reach) || 0;
    });
    var rows = Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return b.views - a.views; });

    if (!rows.length) {
      box.innerHTML = '<p class="dash-empty">Aucune publication avec référence de robe. Ajoutez <code>#gd-241</code> dans vos légendes pour relier une publication à une robe.</p>';
      return;
    }

    box.innerHTML =
      '<table class="dash-table"><caption class="sr-only">Vues par robe</caption><thead><tr>' +
      "<th scope=\"col\">Référence</th><th scope=\"col\">Publications</th><th scope=\"col\">Vues</th>" +
      "<th scope=\"col\">Portée</th><th scope=\"col\">Enregistrements</th></tr></thead><tbody>" +
      rows.map(function (r) {
        var isRef = r.ref !== "Sans référence";
        return (
          "<tr><th scope=\"row\">" + esc(r.ref) + "</th>" +
          "<td>" + n(r.posts) + "</td>" +
          "<td>" + n(r.views) + "</td>" +
          "<td>" + n(r.reach) + "</td>" +
          "<td>" + n(r.saved) + "</td></tr>" +
          (isRef ? "" : "")
        );
      }).join("") +
      "</tbody></table>" +
      '<p class="dash-hint">Astuce : une publication dont la légende contient <code>GD-241</code> est automatiquement rattachée à cette robe.</p>';
  }

  function sortRows(rows, key) {
    var copy = rows.slice();
    copy.sort(function (a, b) {
      if (key === "date") return String(b.timestamp).localeCompare(String(a.timestamp));
      if (key === "ref") return String(a.ref || "zzz").localeCompare(String(b.ref || "zzz"));
      var av = a[key], bv = b[key];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      return Number(bv) - Number(av);
    });
    return copy;
  }

  function renderTable() {
    var box = $("#mediaTable");
    var rows = sortRows(state.rows, state.sort);
    if (!rows.length) {
      box.innerHTML = '<p class="dash-empty">Aucune publication récupérée.</p>';
      return;
    }
    box.innerHTML =
      '<table class="dash-table"><caption class="sr-only">Statistiques par publication</caption><thead><tr>' +
      "<th scope=\"col\">Date</th><th scope=\"col\">Réf.</th><th scope=\"col\">Publication</th><th scope=\"col\">Type</th>" +
      "<th scope=\"col\">Vues</th><th scope=\"col\">Portée</th><th scope=\"col\">Enreg.</th><th scope=\"col\">Partages</th>" +
      "<th scope=\"col\">J’aime</th><th scope=\"col\">Comm.</th></tr></thead><tbody>" +
      rows.map(function (m) {
        var title = m.permalink
          ? '<a href="' + esc(m.permalink) + '" target="_blank" rel="noopener">' + esc(m.excerpt || m.id) + " ↗</a>"
          : esc(m.excerpt || m.id);
        return (
          "<tr><td>" + dateFr(m.timestamp) + "</td>" +
          "<td>" + (m.ref ? esc(m.ref) : "—") + "</td>" +
          '<td class="dash-caption">' + title + "</td>" +
          "<td>" + esc(typeLabel(m.type)) + "</td>" +
          "<td>" + n(m.views) + "</td><td>" + n(m.reach) + "</td>" +
          "<td>" + n(m.saved) + "</td><td>" + n(m.shares) + "</td>" +
          "<td>" + n(m.likes) + "</td><td>" + n(m.comments) + "</td></tr>"
        );
      }).join("") +
      "</tbody></table>";
  }

  function renderHistory(lines) {
    var box = $("#history");
    if (!box) return;
    var rows = lines.map(function (l) {
      try { return JSON.parse(l); } catch (e) { return null; }
    }).filter(Boolean);
    if (rows.length < 2) {
      box.innerHTML = '<p class="dash-empty">L’évolution apparaîtra après quelques synchronisations (une ligne par jour).</p>';
      return;
    }
    var last = rows[rows.length - 1];
    var prev = rows[rows.length - 2];
    var delta = (last.followers || 0) - (prev.followers || 0);
    var sign = delta > 0 ? "+" : "";
    box.innerHTML =
      '<p class="dash-history-line"><strong>' + n(last.followers) + "</strong> abonnés au " + esc(last.date) +
      (delta !== 0 ? ' <span class="delta ' + (delta > 0 ? "up" : "down") + '">' + sign + n(delta) + " depuis la dernière mesure</span>" : "") +
      "</p>" +
      '<div class="spark">' +
      rows.slice(-30).map(function (r) {
        var max = Math.max.apply(null, rows.map(function (x) { return x.followers || 0; })) || 1;
        var h = Math.max(3, Math.round(((r.followers || 0) / max) * 100));
        return '<span style="height:' + h + '%" title="' + esc(r.date) + " · " + n(r.followers) + ' abonnés"></span>';
      }).join("") +
      "</div>";
  }

  function showBanner(data) {
    var box = $("#dashBanner");
    if (!box) return;
    if (data.source === "mock") {
      box.hidden = false;
      box.className = "dash-banner mock";
      box.innerHTML =
        "<strong>Données de démonstration.</strong> Ces chiffres sont fictifs : ils servent uniquement à vérifier l’affichage. " +
        "Lancez <code>node tools/instagram-sync.mjs</code> avec votre jeton pour obtenir les vrais.";
    } else {
      box.hidden = false;
      box.className = "dash-banner";
      box.innerHTML =
        "Synchronisé le " + esc(dateFr(data.generated_at)) + " depuis l’API Instagram officielle. " +
        "Statistiques agrégées uniquement.";
    }
  }

  function load() {
    fetch("data/instagram.json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        state.rows = data.media || [];
        showBanner(data);
        renderKpis(data);
        renderRefs(data);
        renderTable();
      })
      .catch(function (err) {
        $("#kpis").innerHTML =
          '<p class="dash-empty">Aucune donnée pour le moment.<br>Lancez <code>node tools/instagram-sync.mjs</code> ' +
          "après avoir configuré <code>IG_ACCESS_TOKEN</code> (voir AGENT-INSTAGRAM.md).<br><small>" + esc(err.message) + "</small></p>";
      });

    fetch("data/history.jsonl", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (txt) { renderHistory(txt.split("\n").filter(Boolean)); })
      .catch(function () { /* historique facultatif */ });
  }

  var sortSelect = $("#sortBy");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      state.sort = sortSelect.value;
      renderTable();
    });
  }

  load();
})();
