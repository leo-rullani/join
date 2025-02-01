/**
 * signUp(event)
 * Wird beim Abschicken des Sign Up-Forms aufgerufen.
 * Verhindert ggf. das Absenden, wenn weitere Prüfungen nötig sind.
 */
function signUp(event) {
  event.preventDefault();

  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const policyCheckbox = document.getElementById("policy-checkbox");
  if (!policyCheckbox.checked) {
    alert("You must accept the Privacy Policy to sign up!");
    return;
  }

  // Hier kannst du Daten speichern oder fetch() anwenden.

  // Statt eines Alerts zeigen wir eine freundliche Toast-Nachricht an:
  const notification = document.getElementById("notification");
  notification.textContent = "Sign up successful!";
  notification.classList.remove("hidden");
  notification.classList.add("show");

  // Nach 2 Sekunden wird der Toast ausgeblendet und der Nutzer zur summary.html weitergeleitet.
  setTimeout(() => {
    notification.classList.remove("show");
    window.location.href = "/html/summary.html";
  }, 2000);
}

/**
 * toggleSignUpButton()
 * Wird aufgerufen, wenn sich der Zustand der Privacy-Checkbox ändert.
 * Aktiviert/deaktiviert den "Sign Up"-Button entsprechend.
 */
function toggleSignUpButton() {
  const policyCheckbox = document.getElementById("policy-checkbox");
  const signUpButton = document.getElementById("signup-btn");

  if (policyCheckbox.checked) {
    signUpButton.disabled = false;
  } else {
    signUpButton.disabled = true;
  }
}
