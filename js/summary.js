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

/**
 * Setzt die Begrüßung basierend auf der aktuellen Uhrzeit.
 */
function setGreeting() {
  const greetingText = document.getElementById("greeting_text");
  const currentHour = new Date().getHours();

  let greeting;
  
  if (currentHour >= 5 && currentHour < 12) {
      greeting = "Good morning";
  } else if (currentHour >= 12 && currentHour < 18) {
      greeting = "Good afternoon";
  } else if (currentHour >= 18 && currentHour < 22) {
      greeting = "Good evening";
  } else {
      greeting = "Good night";
  }

  greetingText.textContent = greeting;
}

document.addEventListener("DOMContentLoaded", setGreeting);