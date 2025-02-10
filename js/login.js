"use strict";
/**
 * @file login.js
 * Contains all logic for initialization, data fetching, authentication, and UI helpers.
 */

/**
 * A sample list of dummy users for demo purposes.
 * In a real app, you'd typically fetch from a server/db.
 */
const dummyUsers = [{ email: "test@user.com", password: "test123" }];

/**
 * Fires once the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", init);

/**
 * init
 * Gathers elements, fetches user data, adjusts layout, and initializes listeners.
 */
function init() {
  const {
    logoContainer,
    form,
    topRight,
    footer,
    emailInput,
    passwordInput,
    errorDiv,
  } = getElements();
  getUserData();
  handleScreenSize(topRight, footer);
  initLogoAnimation(logoContainer, form);
  initFocusClear(emailInput, errorDiv);
  initFocusClear(passwordInput, errorDiv);
}

/**
 * getElements
 * @returns {Object} An object containing references to DOM elements.
 */
function getElements() {
  return {
    logoContainer: document.querySelector(".logo-container"),
    form: document.querySelector(".form-container"),
    topRight: document.querySelector(".top-right"),
    footer: document.querySelector(".footer"),
    guestLoginBtn: document.querySelector(".guest-btn"),
    emailInput: document.getElementById("email"),
    passwordInput: document.getElementById("password"),
    errorDiv: document.getElementById("errorMessage"),
  };
}

/**
 * handleScreenSize
 * Shows or hides elements based on screen width (≤ 500px).
 * @param {HTMLElement} topRight - The top-right element
 * @param {HTMLElement} footer - The footer element
 */
function handleScreenSize(topRight, footer) {
  if (window.innerWidth <= 500) {
    topRight.classList.add("hidden");
    footer.classList.add("hidden");
  } else {
    topRight.classList.remove("hidden");
    footer.classList.remove("hidden");
  }
}

/**
 * initLogoAnimation
 * Handles logo animation and color changes for small screens, then shows the form.
 * @param {HTMLElement} logo - The logo container
 * @param {HTMLElement} form - The form container
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
 * initGuestLogin
 * Redirects to the summary page on guest login click.
 * @param {HTMLElement} guestLoginBtn - The "guest login" button
 */

/**
 * initFocusClear
 * Removes error styles and messages when focusing on an input element.
 *
 * @param {HTMLInputElement} inputElement - The input field
 * @param {HTMLElement} errorDiv - The container for error messages
 */
function initFocusClear(inputElement, errorDiv) {
  inputElement.addEventListener("focus", () => {
    inputElement.classList.remove("error");
    errorDiv.textContent = "";
  });
}

/**
 * getUserData
 * Fetches user data from the database and converts it to an array.
 * @async
 * @returns {Promise<Array>} An array of user objects
 */
async function getUserData() {
  try {
    const response = await fetch(`${databaseURL}/users.json`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const users = await response.json();
    if (!users || typeof users !== "object") return [];
    const usersArray = Object.entries(users).map(([id, data]) => ({
      id,
      ...data,
    }));
    console.log("Converted usersArray:", usersArray);
    return usersArray;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

/**
 * handleLogin
 * Form submission handler that fetches user data and calls the login logic.
 * @async
 * @param {Event} event - The form submit event
 */
async function handleLogin(event) {
  event.preventDefault();
  const users = await getUserData();
  if (!Array.isArray(users)) {
    console.error("Error: users is not an array.");
    return;
  }
  login(event, users);
}

/**
 * login
 * Verifies user credentials and triggers success or error feedback.
 * @async
 * @param {Event} event - The form submit event
 * @param {Array} users - The list of user objects
 */
async function login(event, users) {
  event.preventDefault();
  const e = document.getElementById("email"),
    p = document.getElementById("password"),
    err = document.getElementById("errorMessage"),
    email = e.value.trim(),
    pass = p.value.trim(),
    user = users.find((u) => u.userEmail === email && u.password === pass);
  if (user) {
    clearErrorStyles(e, p, err);
    loginSuccess();
    sessionStorage.setItem("loggedInUser", JSON.stringify(user));
  } else {
    showErrorStyles(e, p, err);
  }
}

/**
 * fillEmail
 * Fills the email input with a default value if empty.
 */
function fillEmail() {
  const emailInput = document.getElementById("email");
  if (emailInput.value.trim() === "") emailInput.value = "test@user.com";
}

/**
 * togglePassword
 * Toggles password visibility and updates the icon.
 */
function togglePassword() {
  const p = document.getElementById("password"),
    i = document.getElementById("passwordIcon");
  if (i.src.includes("lock.svg")) {
    i.src = "/assets/icons/eye-crossed.svg";
    p.type = "password";
  } else if (i.src.includes("eye-crossed.svg")) {
    p.type = "text";
    i.src = "/assets/icons/eye-thin.svg";
  } else if (i.src.includes("eye-thin.svg")) {
    p.type = "password";
    i.src = "/assets/icons/eye-crossed.svg";
  }
}

/**
 * clearErrorStyles
 * Removes error classes and clears the error message.
 * @param {HTMLInputElement} emailInput - The email input element
 * @param {HTMLInputElement} passwordInput - The password input element
 * @param {HTMLElement} errorDiv - The container for error messages
 */
function clearErrorStyles(emailInput, passwordInput, errorDiv) {
  emailInput.classList.remove("error");
  passwordInput.classList.remove("error");
  errorDiv.textContent = "";
}

/**
 * showErrorStyles
 * Adds error classes and sets the error message text.
 * @param {HTMLInputElement} emailInput - The email input element
 * @param {HTMLInputElement} passwordInput - The password input element
 * @param {HTMLElement} errorDiv - The container for error messages
 */
function showErrorStyles(emailInput, passwordInput, errorDiv) {
  emailInput.classList.add("error");
  passwordInput.classList.add("error");
  errorDiv.textContent = "Check your email and password. Please try again.";
}

/**
 * loginSuccess
 * Displays a success toast message and redirects to the summary page.
 */
function loginSuccess() {
  showToast("Login successful!");
  setTimeout(() => (window.location.href = "summary.html"), 2000);
}

/**
 * showToast
 * Displays an animated toast message.
 * @param {string} message - The message to display
 */
function showToast(message) {
  const n = document.getElementById("notification");
  if (!n) return;
  n.textContent = message;
  n.classList.remove("hidden");
  n.style.bottom = "-120px";
  const r = document.querySelector(".login-box").getBoundingClientRect();
  const mY = r.top + r.height / 2;
  const fB = window.innerHeight - mY;
  n.getBoundingClientRect(); // Force reflow
  n.style.bottom = `${fB}px`;
  n.classList.add("show");
  setTimeout(() => {
    n.classList.remove("show");
    setTimeout(() => n.classList.add("hidden"), 500);
  }, 3000);
}