/**
 * guestLogin.js
 * Behandelt die Weiterleitung für den Guest-Login.
 * Wird in login.html & summary.html eingebunden.
 */

document.addEventListener("DOMContentLoaded", () => {
  setGreeting();
});

/**
 * initGuestLogin()
 * Klick auf Guest-Login-Button -> weiter zur summaryguest.html
 */
function guestLogin() {
  let guestId = generateGuestId();
  sessionStorage.setItem("guestSession", guestId);
  window.location.href = "summaryguest.html";
}
function generateGuestId() {
  return "guest_" + Math.random().toString(36).substr(2, 9);
}

/**
 * setGreeting()
 * Setzt die Begrüßung basierend auf der Tageszeit.
 */
function setGreeting() {
  const greetingText = document.getElementById("greeting_text");
  if (!greetingText) return;

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