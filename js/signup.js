"use strict";
/**
 * @file signup.js
 * Contains splash/responsive logic similar to the login page,
 * plus your existing sign-up functions (signUp, toggleSignUpButton, etc.).
 */

// Global database URL
let databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Once DOM is loaded, initialize the page.
 */
document.addEventListener("DOMContentLoaded", init);

/**
 * init
 * Collects elements, checks screen size, starts logo animation.
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
 * initLogoAnimation
 * Animates logo for small screens, then shows the form and footer.
 * @param {HTMLElement} logoContainer - The container with the logo
 * @param {HTMLElement} formContainer - The form container
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
 * registerUser
 * Sends a POST request to store user data in the database.
 * @async
 * @param {Object} userData - The user data to be saved
 * @returns {Promise<string>} - The newly created record ID
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
 * signUp
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
  if (p.value.trim() !== c.value.trim()) {
    showErrorStyles(p, c, err, "Your passwords don’t match. Please try again.");
    return;
  }
  if (!chk.checked) {
    alert("You must accept the Privacy Policy to sign up!");
    return;
  }
  const userData = {
    userName: n.value.trim(),
    userEmail: e.value.trim(),
    password: p.value.trim(),
  };
  registerUser(userData)
    .then(() => {
      showToast("You have successfully signed up!");
      setTimeout(() => (window.location.href = "/html/summary.html"), 2000);
    })
    .catch((er) => {
      console.error("There was a problem with the fetch operation:", er);
      showErrorStyles(
        null,
        null,
        err,
        "Ein Fehler ist aufgetreten. Bitte versuche es später erneut."
      );
    });
}

/**
 * toggleSignUpButton
 * Enables/disables the signup button based on the checkbox state.
 */
function toggleSignUpButton() {
  const checkbox = document.getElementById("policy-checkbox"),
    button = document.getElementById("signup-btn");
  button.disabled = !checkbox.checked;
}

/**
 * togglePassword
 * Toggles password visibility and updates the icon.
 * @param {string} inputId - The ID of the password input
 * @param {string} iconId - The ID of the icon element
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
 * showToast
 * Determines the box center and moves the toast from below.
 * @param {string} message - The message to display
 */
function showToast(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.remove("hidden");
  notification.style.bottom = "-120px";
  const boxRect = document.getElementById("signupBox").getBoundingClientRect(),
    boxMiddleY = boxRect.top + boxRect.height / 2,
    fromBottom = window.innerHeight - boxMiddleY;
  notification.getBoundingClientRect(); // Reflow
  notification.style.bottom = `${fromBottom}px`;
  notification.classList.add("show");
}

/**
 * showErrorStyles
 * Adds an error class and sets the error message text.
 * @param {HTMLElement|null} passField - The password field
 * @param {HTMLElement|null} confirmField - The confirm password field
 * @param {HTMLElement} errorMsg - The error message container
 * @param {string} msgText - The text of the error message
 */
function showErrorStyles(passField, confirmField, errorMsg, msgText) {
  if (passField) passField.classList.add("error");
  if (confirmField) confirmField.classList.add("error");
  errorMsg.textContent = msgText;
}

/**
 * clearErrorStyles
 * Removes error classes and clears the error message.
 * @param {HTMLElement} passField - The password field
 * @param {HTMLElement} confirmField - The confirm password field
 * @param {HTMLElement} errorMsg - The error message container
 */
function clearErrorStyles(passField, confirmField, errorMsg) {
  passField.classList.remove("error");
  confirmField.classList.remove("error");
  errorMsg.textContent = "";
}
