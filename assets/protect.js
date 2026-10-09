/* Protection du contenu — Glam Dress by HBR
   1) Bloque sélection, copier/couper, clic droit et glisser d'image.
   2) Dissuade la capture d'écran : voile de protection au presseur
      "Impr. écran", quand l'onglet perd le focus ou est masqué.
   NB : aucune technique web ne peut empêcher un screenshot OS/téléphone ;
   c'est une dissuasion, pas une barrière absolue. */
(function () {
  "use strict";
  var MSG = "Contenu protégé — Glam Dress by HBR.";
  var FIELD = /INPUT|TEXTAREA|SELECT/;

  /* petit toast de renvoi (créé si absent) */
  var t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    t.setAttribute("role", "status");
    document.body.appendChild(t);
  }
  var toastTimer;
  function toast(msg) {
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }
  function inField(el) { return !!(el && FIELD.test(el.tagName)); }

  /* 1) copie / coupure / sélection / clic droit / glisser image */
  document.addEventListener("copy", function (e) {
    if (inField(e.target)) return;           /* autoriser dans les champs du formulaire */
    e.preventDefault(); toast(MSG);
  });
  document.addEventListener("cut", function (e) {
    if (inField(e.target)) return;
    e.preventDefault();
  });
  document.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  document.addEventListener("dragstart", function (e) {
    if (e.target && e.target.tagName === "IMG") { e.preventDefault(); toast(MSG); }
  });
  document.addEventListener("selectstart", function (e) {
    if (inField(e.target)) return;
    e.preventDefault();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "PrintScreen" || e.code === "PrintScreen") {
      flashVeil();
    }
    if (!inField(document.activeElement) && (e.ctrlKey || e.metaKey) &&
        (e.key === "c" || e.key === "C")) {
      e.preventDefault(); toast(MSG);
    }
  });

  /* 2) voile anti-capture (Impr. écran, perte de focus, onglet masqué) */
  var veil = document.createElement("div");
  veil.className = "protect-veil";
  veil.setAttribute("aria-hidden", "true");
  veil.innerHTML =
    '<div class="pv-lock">\u{1F512}</div>' +
    '<div class="pv-msg">Contenu protégé</div>' +
    '<div class="pv-sub">Glam Dress by HBR · El Menzah 5, Tunis</div>';
  document.body.appendChild(veil);

  function show() { veil.classList.add("on"); }
  function hide() { veil.classList.remove("on"); }
  var flashTimer;
  function flashVeil() { show(); clearTimeout(flashTimer); flashTimer = setTimeout(hide, 650); }

  window.addEventListener("blur", show);
  window.addEventListener("focus", hide);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) show(); else hide();
  });
})();
