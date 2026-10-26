/* ─────────────────────────────────────────────────────────────
   Calculateur de taille — Glam Dress by HBR
   Repères identiques au tableau affiché sur la page.
   Aucune donnée n'est envoyée : tout est calculé dans le navigateur.
   Le résultat est INDICATIF ; la taille finale se confirme en essayage.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var ORDER = ["XS", "S", "M", "L", "XL"];
  var RANGES = {
    bust:  [[80, 84], [84, 88], [88, 94], [94, 100], [100, 108]],
    waist: [[60, 64], [64, 68], [68, 74], [74, 82], [82, 90]],
    hips:  [[84, 88], [88, 92], [92, 98], [98, 104], [104, 112]]
  };

  /* Renvoie l'indice de la première taille dont la fourchette contient
     la mesure, -1 si la mesure est sous le tableau, -2 si elle est au-dessus. */
  function indexFor(value, ranges) {
    if (value < ranges[0][0]) return -1;
    for (var i = 0; i < ranges.length; i++) {
      if (value >= ranges[i][0] && value <= ranges[i][1]) return i;
    }
    return value > ranges[ranges.length - 1][1] ? -2 : ranges.length - 1;
  }

  var form = document.getElementById("calc");
  var out = document.getElementById("calcOut");
  if (!form || !out) return;

  function read(name) {
    var v = parseFloat((form.elements[name] || {}).value);
    return isFinite(v) && v > 0 ? v : null;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var measures = [
      { key: "bust", label: "poitrine", value: read("bust") },
      { key: "waist", label: "taille", value: read("waist") },
      { key: "hips", label: "hanches", value: read("hips") }
    ].filter(function (m) { return m.value !== null; });

    out.replaceChildren();
    if (!measures.length) {
      out.innerHTML = "<p>Indiquez au moins une mesure (poitrine, taille ou hanches) pour obtenir une indication.</p>";
      return;
    }

    var worst = -1;      /* -1 = rien, -2 = au-dessus du tableau */
    var used = [];
    measures.forEach(function (m) {
      var i = indexFor(m.value, RANGES[m.key]);
      used.push(m.value + " cm (" + m.label + ")");
      if (i === -2) worst = -2;
      else if (i > worst) worst = i;
    });

    var title, body;
    if (worst === -2) {
      title = "Au-delà du tableau";
      body = "Une de vos mesures dépasse nos repères indicatifs (jusqu’à XL). Indiquez-les à la boutique : nous verrons ensemble les modèles et les retouches possibles.";
      out.innerHTML = '<h3>' + title + "</h3><p>" + body + "</p><p style=\"margin-top:10px\">Mesures relevées : " + used.join(" · ") + ".</p>";
    } else {
      var size = ORDER[Math.max(worst, 0)];
      out.innerHTML =
        '<span class="size-badge">' + size + "</span>" +
        "<h3>Taille de repère : " + size + "</h3>" +
        "<p>Établie sur la mesure la plus large de vos trois repères (" + used.join(" · ") + "), pour privilégier une robe qui se retouche plutôt qu’une robe trop juste.</p>" +
        '<p style="margin-top:10px">Repère indicatif : la coupe varie d’un modèle à l’autre, la taille finale se confirme en essayage.</p>';
    }

    var msg = "Bonjour Glam Dress by HBR,\nMes mesures : " + used.join(", ") +
      ".\nTaille de repère selon votre tableau : " + (worst === -2 ? "au-delà de XL" : ORDER[Math.max(worst, 0)]) +
      ".\nPouvez-vous me confirmer la taille à prévoir pour un essayage ?";
    var a = document.createElement("a");
    a.className = "calc-link";
    a.href = "https://wa.me/21654218118?text=" + encodeURIComponent(msg);
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Envoyer mes mesures sur WhatsApp ↗";
    out.appendChild(a);
  });

  form.addEventListener("reset", function () {
    out.replaceChildren();
  });
})();
