"use strict";

let databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Splash & Responsive Logik wie bei der Login-Seite,
 * plus deine vorhandenen Sign-Up-Funktionen (signUp, toggleSignUpButton, etc.).
 */
document.addEventListener("DOMContentLoaded", init);

/**
 * init()
 * - Ermittelt Elemente
 * - Unterscheidet kleine/große Screens
 * - Startet Logo-Animation
 */
function init() {
  const logoContainer = document.querySelector(".logo-container"),
    formContainer = document.querySelector(".form-container"),
    footer = document.querySelector(".footer");

  if (window.innerWidth <= 500) {
    // Kleiner Bildschirm => Splash
    footer.classList.add("hidden");
    // body-Hintergrund & Logo-Farbe setzen wir in initLogoAnimation()
  } else {
    // Größerer Bildschirm => sofort sichtbar
    formContainer.classList.remove("hidden");
    footer.classList.remove("hidden");
  }
  initLogoAnimation(logoContainer, formContainer);
}

/**
 * initLogoAnimation()
 * - Bei ≤ 400px: Body = blau, Logo = weiß
 * - move-logo => fliegt nach oben/links
 * - Nach Transition => Body = hell, Logo = "logo.png", form & footer einblenden
 */
function initLogoAnimation(logoContainer, formContainer) {
  if (window.innerWidth <= 500) {
    document.body.style.backgroundColor = "#2b3647";
    logoContainer.querySelector("img").src = "/assets/img/join-logo-white.svg";
  }
  setTimeout(() => logoContainer.classList.add("move-logo"), 500);

  logoContainer.addEventListener("transitionend", () => {
    if (window.innerWidth <= 500) {
      document.body.style.backgroundColor = "#F6F7F8";
      logoContainer.querySelector("img").src = "/assets/img/logo.png";
      document.querySelector(".footer").classList.remove("hidden");
    }
    formContainer.classList.remove("hidden");
    formContainer.classList.add("visible");
  });
}

/* 
   Restliche Originalfunktionen, unverändert: signUp, toggleSignUpButton, 
   togglePassword, showToast, showErrorStyles, clearErrorStyles 
*/

async function registerUser(userData) {
  let response = await fetch(`${databaseURL}/users.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Network response was not ok ${errorData}`);
  }
  let data = await response.json();
  return data.name;
}

function signUp(event) {
  event.preventDefault();
  const usernameField = document.getElementById("name");
  const email = document.getElementById("email");
  const passField = document.getElementById("password");
  const confirmField = document.getElementById("confirm-password");
  const policyCheckbox = document.getElementById("policy-checkbox");
  const errorMsg = document.getElementById("errorMessage");

  clearErrorStyles(passField, confirmField, errorMsg);
  if (passField.value.trim() !== confirmField.value.trim()) {
    showErrorStyles(
      passField,
      confirmField,
      errorMsg,
      "Your passwords don’t match. Please try again."
    );
    return;
  }
  if (!policyCheckbox.checked) {
    alert("You must accept the Privacy Policy to sign up!");
    return;
  }
  const userData = {
    userName: usernameField.value.trim(),
    userEmail: email.value.trim(),
    password: passField.value.trim(),
  };

  registerUser(userData)
    .then((Data) => {
      showToast("You have successfully signed up!");
      setTimeout(() => {
        window.location.href = "/html/summary.html";
      }, 2000);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      showErrorStyles(
        null,
        null,
        errorMsg,
        "Ein Fehler ist aufgetreten. Bitte versuche es später erneut."
      );
    });
}

function toggleSignUpButton() {
  const checkbox = document.getElementById("policy-checkbox");
  const button = document.getElementById("signup-btn");
  button.disabled = !checkbox.checked;
}

function togglePassword(inputId, iconId) {
  const passInput = document.getElementById(inputId);
  const passIcon = document.getElementById(iconId);
  if (passIcon.src.includes("lock.svg")) {
    passIcon.src = "/assets/icons/eye-crossed.svg";
    passInput.type = "password";
  } else if (passIcon.src.includes("eye-crossed.svg")) {
    passIcon.src = "/assets/icons/eye-thin.svg";
    passInput.type = "text";
  } else if (passIcon.src.includes("eye-thin.svg")) {
    passIcon.src = "/assets/icons/eye-crossed.svg";
    passInput.type = "password";
  }
}

/**
 * showToast()
 * Ermittelt die Box-Mitte => Toast fliegt von unten hoch.
 */
function showToast(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.remove("hidden");
  notification.style.bottom = "-120px";
  const boxRect = document.getElementById("signupBox").getBoundingClientRect();
  const boxMiddleY = boxRect.top + boxRect.height / 2;
  const fromBottom = window.innerHeight - boxMiddleY;
  notification.getBoundingClientRect(); // Reflow
  notification.style.bottom = `${fromBottom}px`;
  notification.classList.add("show");
}

function showErrorStyles(passField, confirmField, errorMsg, msgText) {
  confirmField.classList.add("error");
  errorMsg.textContent = msgText;
}

function clearErrorStyles(passField, confirmField, errorMsg) {
  passField.classList.remove("error");
  confirmField.classList.remove("error");
  errorMsg.textContent = "";
}
