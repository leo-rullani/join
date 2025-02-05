/**
 * guestLogin.js
 * Behandelt die Weiterleitung für den Guest-Login.
 * Wird in login.html & summary.html eingebunden.
 */

document.addEventListener("DOMContentLoaded", () => {
  initGuestLogin();
  setGreeting();
});

/**
 * initGuestLogin()
 * Klick auf Guest-Login-Button -> weiter zur summaryguest.html
 */
function initGuestLogin() {
  const guestLoginBtn = document.querySelector(".guest-btn");
  if (guestLoginBtn) {
    guestLoginBtn.addEventListener("click", () => {
      window.location.href = "/html/summaryguest.html";
    });
  }
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