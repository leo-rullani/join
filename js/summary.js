"use strict";

/**
 * Öffnet/Schließt das kleine Menü am Profil-Icon.
 */
function toggleRespMenu() {
  let menu = document.getElementById("resp_menu");
  menu.classList.toggle("resp_menu_closed");
  menu.classList.toggle("resp_menu_open");
}

/**
 * Lädt User-Daten und aktualisiert UI.
 */
document.addEventListener("DOMContentLoaded", function () {
  const headerName = document.getElementById("userName");
  const greetingDiv = document.getElementById("userName");
  const userData = sessionStorage.getItem("loggedInUser");

  if (!headerName || !greetingDiv) {
    console.error("Elemente nicht gefunden!");
    return;
  }

  const isGuest = !userData;
  const user = isGuest ? { userName: "Guest" } : JSON.parse(userData);
  const userName = user.userName || "User";
  const { textColor } = getProfileData(isGuest);

  headerName.style.color = textColor;
  greetingDiv.textContent = userName;
  headerName.textContent = userName;

  // Begrüßung basierend auf Uhrzeit
  setGreeting();

  // Prüfe Overlay-Bedingung
  init();
});

/**
 * Gibt Profil-Daten zurück (Farbe etc.).
 */
function getProfileData(isGuest) {
  const userData = sessionStorage.getItem("loggedInUser");
  const user = isGuest ? { userName: "Guest" } : JSON.parse(userData);
  const userName = user.userName || "User";
  const initials = isGuest ? "G" : getInitials(userName);
  const firstLetter = initials.charAt(0).toUpperCase();
  const textColor = getColorForLetter(firstLetter);
  return { initials, textColor, userName };
}

/**
 * Setzt die Begrüßung (Morgen/Nachmittag/Abend/Nacht).
 */
function setGreeting() {
  const greetingText = document.getElementById("greeting_text");
  const currentHour = new Date().getHours();
  let greeting = "Good night,";

  if (currentHour >= 5 && currentHour < 12) {
    greeting = "Good morning,";
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon,";
  } else if (currentHour >= 18 && currentHour < 22) {
    greeting = "Good evening,";
  }
  if (greetingText) greetingText.textContent = greeting;
}

/**
 * Prüft die Bildschirmbreite und zeigt ggf. den Overlay.
 */
function init() {
  const w = window.innerWidth;
  if (w <= 910 && w >= 300) {
    showGreetingOverlay();
  }
}

/**
 * Zeigt das Begrüßungs-Overlay mit dynamischen Texten.
 */
function showGreetingOverlay() {
  const overlay = document.getElementById("greetingOverlay");
  if (!overlay) return;

  const overlayGreetingText = document.getElementById("overlayGreetingText");
  const overlayGreetingName = document.getElementById("overlayGreetingName");
  const greetingTextEl = document.getElementById("greeting_text");
  const userNameEl = document.getElementById("userName");

  if (overlayGreetingText && greetingTextEl) {
    overlayGreetingText.textContent = greetingTextEl.textContent;
  }
  if (overlayGreetingName && userNameEl) {
    overlayGreetingName.textContent = userNameEl.textContent;
  }

  // Overlay einblenden
  overlay.classList.remove("hidden");

  // Nach 2 Sek. -> Fadeout
  setTimeout(() => {
    overlay.classList.add("fadeOut");
    // Nach 0.5 Sek. -> komplett verstecken
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.classList.remove("fadeOut");
    }, 500);
  }, 2000);
}

/* 
===============================
NEU: Logout -> GoodNightOverlay
===============================
*/
function logout() {
  const userData = sessionStorage.getItem("loggedInUser");
  if (!userData) {
    // Falls schon Guest? -> Direkt zur Login-Seite
    window.location.href = "/html/login.html";
    return;
  }
  const user = JSON.parse(userData);
  const userName = user.userName || "User";

  // GoodNightOverlay befüllen
  const overlay = document.getElementById("goodNightOverlay");
  const goodNightText = document.getElementById("goodNightText");
  const goodNightName = document.getElementById("goodNightName");
  if (!overlay || !goodNightText || !goodNightName) {
    // Fallback: Einfach Redirect
    window.location.href = "/html/login.html";
    return;
  }

  // Bsp.: "Good night," + userName
  goodNightName.textContent = userName;
  overlay.classList.remove("hidden"); // Overlay sichtbar

  // Nach 2 Sek. FadeOut, dann Logout
  setTimeout(() => {
    overlay.classList.add("fadeOut");
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.classList.remove("fadeOut");
      // userData entfernen & redirect
      sessionStorage.removeItem("loggedInUser");
      window.location.href = "/html/login.html";
    }, 500);
  }, 2000);
}

/* Hilfsfunktionen (Beispiel) */
function getInitials(name) {
  if (typeof name !== "string" || name.length === 0) return "U";
  const parts = name.trim().split(" ");
  let initials = parts[0].charAt(0).toUpperCase();
  if (parts.length > 1) {
    initials += parts[parts.length - 1].charAt(0).toUpperCase();
  }
  return initials;
}

function getColorForLetter(letter) {
  // Beispielhafte Farblogik
  const colorMap = {
    A: "#FF5733",
    B: "#33FF57",
    C: "#5733FF",
    D: "#FF33A8",
    E: "#33A8FF",
    F: "#A8FF33",
    G: "#FF8C33",
    H: "#8C33FF",
    I: "#33FFD7",
    J: "#FFD733",
    K: "#33FF8C",
    L: "#D733FF",
    M: "#FF336E",
    N: "#338CFF",
    O: "#33FFBD",
    P: "#FFBD33",
    Q: "#8CFF33",
    R: "#FF338C",
    S: "#336EFF",
    T: "#33FF57",
    U: "#FF5733",
    V: "#5733FF",
    W: "#FF33A8",
    X: "#33A8FF",
    Y: "#A8FF33",
    Z: "#FF8C33",
  };
  return colorMap[letter] || "#000";
}