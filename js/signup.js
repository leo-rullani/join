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
  formContainer.classList.remove("hidden");
  footer.classList.remove("hidden");
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
 * Retrieves all required form elements by their IDs.
 * @returns {Object} Object containing form elements.
 */
function getFormElements() {
  return {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirm-password"),
    policyCheckbox: document.getElementById("policy-checkbox"),
    errorMessage: document.getElementById("errorMessage"),
  };
}

/**
 * Extracts and trims user data from form fields.
 * @param {HTMLElement} name - The input element for the user's name.
 * @param {HTMLElement} email - The input element for the user's email.
 * @param {HTMLElement} password - The input element for the user's password.
 * @returns {Object} User data object.
 */
function getUserData(name, email, password) {
  return {
    userName: name.value.trim(),
    userEmail: email.value.trim(),
    password: password.value.trim(),
  };
}

/**
 * Validates the sign-up form fields.
 * @param {Object} elems - The form elements.
 * @returns {boolean} True if form is valid, false otherwise.
 */
function isFormValid({
  email,
  password,
  confirmPassword,
  policyCheckbox,
  errorMessage,
}) {
  return (
    validateEmail(email, errorMessage) &&
    validatePasswords(password, confirmPassword, errorMessage) &&
    validatePolicy(policyCheckbox)
  );
}

/**
 * Processes user registration and handles the registration response.
 * @param {Object} userData - The user's data.
 * @param {HTMLElement} errorMessage - The element to display errors.
 */
function processRegistration(userData, errorMessage) {
  registerUser(userData)
    .then((newUserKey) => handleUserRegistration(userData, newUserKey))
    .catch((error) => handleError(error, errorMessage));
}

/**
 * Handles the sign-up form submission event.
 * @param {Event} event - The event object.
 */
function signUp(event) {
  event.preventDefault();
  const elems = getFormElements();
  clearErrorStyles(elems.password, elems.confirmPassword, elems.errorMessage);
  if (!isFormValid(elems)) return;
  const userData = getUserData(elems.name, elems.email, elems.password);
  processRegistration(userData, elems.errorMessage);
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
 * Validates the email address entered in the form.
 *
 * @function validateEmail
 * @returns {boolean} True if the email is valid; otherwise, false.
 *
 * @description This function checks if the email field is empty or if it does not match the
 * specified email pattern. It updates the error message displayed to the user accordingly.
 */
function validateEmail() {
  const { email, errorMessage } = getFormElements();
  const emailValue = email.value.trim();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  if (!emailValue) {
    errorMessage.textContent = "Email cannot be empty.";
    return false;
  } else if (!emailPattern.test(emailValue)) {
    errorMessage.textContent = "Please enter a valid email address.";
    return false;
  } else {
    errorMessage.textContent = "";
    return true;
  }
}

/**
 * Handles user registration by saving user data and redirecting.
 * @param {{ userName: string, userEmail: string, password: string }} userData - The user data to save.
 * @param {string} newUserKey - The new user's unique key.
 */
function handleUserRegistration() {
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
