"use strict";

function signUp(event) {
  event.preventDefault();

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

  showToast("You signed up successfully!");

  setTimeout(() => {
    window.location.href = "/html/summary.html";
  }, 2000);
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
 * Ermittelt die Box-Mitte => Toast fliegt von unten (outside page)
 * hoch bis zur Mitte der Box.
 */
function showToast(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.remove("hidden");

  // Start-Position: bottom: -120px (per CSS)
  // => wir aktualisieren es hier, um re-animieren zu können
  notification.style.bottom = `-120px`;

  // Position der Box ermitteln
  const boxRect = document.getElementById("signupBox").getBoundingClientRect();
  const boxMiddleY = boxRect.top + boxRect.height / 2;

  // Errechne, wie viele px vom unteren Viewport-Rand
  // bis zur Box-Mitte
  const fromBottom = window.innerHeight - boxMiddleY;

  // Reflow auslösen, damit browser den Start-Frame kennt
  notification.getBoundingClientRect();

  // Ziel-Position: float up to the box center
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
