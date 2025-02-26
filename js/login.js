"use strict";
window.databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";
const dummyUsers = [{ email: "test@user.com", password: "test123" }];

document.addEventListener("DOMContentLoaded", init);

/**
 * Initializes the application by setting up the UI and event listeners.
 * Retrieves DOM elements, user data, handles screen size adjustments,
 * initializes logo animations, and sets up input focus clearing.
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
 * Retrieves and returns the essential DOM elements for the application.
 * @returns {Object} An object containing references to the logo container,
 * form container, top-right element, footer, guest login button,
 * email input, password input, and error message div.
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
 * Handles screen size adjustments.
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
 * Initializes the logo animation based on the "skipAnimation" URL parameter.
 * @param {HTMLElement} logo - The logo container element.
 * @param {HTMLElement} form - The form element to display.
 */
function initLogoAnimation(logo, form) {
  const params = new URLSearchParams(window.location.search);
  const skipAnimation = params.get("skipAnimation") === "true";
  skipAnimation ? runSkipAnimation(logo, form) : runFullAnimation(logo, form);
}

/**
 * Skips the logo animation and sets the final state directly.
 * @param {HTMLElement} logo - The logo container element.
 * @param {HTMLElement} form - The form element to display.
 */
function runSkipAnimation(logo, form, signupButton) {
  signupButton = document.getElementById("signBTN");
  logo.classList.add("fixed-logo");
  logo.classList.remove("logo-container");
  blueAnimation(logo);
  whiteAnimation(logo);
  form.classList.remove("hidden");
  form.classList.add("visible");
}

/**
 * Applies a white animation effect by changing the background color
 * and logo image for smaller screens.
 *
 * @param {HTMLElement} logo - The logo element that contains the image.
 */
function whiteAnimation(logo) {
  if (window.innerWidth <= 500) {
    document.body.style.backgroundColor = "#F6F7F8";
    logo.querySelector("img").src = "/assets/img/join-logo-blue.svg";
    document.querySelector(".top-right").classList.remove("hidden");
    document.querySelector(".footer").classList.remove("hidden");
  }
}

/**
 * Applies a blue animation effect by changing the background color
 * and logo image for smaller screens.
 *
 * @param {HTMLElement} logo - The logo element that contains the image.
 */
function blueAnimation(logo) {
  if (window.innerWidth <= 500) {
    document.body.style.backgroundColor = "#2b3647";
    logo.querySelector("img").src = "/assets/img/join-logo-white.svg";
  }
}

/**
 * Runs the full logo animation.
 * @param {HTMLElement} logo - The logo container element.
 * @param {HTMLElement} form - The form element to display after animation.
 */
function runFullAnimation(logo, form) {
  blueAnimation(logo);
  setTimeout(() => logo.classList.add("move-logo"), 500);
  logo.addEventListener("transitionend", () => {
    whiteAnimation(logo);
    form.classList.remove("hidden");
    form.classList.add("visible");
  });
}

/**
 * Clears error styles on focus.
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
 * Fetches user data from the database.
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
    return usersArray;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

/**
 * Handles form submission for login.
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
 * Verifies user credentials.
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
 * Fills the email input with a default value if empty.
 */
function fillEmail() {
  const emailInput = document.getElementById("email");
  if (emailInput.value.trim() === "") emailInput.value = "test@user.com";
}

/**
 * Toggles password visibility.
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
 * Clears error styles.
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
 * Displays error styles.
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
 * Displays a success message and redirects to the summary page.
 */
function loginSuccess() {
  showToast("Login successful!");
  setTimeout(() => (window.location.href = "summary.html"), 2000);
}

/**
 * Displays a toast message.
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
  n.getBoundingClientRect();
  n.style.bottom = `${fB}px`;
  n.classList.add("show");
  setTimeout(() => {
    n.classList.remove("show");
    setTimeout(() => n.classList.add("hidden"), 500);
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  setGreeting();
});

/**
 * Redirects to the summary page on guest login click.
 */
function guestLogin() {
  let guestId = generateGuestId();
  sessionStorage.setItem("guestSession", guestId);
  window.location.href = "summary.html";
}

/**
 * Generates a unique guest ID.
 * @returns {string} The generated guest ID
 */
function generateGuestId() {
  return "guest_" + Math.random().toString(36).substr(2, 9);
}

/**
 * Sets the greeting based on the time of day.
 */
function setGreeting() {
  const greetingText = document.getElementById("greeting_text");
  if (!greetingText) return;

  const currentHour = new Date().getHours();
  let greeting;

  if (currentHour >= 5 && currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else if (currentHour >= 18 && currentHour < 22) {
    greeting = "Good evening";
  } else {
    greeting = "Good night";
  }

  greetingText.textContent = greeting;
}
