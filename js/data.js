"use strict";
/**
 * Toggles the responsive profile menu.
 * @returns {void}
 */
function toggleRespMenu() {
  const menu = document.getElementById("resp_menu");
  menu.classList.toggle("resp_menu_closed");
  menu.classList.toggle("resp_menu_open");
}
window.toggleRespMenu = toggleRespMenu;

/**
 * Returns the initials of a given name.
 * @param {string} name
 * @returns {string}
 */
function getUserInitials(name) {
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}
window.getUserInitials = getUserInitials;

/**
 * Returns a color for a given letter.
 * @param {string} letter
 * @returns {string}
 */
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
  return colors[letter.toUpperCase()] || "#999999";
}
window.getColorForLetter = getColorForLetter;

/**
 * Checks if the current user is a guest.
 * @returns {boolean}
 */
function isGuest() {
  return !sessionStorage.getItem("loggedInUser");
}
window.isGuest = isGuest;

/**
 * Logs out the user.
 * @returns {void}
 */
function logout() {
  sessionStorage.clear();
  window.location.href = "login.html";
}
window.logout = logout;

document.addEventListener("DOMContentLoaded", () => {
  const userData = sessionStorage.getItem("loggedInUser");
  const user = userData ? JSON.parse(userData) : { userName: "Gast" };
  const initials = userData ? getUserInitials(user.userName || "User") : "G";
  const textColor = getColorForLetter(initials.charAt(0));
  const div = document.getElementById("userInitials");
  if (div) {
    div.textContent = initials;
    div.style.color = textColor;
  }

  const summaryLink = document.getElementById("summaryLink");
  if (summaryLink && isGuest()) summaryLink.href = "summary.html";
});
