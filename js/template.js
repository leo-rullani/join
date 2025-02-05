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

document.addEventListener("DOMContentLoaded", function () {
  const userData = sessionStorage.getItem("loggedInUser");

  const isGuest = !userData;
  const user = isGuest ? { userName: "Gast" } : JSON.parse(userData);
  const userName = user.userName || "User";

  const initials = isGuest ? "G" : getInitials(userName);
  const firstLetter = initials.charAt(0);
  const textColor = getColorForLetter(firstLetter);

  const initialsDiv = document.getElementById("userInitials");
  if (initialsDiv) {
    initialsDiv.textContent = initials;
    initialsDiv.style.color = textColor;
  }

  return { initials, textColor, userName };
});

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

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
  return colors[upperLetter] || "#999999";
}

function logout() {
  sessionStorage.clear();
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  let summaryLink = document.getElementById("summaryLink");

  if (!summaryLink) return;

  if (isGuest()) {
    summaryLink.href = "summaryguest.html";
  }
});
