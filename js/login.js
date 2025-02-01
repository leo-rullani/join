"use strict";

/*
 * Beispielliste für Demo-User.
 * In einer echten Anwendung würdest du hier
 * z.B. einen Server oder eine Datenbank nutzen.
 */
const dummyUsers = [{ email: "test@user.com", password: "test123" }];

/**
 * Seite initialisieren, sobald DOM geladen ist.
 */
document.addEventListener("DOMContentLoaded", init);

/**
 * init()
 * Ruft einzelne Setup-Funktionen auf,
 * um Event-Listener und Animationen zu initialisieren.
 */
function init() {
  const logo = document.querySelector(".logo-container");
  const form = document.querySelector(".form-container");
  const guestLoginBtn = document.querySelector(".guest-btn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorDiv = document.getElementById("errorMessage");

  initLogoAnimation(logo, form);
  initGuestLogin(guestLoginBtn);
  initFocusClear(emailInput, errorDiv);
  initFocusClear(passwordInput, errorDiv);
}

/**
 * initLogoAnimation()
 * Startet die Logo-Animation und zeigt das Formular nach Ende der Transition.
 */
function initLogoAnimation(logo, form) {
  setTimeout(() => logo.classList.add("move-logo"), 500);

  logo.addEventListener("transitionend", () => {
    form.classList.remove("hidden");
    form.classList.add("visible");
  });
}

/**
 * initGuestLogin()
 * Aktiviert den Klick auf den Guest-Login-Button.
 */
function initGuestLogin(guestLoginBtn) {
  guestLoginBtn.addEventListener("click", () => {
    window.location.href = "summary.html";
  });
}

/**
 * initFocusClear()
 * Entfernt Fehlerstile und Meldungen beim Fokussieren eines Input-Feldes.
 */
function initFocusClear(inputElement, errorDiv) {
  inputElement.addEventListener("focus", () => {
    inputElement.classList.remove("error");
    errorDiv.textContent = "";
  });
}

/**
 * login()
 * Wird beim Absenden des Login-Formulars aufgerufen.
 * Überprüft die Eingaben gegen dummyUsers und zeigt Erfolg oder Fehler an.
 */
function login(event) {
  event.preventDefault();

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorDiv = document.getElementById("errorMessage");
  const { value: email } = emailInput;
  const { value: password } = passwordInput;

  const user = dummyUsers.find(
    (u) => u.email === email && u.password === password
  );
  if (user) {
    clearErrorStyles(emailInput, passwordInput, errorDiv);
    loginSuccess();
  } else {
    showErrorStyles(emailInput, passwordInput, errorDiv);
  }
}

/**
 * fillEmail()
 * Füllt das E-Mail-Feld mit einem Standardwert, falls es leer ist.
 */
function fillEmail() {
  const emailInput = document.getElementById("email");
  if (emailInput.value.trim() === "") {
    emailInput.value = "test@user.com";
  }
}

/**
 * togglePassword()
 * Wechselt zwischen verborgener und sichtbarer Passwortanzeige
 * und passt das Icon entsprechend an.
 */
function togglePassword() {
  const passInput = document.getElementById("password");
  const passIcon = document.getElementById("passwordIcon");

  if (passIcon.src.includes("lock.svg")) {
    passIcon.src = "/assets/icons/eye-crossed.svg";
    passInput.type = "password";
  } else if (passIcon.src.includes("eye-crossed.svg")) {
    passInput.type = "text";
    passIcon.src = "/assets/icons/eye-thin.svg";
  } else if (passIcon.src.includes("eye-thin.svg")) {
    passInput.type = "password";
    passIcon.src = "/assets/icons/eye-crossed.svg";
  }
}

/**
 * clearErrorStyles()
 * Entfernt rote Umrandungen und Fehlermeldung.
 */
function clearErrorStyles(emailInput, passwordInput, errorDiv) {
  emailInput.classList.remove("error");
  passwordInput.classList.remove("error");
  errorDiv.textContent = "";
}

/**
 * showErrorStyles()
 * Setzt rote Umrandungen und zeigt eine Fehlermeldung an.
 */
function showErrorStyles(emailInput, passwordInput, errorDiv) {
  emailInput.classList.add("error");
  passwordInput.classList.add("error");
  errorDiv.textContent = "Check your email and password. Please try again.";
}

/**
 * loginSuccess()
 * Zeigt einen Erfolgshinweis und leitet anschließend weiter.
 */
function loginSuccess() {
  alert("Login successful!");
  window.location.href = "summary.html";
}