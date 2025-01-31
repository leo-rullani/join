/**
 * signUp(event)
 * Wird beim Abschicken des Sign Up-Forms aufgerufen.
 * Verhindert ggf. das Absenden, wenn weitere Prüfungen nötig sind.
 */
function signUp(event) {
  event.preventDefault();

  // Falls du noch Eingabe-Validierungen hinzufügen willst (z. B. Passwort-Abgleich),
  // kannst du das hier tun:
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Checkbox-Check (hier nur als Sicherheitsmaßnahme, da wir den Button eh sperren)
  const policyCheckbox = document.getElementById("policy-checkbox");
  if (!policyCheckbox.checked) {
    alert("You must accept the Privacy Policy to sign up!");
    return;
  }

  // Hier könnte man die Eingaben speichern, z. B. in localStorage oder per fetch() an ein Backend senden
  // localStorage.setItem('name', document.getElementById('name').value);
  // etc.

  alert("Sign Up successful!");
  // Weiterleitung oder Schließen der Form, je nach Bedarf
  // window.location.href = '/html/welcome.html'; // Beispiel
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
    // Checkbox angehakt -> Button aktivieren
    signUpButton.disabled = false;
  } else {
    // Checkbox nicht angehakt -> Button wieder sperren
    signUpButton.disabled = true;
  }
}
