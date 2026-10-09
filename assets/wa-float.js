/* Bouton WhatsApp flottant — ajouté sur les pages qui incluent ce script. */
(function () {
  "use strict";
  if (document.querySelector(".wa-float")) return;
  var a = document.createElement("a");
  a.className = "wa-float";
  a.href = "https://wa.me/21654218118";
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", "Discuter sur WhatsApp");
  a.innerHTML =
    '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.6.9 5 2.4 7L4 29l7.2-2.3c1.9 1 4 1.6 6.3 1.6 6.6 0 12-5.3 12-11.9S22.6 3 16 3zm0 21.6c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-4 1.3 1.3-3.9-.3-.4c-1.1-1.6-1.7-3.5-1.7-5.4 0-5.3 4.5-9.6 10.4-9.6 5.7 0 10.4 4.3 10.4 9.6 0 5.3-4.5 9.6-10.4 9.6zm5.7-7.2c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.6-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4z"/></svg><span>WhatsApp</span>';
  document.body.appendChild(a);
})();
