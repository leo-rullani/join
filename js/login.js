"use strict";

/*
 * Beispielliste für Demo-User (Demo).
 * In einer echten Anwendung würdest du
 * z.B. einen Server oder eine Datenbank nutzen.
 */
const dummyUsers = [{ email: "test@user.com", password: "test123" }];

/**
 * Sobald der DOM geladen ist, Initialisierung starten.
 */
document.addEventListener("DOMContentLoaded", init);

/**
 * init()
 * - Element-Referenzen holen
 * - Bei ≤ 400px: topRight & footer verborgen lassen
 * - Logo-Animation und weitere Listener initialisieren
 */
function init() {
  const logoContainer = document.querySelector(".logo-container"),
    form = document.querySelector(".form-container"),
    topRight = document.querySelector(".top-right"),
    footer = document.querySelector(".footer"),
    guestLoginBtn = document.querySelector(".guest-btn"),
    emailInput = document.getElementById("email"),
    passwordInput = document.getElementById("password"),
    errorDiv = document.getElementById("errorMessage");
  getUserData();

  if (window.innerWidth <= 500) {
    // Kleiner Screen => Splash => topRight und footer bleiben versteckt
    topRight.classList.add("hidden");
    footer.classList.add("hidden");
  } else {
    // Großer Screen => direkt sichtbar
    topRight.classList.remove("hidden");
    footer.classList.remove("hidden");
  }

  initLogoAnimation(logoContainer, form);
  initGuestLogin(guestLoginBtn);
  initFocusClear(emailInput, errorDiv);
  initFocusClear(passwordInput, errorDiv);
}

async function getUserData() {
  try {
    let response = await fetch(`${databaseURL}/users.json`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    let users = await response.json();
    if (!users || typeof users !== "object") {
      return [];
    }
    console.log(users);
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * initLogoAnimation()
 * - Bei ≤ 400px: Body = blau, Logo = weiß
 * - Nach Transition: Body = hell, Logo = blau
 * - Form, topRight, footer einblenden
 */
function initLogoAnimation(logo, form) {
  if (window.innerWidth <= 500) {
    document.body.style.backgroundColor = "#2b3647";
    logo.querySelector("img").src = "/assets/img/join-logo-white.svg";
  }
  setTimeout(() => logo.classList.add("move-logo"), 500);

  logo.addEventListener("transitionend", () => {
    if (window.innerWidth <= 500) {
      document.body.style.backgroundColor = "#F6F7F8";
      logo.querySelector("img").src = "/assets/img/join-logo-blue.svg";
      document.querySelector(".top-right").classList.remove("hidden");
      document.querySelector(".footer").classList.remove("hidden");
    }
    form.classList.remove("hidden");
    form.classList.add("visible");
  });
}

/**
 * initGuestLogin()
 * Klick auf Guest-Login-Button -> weiter zur summary.html
 */
function initGuestLogin(guestLoginBtn) {
  guestLoginBtn.addEventListener(
    "click",
    () => (window.location.href = "summary.html")
  );
}

/**
 * initFocusClear()
 * Entfernt Fehlermeldungen & Styles beim Fokussieren.
 */
function initFocusClear(inputElement, errorDiv) {
  inputElement.addEventListener("focus", () => {
    inputElement.classList.remove("error");
    errorDiv.textContent = "";
  });
}

/**
 * login()
 * Wird beim Absenden des Formulars aufgerufen. Prüft dummyUsers.
 */
function login(event, users) {
  event.preventDefault();
  const emailInput = document.getElementById("email"),
    passwordInput = document.getElementById("password"),
    errorDiv = document.getElementById("errorMessage"),
    email = emailInput.value.trim(),
    password = passwordInput.value.trim();
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    clearErrorStyles(emailInput, passwordInput, errorDiv);
    loginSuccess();
  } else {
    showErrorStyles(emailInput, passwordInput, errorDiv);
  }
}

/**
 * fillEmail()
 * Füllt E-Mail-Feld mit Standardwert test@user.com, falls leer.
 */
function fillEmail() {
  const emailInput = document.getElementById("email");
  if (emailInput.value.trim() === "") {
    emailInput.value = "test@user.com";
  }
}

/**
 * togglePassword()
 * Wechselt zw. verborgener & sichtbarer Passwortanzeige + Icon.
 */
function togglePassword() {
  const passInput = document.getElementById("password"),
    passIcon = document.getElementById("passwordIcon");
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
 * Rote Umrandung + Fehlermeldung.
 */
function showErrorStyles(emailInput, passwordInput, errorDiv) {
  emailInput.classList.add("error");
  passwordInput.classList.add("error");
  errorDiv.textContent = "Check your email and password. Please try again.";
}

/**
 * loginSuccess()
 * Zeigt Erfolgsmeldung an, leitet zu summary.html weiter.
 */
function loginSuccess() {
  alert("Login successful!");
  window.location.href = "summary.html";
}
