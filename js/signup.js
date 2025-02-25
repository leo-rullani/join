"use strict";
/**
 * @file signup.js
 * Manages sign-up functionality, including form validation and DB storage.
 */

// Global database URL
let databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Once DOM is loaded, initialize the page.
 */
document.addEventListener("DOMContentLoaded", init);

/**
 * Collects elements, checks screen size, and starts logo animation.
 */
function init() {
  const logoContainer = document.querySelector(".logo-container"),
    formContainer = document.querySelector(".form-container"),
    footer = document.querySelector(".footer");
  if (window.innerWidth <= 500) {
    footer.classList.add("hidden");
  } else {
    formContainer.classList.remove("hidden");
    footer.classList.remove("hidden");
  }
  initLogoAnimation(logoContainer, formContainer);
}

/**
 * Animates the logo for small screens, then reveals the form and footer.
 * @param {HTMLElement} logoContainer - Container holding the logo
 * @param {HTMLElement} formContainer - Container holding the form
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

/**
 * Sends a POST request to store user data in the database.
 * @async
 * @param {Object} userData - The user data (name, email, password)
 * @returns {Promise<string>} - The newly created record ID (Firebase Key)
 */
async function registerUser(userData) {
  const response = await fetch(`${databaseURL}/users.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Network response was not ok ${errorData}`);
  }
  const data = await response.json();
  return data.name;
}

/**
 * Validates form fields, checks password match, and sends data to the server.
 * @param {Event} event - The form submit event
 */
function signUp(event) {
  event.preventDefault();
  const n = document.getElementById("name"),
    e = document.getElementById("email"),
    p = document.getElementById("password"),
    c = document.getElementById("confirm-password"),
    chk = document.getElementById("policy-checkbox"),
    err = document.getElementById("errorMessage");

  clearErrorStyles(p, c, err);

  if (!validatePasswords(p, c, err)) return;
  if (!validatePolicy(chk)) return;

  const userData = {
    userName: n.value.trim(),
    userEmail: e.value.trim(),
    password: p.value.trim(),
  };

  registerUser(userData)
    .then((newUserKey) => handleUserRegistration(userData, newUserKey))
    .catch((er) => handleError(er, err));
}

/**
 * Validates that the password and confirm password fields match.
 * @param {HTMLInputElement} p - Password input element.
 * @param {HTMLInputElement} c - Confirm password input element.
 * @param {HTMLElement} err - Error message element.
 * @returns {boolean} True if passwords match, otherwise false.
 */
function validatePasswords(p, c, err) {
  if (p.value.trim() !== c.value.trim()) {
    showErrorStyles(p, c, err, "Your passwords don’t match. Please try again.");
    return false;
  }
  return true;
}

/**
 * Validates that the policy checkbox is checked.
 * @param {HTMLInputElement} chk - Checkbox input element.
 * @returns {boolean} True if checked, otherwise false.
 */
function validatePolicy(chk) {
  if (!chk.checked) {
    alert("You must accept the Privacy Policy to sign up!");
    return false;
  }
  return true;
}

/**
 * Handles user registration by saving user data and redirecting.
 * @param {{ userName: string, userEmail: string, password: string }} userData - The user data to save.
 * @param {string} newUserKey - The new user's unique key.
 */
function handleUserRegistration(userData, newUserKey) {
  sessionStorage.setItem(
    "loggedInUser",
    JSON.stringify({ ...userData, userId: newUserKey })
  );
  showToast("Sign up successfull!");
  setTimeout(() => (window.location.href = "/html/login.html"), 2000);
}

/**
 * Handles errors during user registration.
 * @param {Error} er - The error object.
 * @param {HTMLElement} err - Error message element.
 */
function handleError(er, err) {
  console.error("There was a problem with the fetch operation:", er);
  showErrorStyles(
    null,
    null,
    err,
    "An error occurred. Please try again later."
  );
}

/**
 * Enables or disables the sign-up button based on checkbox state.
 */
function toggleSignUpButton() {
  const checkbox = document.getElementById("policy-checkbox"),
    button = document.getElementById("signup-btn");
  button.disabled = !checkbox.checked;
}

/**
 * Toggles password visibility and updates the icon.
 * @param {string} inputId - ID of the password input field
 * @param {string} iconId - ID of the icon element
 */
function togglePassword(inputId, iconId) {
  const passInput = document.getElementById(inputId),
    passIcon = document.getElementById(iconId);
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
 * Shows a toast notification moving from below the container.
 * @param {string} message - The message to be displayed
 */
function showToast(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.remove("hidden");
  notification.style.bottom = "-120px";
  const boxRect = document.getElementById("signupBox").getBoundingClientRect(),
    boxMiddleY = boxRect.top + boxRect.height / 2,
    fromBottom = window.innerHeight - boxMiddleY;
  notification.getBoundingClientRect();
  notification.style.bottom = `${fromBottom}px`;
  notification.classList.add("show");
}

/**
 * Adds error classes and sets the error message text.
 * @param {HTMLElement|null} passField - Password field
 * @param {HTMLElement|null} confirmField - Confirm password field
 * @param {HTMLElement} errorMsg - Container for error message
 * @param {string} msgText - Error text
 */
function showErrorStyles(passField, confirmField, errorMsg, msgText) {
  if (passField) passField.classList.add("error");
  if (confirmField) confirmField.classList.add("error");
  errorMsg.textContent = msgText;
}

/**
 * Clears error classes and removes the error message text.
 * @param {HTMLElement} passField - Password field
 * @param {HTMLElement} confirmField - Confirm password field
 * @param {HTMLElement} errorMsg - Container for error message
 */
function clearErrorStyles(passField, confirmField, errorMsg) {
  passField.classList.remove("error");
  confirmField.classList.remove("error");
  errorMsg.textContent = "";
}
