const users = [];

document.addEventListener("DOMContentLoaded", () => {
  const logo = document.querySelector(".logo-container");
  const form = document.querySelector(".form-container");
  const guestLoginButton = document.querySelector(".guest-btn");

  setTimeout(() => {
    logo.classList.add("move-logo");
  }, 500);

  logo.addEventListener("transitionend", () => {
    form.classList.remove("hidden");
    form.classList.add("visible");
  });

  // Guest Login Button Funktionalität
  guestLoginButton.addEventListener("click", () => {
    window.location.href = "summary.html";
  });
});

function login(event) {
  event.preventDefault();

  // Eingaben holen
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Dummy-Benutzer zur Demonstration
  const users = [{ email: "test@user.com", password: "test123" }];

  // Benutzer validieren
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    alert("Login successful!");
    window.location.href = "summary.html";
  } else {
    alert("Invalid email or password!");
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
 * Wechselt zwischen verborgener (maskiert) und sichtbarer Anzeige des Passworts.
 * - Start: Icon "lock.svg" und Input vom Typ "password"
 * - Klick, wenn Icon "lock.svg": Wechsel zu "eye-crossed.svg" (maskiert, geschlossen)
 * - Klick, wenn Icon "eye-crossed.svg": Passwort wird sichtbar (Input type "text") und Icon wechselt zu "eye-thin.svg"
 * - Klick, wenn Icon "eye-thin.svg": Passwort wird wieder maskiert und Icon wechselt zurück zu "eye-crossed.svg"
 */
function togglePassword() {
  const passwordInput = document.getElementById("password");
  const passwordIcon = document.getElementById("passwordIcon");

  if (passwordIcon.src.includes("lock.svg")) {
    // Erster Klick: Wechsel von Lock zu "eye-crossed.svg", Input bleibt maskiert
    passwordIcon.src = "/assets/icons/eye-crossed.svg";
    passwordInput.type = "password";
  } else if (passwordIcon.src.includes("eye-crossed.svg")) {
    // Nächster Klick: Passwort sichtbar machen und Icon zu "eye-thin.svg" wechseln
    passwordInput.type = "text";
    passwordIcon.src = "/assets/icons/eye-thin.svg";
  } else if (passwordIcon.src.includes("eye-thin.svg")) {
    // Erneut klicken: Passwort maskieren und Icon zurück zu "eye-crossed.svg" wechseln
    passwordInput.type = "password";
    passwordIcon.src = "/assets/icons/eye-crossed.svg";
  }
}
