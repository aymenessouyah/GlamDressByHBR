/* ─────────────────────────────────────────────────────────────
   Moteur d'affichage des informations de la boutique
   Lit assets/boutique.js et n'injecte dans la page que les données
   réellement renseignées. Sans donnée : rien n'apparaît, aucun bloc
   vide, aucun texte provisoire, et le référencement reste inchangé.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var B = window.BOUTIQUE || {};

  function txt(v) { return typeof v === "string" ? v.trim() : ""; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function has(el) { return !!el; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function isUrl(u) { return /^https:\/\/[^\s]+$/i.test(txt(u)); }

  /* ── 1. HORAIRES ─────────────────────────────────────────── */
  var rows = arr(B.horaires).filter(function (h) {
    return h && txt(h.jours) && txt(h.heures);
  });

  function hoursHtml() {
    var html = rows.map(function (h) {
      return '<span class="hours-row"><strong>' + esc(h.jours) + "</strong><span>" + esc(h.heures) + "</span></span>";
    }).join("");
    if (txt(B.fermetures)) html += '<span class="hours-note">' + esc(B.fermetures) + "</span>";
    if (txt(B.rendezVous)) html += '<span class="hours-note">' + esc(B.rendezVous) + "</span>";
    return html;
  }

  if (rows.length) {
    document.querySelectorAll("[data-hours]").forEach(function (el) {
      el.innerHTML = hoursHtml();
      el.classList.add("hours-live");
    });

    var shortText = "Horaires : " + rows.map(function (h) {
      return txt(h.jours) + " · " + txt(h.heures);
    }).join(" — ");
    document.querySelectorAll("[data-hours-short]").forEach(function (el) {
      el.textContent = shortText;
    });
  }

  /* ── 2. E-MAIL ───────────────────────────────────────────── */
  if (txt(B.email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(txt(B.email))) {
    document.querySelectorAll("[data-email]").forEach(function (el) {
      var a = document.createElement("a");
      a.href = "mailto:" + txt(B.email);
      a.textContent = txt(B.email) + " ↗";
      el.replaceChildren(a);
      el.hidden = false;
    });
  }

  /* ── 3. RÉSEAUX SOCIAUX ──────────────────────────────────── */
  var NETS = [
    { key: "instagram", label: "Instagram", test: /^https:\/\/(www\.)?instagram\.com\//i },
    { key: "facebook", label: "Facebook", test: /^https:\/\/(www\.)?facebook\.com\//i },
    { key: "tiktok", label: "TikTok", test: /^https:\/\/(www\.)?tiktok\.com\//i }
  ];
  var networks = NETS.filter(function (n) {
    var url = txt((B.reseaux || {})[n.key]);
    return isUrl(url) && n.test.test(url);
  }).map(function (n) {
    return { label: n.label, url: txt(B.reseaux[n.key]) };
  });

  if (networks.length) {
    var linksHtml = networks.map(function (n) {
      return '<a href="' + esc(n.url) + '" target="_blank" rel="noopener">' + n.label + " ↗</a>";
    }).join("");
    document.querySelectorAll("[data-socials]").forEach(function (el) {
      el.insertAdjacentHTML("beforeend", linksHtml);
      el.hidden = false;
    });
    /* le pied de page de toutes les pages */
    document.querySelectorAll(".footer-bottom > div").forEach(function (el) {
      if (el.querySelector("[data-social-links]")) return;
      el.insertAdjacentHTML("beforeend", '<span data-social-links style="display:contents">' + linksHtml + "</span>");
    });
  }

  /* ── 4. FOURCHETTE DE PRIX ───────────────────────────────── */
  if (txt(B.priceRange)) {
    document.querySelectorAll("[data-price-range]").forEach(function (el) {
      el.textContent = txt(B.priceRange);
      el.hidden = false;
    });
  }

  /* ── 5. AVIS DE CLIENTES ─────────────────────────────────── */
  var avis = arr(B.avis).filter(function (a) {
    return a && txt(a.texte);
  });
  var reviewsBox = document.querySelector("[data-reviews]");
  if (has(reviewsBox)) {
    if (!avis.length) {
      reviewsBox.hidden = true;
    } else {
      reviewsBox.innerHTML =
        '<p class="eyebrow">ELLES EN PARLENT</p>' +
        "<h2>Leurs mots,<br><em>pas les nôtres.</em></h2>" +
        '<div class="reviews-grid">' +
        avis.map(function (a) {
          return (
            "<blockquote><p>« " + esc(txt(a.texte)) + " »</p>" +
            "<footer><strong>" + esc(txt(a.prenom) || "Une cliente") + "</strong>" +
            (txt(a.occasion) ? "<span>" + esc(txt(a.occasion)) + "</span>" : "") +
            "</footer></blockquote>"
          );
        }).join("") +
        "</div>" +
        '<p class="fine">Témoignages recueillis avec l’accord des clientes. Aucun n’est rédigé par le site.</p>';
      reviewsBox.hidden = false;
    }
  }

  /* ── 6. PHOTOS DE LA BOUTIQUE ────────────────────────────── */
  var photos = arr(B.photos).filter(function (p) {
    return p && txt(p.src);
  });
  var galleryBox = document.querySelector("[data-gallery]");
  if (has(galleryBox)) {
    if (!photos.length) {
      galleryBox.hidden = true;
    } else {
      galleryBox.innerHTML =
        '<div class="gallery-grid">' +
        photos.map(function (p) {
          return (
            "<figure><img src=\"" + esc(p.src) + '" alt="' + esc(txt(p.alt) || "Boutique Glam Dress by HBR") +
            '" loading="lazy" width="800" height="600">' +
            (txt(p.legende) ? "<figcaption>" + esc(txt(p.legende)) + "</figcaption>" : "") +
            "</figure>"
          );
        }).join("") +
        "</div>";
      galleryBox.hidden = false;
    }
  }

  /* ── 7. CONDITIONS DE LOCATION (page location.html) ──────── */
  var COND_LABELS = {
    duree: "Durée de la location",
    caution: "Caution",
    nettoyage: "Nettoyage",
    retouches: "Retouches",
    retour: "Retour de la robe",
    delai: "Délai de réservation"
  };
  var loc = B.location || {};
  var filledCond = 0;
  document.querySelectorAll("[data-cond]").forEach(function (row) {
    var key = row.getAttribute("data-cond");
    var value = txt(loc[key]);
    if (value) {
      var dd = row.querySelector("dd");
      if (dd) dd.textContent = value;
      row.hidden = false;
      filledCond++;
    } else {
      row.hidden = true;
    }
  });
  var condEmpty = document.querySelector("[data-cond-empty]");
  if (has(condEmpty)) condEmpty.hidden = filledCond > 0;
  document.querySelectorAll("[data-cond-count]").forEach(function (el) {
    el.textContent = filledCond ? filledCond + " point(s) confirmé(s) par la boutique" : "";
  });

  /* ── 8. RÉFÉRENCEMENT (JSON-LD) ──────────────────────────────
     On enrichit le nœud ClothingStore déjà présent dans la page :
     mêmes données que celles affichées, donc aucun écart possible. */
  document.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) {
    var data;
    try { data = JSON.parse(s.textContent); } catch (e) { return; }
    var type = data && data["@type"];
    if (type !== "ClothingStore") return;

    var changed = false;
    if (txt(B.priceRange)) { data.priceRange = txt(B.priceRange); changed = true; }
    if (txt(B.email)) { data.email = txt(B.email); changed = true; }
    if (networks.length) { data.sameAs = networks.map(function (n) { return n.url; }); changed = true; }

    var specs = openingSpecs();
    if (specs.length) { data.openingHoursSpecification = specs; changed = true; }

    if (changed) s.textContent = JSON.stringify(data);
  });

  function openingSpecs() {
    return rows.filter(function (h) {
      var sc = h.schema;
      return sc && Array.isArray(sc.days) && sc.days.length && txt(sc.opens) && txt(sc.closes);
    }).map(function (h) {
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.schema.days,
        opens: h.schema.opens,
        closes: h.schema.closes
      };
    });
  }
})();
