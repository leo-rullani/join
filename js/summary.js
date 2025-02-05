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
  greetingDiv.textContent = `${userName}`;
  headerName.textContent = userName;
});

function getProfileData(isGuest) {
  const userData = sessionStorage.getItem("loggedInUser");
  const user = isGuest ? { userName: "Guest" } : JSON.parse(userData);
  const userName = user.userName || "User";
  const initials = isGuest ? "G" : getInitials(userName);
  const firstLetter = initials.charAt(0);
  const textColor = getColorForLetter(firstLetter);

  return { initials, textColor, userName };
}

/**
 * Setzt die Begrüßung basierend auf der aktuellen Uhrzeit.
 */
function setGreeting() {
  const greetingText = document.getElementById("greeting_text");
  const currentHour = new Date().getHours();

  let greeting;

  if (currentHour >= 5 && currentHour < 12) {
    greeting = "Good morning,";
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon,";
  } else if (currentHour >= 18 && currentHour < 22) {
    greeting = "Good evening,";
  } else {
    greeting = "Good night,";
  }

  greetingText.textContent = greeting;
}

document.addEventListener("DOMContentLoaded", setGreeting);
