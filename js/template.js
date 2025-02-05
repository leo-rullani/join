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

document.addEventListener("DOMContentLoaded", function () {
  const userData = sessionStorage.getItem("loggedInUser");
  if (!userData) {
    console.warn("⚠ Kein Nutzer gefunden!");
    return;
  }

  const user = JSON.parse(userData);
  const userName = user.userName || "User";

  // Initialen und Farbe berechnen
  const initials = getInitials(userName);
  const firstLetter = initials.charAt(0);
  const textColor = getColorForLetter(firstLetter);

  // Initialen setzen
  const initialsDiv = document.getElementById("userInitials");
  if (initialsDiv) {
    initialsDiv.textContent = initials;
    initialsDiv.style.color = textColor;
  }

  // Rückgabe der Initialen und der Farbe für die Verwendung in anderen JS-Dateien
  return { initials, textColor, userName };
});

// Funktion zur Berechnung der Initialen
function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

// Funktion zur Bestimmung der Farbe für den ersten Buchstaben
function getColorForLetter(letter) {
  const colors = {
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

  let upperLetter = letter.toUpperCase();
  return colors[upperLetter] || "#999999"; // Default-Farbe
}

function logout() {
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}
