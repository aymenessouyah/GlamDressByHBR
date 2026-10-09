/* Finition UI — Glam Dress by HBR
   Ombre de l'en-tête au défilement · bouton "retour en haut" · révélation douce des blocs.
   Respecte prefers-reduced-motion. Aucun envoi de données. */
(function () {
  "use strict";
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* 1) Ombre discrète sur l'en-tête une fois la page défilée */
  var header = document.querySelector("header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* 2) Bouton "retour en haut" (gauche en bas, le WhatsApp reste à droite) */
  var top = document.createElement("button");
  top.type = "button";
  top.className = "to-top";
  top.setAttribute("aria-label", "Revenir en haut de la page");
  top.innerHTML = "&#8593;";
  document.body.appendChild(top);
  var onTop = function () {
    top.classList.toggle("show", window.scrollY > 600);
  };
  onTop();
  window.addEventListener("scroll", onTop, { passive: true });
  top.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* 3) Révélation douce des blocs (seulement si le mouvement est autorisé) */
  if (!reduce && "IntersectionObserver" in window) {
    var sels =
      ".section, .maison, .qr-panel, .page-head, .size-grid, .find-grid, .post, .panel, .steps, .catalog-tools, .sty-head, .sty-grid";
    var nodes = document.querySelectorAll(sels);
    var targets = [];
    nodes.forEach(function (el) {
      /* n'animuler que les blocs "racine" (pas ceux déjà dans un bloc animé) */
      if (el.closest(sels) === el) {
        el.classList.add("reveal");
        targets.push(el);
      }
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach(function (el) { io.observe(el); });
  }
})();
