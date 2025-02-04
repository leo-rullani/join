"use strict";

/**
 * Öffnet/Schließt das kleine Menü am Profil-Icon.
 * Wird aufgerufen, wenn der Nutzer
 * auf das .profile_initials-Bild klickt.
 */
function toggleRespMenu() {
  let menu = document.getElementById("resp_menu");
  menu.classList.toggle("resp_menu_closed");
  menu.classList.toggle("resp_menu_open");
}

// Optional: Aktionen beim Laden der Seite
document.addEventListener("DOMContentLoaded", function () {
  console.log("Summary page loaded. Header & Side-Bar ready!");
});
