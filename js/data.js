/**
 * This file contains all functions responsible for communicating with Firebase and processing data.
 */

let databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Loads all contacts from the Firebase database.
 */
async function loadContacts() {
  const response = await fetch(`${databaseURL}/contacts.json`);
  const data = await response.json();
  window.contactsToAssigned = Object.values(data);
  createAssignedTo();
}

/**
 * Loads all tasks from the Firebase database.
 * @returns {Array} An array of tasks.
 */
async function getTasks() {
  const taskRef = `${databaseURL}/tasks.json`;
  const response = await fetch(taskRef);
  const tasks = await response.json();

  if (response.ok && tasks) {
    return Object.keys(tasks).map((id) => ({ id, ...tasks[id] }));
  } else {
    console.error("No Tasks Found", tasks);
    return [];
  }
}

/**
 * Deletes a task from the Firebase database.
 * @param {string} taskId - The ID of the task to be deleted.
 */
async function deleteTask(taskId) {
  const taskRef = `${databaseURL}/tasks/${taskId}.json`;
  const response = await fetch(taskRef, {
    method: "DELETE",
  });

  if (response.ok) {
    console.log("Task deleted!");
    await displayTasks();
    resetOverlay();
  } else {
    const errorDetails = await response.text();
    console.error("Error deleting task:", response.status, errorDetails);
  }
}

/**
 * Updates the board category of a task in the Firebase database.
 * @param {string} taskId - The ID of the task.
 * @param {string} newBoardCategory - The new board category.
 */
async function updateTaskBoardCategory(taskId, newBoardCategory) {
  const taskRef = `${databaseURL}/tasks/${taskId}.json`;

  const response = await fetch(taskRef, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ boardCategory: newBoardCategory }),
  });

  if (response.ok) {
    console.log("Board category updated successfully:", newBoardCategory);
  } else {
    console.error("Error updating board category");
  }
}

/**
 * Assigns a color to a contact based on the first letter of their name.
 * @param {string} name - The name of the contact.
 * @returns {string} The color assigned to the contact.
 */
function assignColor(name) {
  const colors = {
    A: "#FF5733",
    B: "#33FF57",
    C: "#5733FF",
    D: "#FF33A8",
    E: "#33A8FF",
    F: "#A8FF33",
    G: "#FF8C33",
    H: "#8C33FF",
    I: "#33FFD7",
    J: "#FFD733",
    K: "#33FF8C",
    L: "#D733FF",
    M: "#FF336E",
    N: "#338CFF",
    O: "#33FFBD",
    P: "#FFBD33",
    Q: "#8CFF33",
    R: "#FF338C",
    S: "#336EFF",
    T: "#33FF57",
    U: "#FF5733",
    V: "#5733FF",
    W: "#FF33A8",
    X: "#33A8FF",
    Y: "#A8FF33",
    Z: "#FF8C33",
  };

  let firstLetter = name.trim().charAt(0).toUpperCase();
  return colors[firstLetter] || "#999999";
}

/**
 * Compares two objects by their 'name' property.
 * @param {Object} a - The first object.
 * @param {Object} b - The second object.
 * @returns {number} - Negative if a comes before b, positive if a comes after b, 0 if equal.
 */
function compareByName(a, b) {
  let nameA = a.name.toUpperCase();
  let nameB = b.name.toUpperCase();
  if (nameA < nameB) return -1;
  if (nameA > nameB) return 1;
  return 0;
}

/**
 * Returns profile data (initials, color) for guest or logged-in user.
 * @param {boolean} isGuest - True if no user data is found
 * @returns {{ initials: string, textColor: string, userName: string }}
 */
function getProfileData(isGuest) {
  const ud = sessionStorage.getItem("loggedInUser"),
    u = isGuest ? { userName: "Guest" } : JSON.parse(ud || "{}"),
    nm = u.userName || "User",
    init = isGuest ? "G" : getInitials(nm),
    first = init.charAt(0).toUpperCase(),
    clr = getColorForLetter(first);
  return { initials: init, textColor: clr, userName: nm };
}

/**
 * Extracts initials from a full name (e.g. "John Doe" -> "JD").
 * @param {string} name - The full name
 * @returns {string} The uppercase initials
 */
function getInitials(name) {
  if (typeof name !== "string" || !name.trim()) return "U";
  const p = name.trim().split(" ");
  let i = p[0].charAt(0).toUpperCase();
  if (p.length > 1) i += p[p.length - 1].charAt(0).toUpperCase();
  return i;
}

/**
 * Returns a color code based on the first letter.
 * @param {string} l - The first letter
 * @returns {string} The corresponding hex color
 */
function getColorForLetter(l) {
  const m = {
    A: "#FF5733",
    B: "#33FF57",
    C: "#5733FF",
    D: "#FF33A8",
    E: "#33A8FF",
    F: "#A8FF33",
    G: "#FF8C33",
    H: "#8C33FF",
    I: "#33FFD7",
    J: "#FFD733",
    K: "#33FF8C",
    L: "#D733FF",
    M: "#FF336E",
    N: "#338CFF",
    O: "#33FFBD",
    P: "#FFBD33",
    Q: "#8CFF33",
    R: "#FF338C",
    S: "#336EFF",
    T: "#33FF57",
    U: "#FF5733",
    V: "#5733FF",
    W: "#FF33A8",
    X: "#33A8FF",
    Y: "#A8FF33",
    Z: "#FF8C33",
  };
  return m[l] || "#000";
}

/**
 * Toggles the small menu at the profile icon.
 */
function toggleRespMenu() {
  let menu = document.getElementById("resp_menu");
  menu.classList.toggle("resp_menu_closed");
  menu.classList.toggle("resp_menu_open");
}

/**
 * Adds minimum date attribute to an input field with id "date",
 * setting it to today's date.
 */
function addTaskMinimumDate() {
  // Get today's date in ISO format (YYYY-MM-DD)
  let today = new Date().toISOString().split("T")[0];

  // Set the minimum date attribute of the input field with id "date"
  document.getElementById("date").setAttribute("min", today);
}

/**
 * Updates the priority toggle buttons based on the provided priority value.
 * @param {string} prio - The priority value ('urgent', 'medium', or 'low').
 * @param {string} container - The ID of the container holding the buttons.
 */
function addTaskPrioToggleButton(prio, container) {
  const buttonContainer = document.getElementById(container);
  const buttons = buttonContainer.children;

  for (const button of buttons) {
    if (button.dataset.priority == prio) {
      button.classList.add("add-task-clicked");
      button.children[0].children[1].src = `/assets/icons/${button.dataset.priority}_white.svg`;
    } else {
      button.classList.remove("add-task-clicked");
      button.children[0].children[1].src = `/assets/icons/${button.dataset.priority}.svg`;
    }
  }
}

/**
 * Unchecks all checkboxes with the class "add-task-checkbox".
 */
function addTaskAssignedToUnCheck() {
  // Select all checkboxes with the class "add-task-checkbox"
  const checkBoxes = document.querySelectorAll(".add-task-checkbox");

  // Loop through each checkbox
  for (let i = 0; i < checkBoxes.length; i++) {
    // If the checkbox is checked, uncheck it
    if (checkBoxes[i].checked) {
      checkBoxes[i].checked = false;
    }
  }
}

/**
 * Resets the form used for adding a task to its initial state.
 */
function addTaskClearFormularReset() {
  window.globalSubtasks = [];
  window.subtasksList = [];
  document.getElementById("add-task-title-input").value = "";
  document.getElementById("add-task-textarea").value = "";
  addTaskAssignedToUnCheck();
  document.getElementById("date").value = "";
  document.getElementById("add-task-category").value = "";
  document.getElementById("add-task-assigned-avatar").innerHTML = "";
  document.getElementById("add-task-subtasks-input").value = "";
  document.getElementById("add-task-subtasks-list").innerHTML = "";
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  addTaskPrioToggleButton(
    (prio = "medium"),
    "add-task-urgent-medium-low-buttons"
  );
}

/**
 * Clears the add task form and prevents default form submission behavior.
 * @param {*} event - The event object triggered by the user action.
 */
function addTaskClearFormular(event) {
  event.preventDefault();
  addTaskClearFormularReset();
}

/**
 * Displays a toast notification with the provided message.
 * @param {string} message - The message to display in the toast.
 */
function showToast(message) {
  const notification = document.getElementById("add_notification");
  notification.textContent = message;
  notification.classList.add("show");
  notification.style.right = "-50px";
  notification.style.bottom = "150px";
  notification.offsetHeight;
  notification.style.transition = "right 0.3s ease-in-out";
  notification.style.right = "150px";
  setTimeout(() => {
    notification.style.transition = "right 0.3s ease-in-out";
    notification.style.right = "-500px";
  }, 3000);
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3300);
}

/**
 * Returns the path to the contacts in the database based on whether the user is a guest or logged in.
 * @returns {string|null} The path to the contacts or null if no user is found.
 */
function getContactsPath() {
  if (isGuest()) {
    return `${databaseURL}/contacts`;
  }

  let user = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!user) {
    console.error("No logged-in user found.");
    return null;
  }
  return `${databaseURL}/users/${user.id}/contacts`;
}

/**
 * Checks if the current user is a guest.
 * @returns {boolean} True if the user is a guest, false otherwise.
 */
function isGuest() {
  return sessionStorage.getItem("guestSession") !== null;
}

/**
 * Fetches contacts from the server for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} The contacts data.
 */
async function getContactsFromServer(userId) {
  let response = await fetch(`${databaseURL}/users/${userId}/contacts.json`);
  if (!response.ok) {
    throw new Error("Data can not be found");
  }
  return await response.json();
}

/**
 * Processes the contacts data into an array of contact objects.
 * @param {Object} contactsData - The raw contacts data from the server.
 * @returns {Array} An array of contact objects.
 */
function processContactsData(contactsData) {
  if (!contactsData || typeof contactsData !== "object") {
    return [];
  }

  let contactsArray = Object.entries(contactsData).map(([id, data]) => ({
    id,
    ...data,
  }));

  contactsArray = contactsArray.filter((contact) => contact.name);
  contactsArray.sort((a, b) => a.name.localeCompare(b.name));

  return contactsArray;
}

/**
 * Groups contacts by the first letter of their name.
 * @param {Array} contacts - The array of contact objects.
 * @returns {Object} An object where keys are letters and values are arrays of contacts.
 */
function groupContactsByLetter(contacts) {
  let grouped = {};

  contacts.forEach((contact) => {
    let firstLetter = contact.name.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(contact);
  });

  return grouped;
}

/**
 * Gets the initials from a full name.
 * @param {string} fullName - The full name of the contact.
 * @returns {string} The initials.
 */
function getContactInitials(fullName) {
  return fullName
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

/**
 * Gets the form data for a new contact.
 * @returns {Object} The contact data.
 */
function getContactFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
  };
}

/**
 * Clears the contact form.
 */
function clearContactForm() {
  document.getElementById("name").value =
    document.getElementById("email").value =
    document.getElementById("phone").value =
      "";
}

/**
 * Saves a contact to the server.
 * @param {Object} contact - The contact data.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string>} The ID of the saved contact.
 */
async function saveContactToServer(contact, userId) {
  let response = await fetch(`${databaseURL}/users/${userId}/contacts.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to save contact: ${errorData}`);
  }
  let data = await response.json();
  return data.name;
}

/**
 * Updates a contact on the server.
 * @param {string} contactId - The ID of the contact.
 * @param {string} name - The updated name.
 * @param {string} email - The updated email.
 * @param {string} phone - The updated phone number.
 * @returns {Promise<void>}
 */
async function updateContact(contactId, name, email, phone) {
  let updatedContact = { name, email, phone };
  const contactsPath = getContactsPath();
  if (!contactsPath) return;

  try {
    const response = await fetch(`${contactsPath}/${contactId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedContact),
    });

    if (!response.ok) {
      throw new Error("Update Contact Failed.");
    }
  } catch (error) {
    console.error("Update Error:", error);
  }
}

/**
 * Deletes a contact from the server.
 * @param {string} contactId - The ID of the contact.
 * @returns {Promise<void>}
 */
async function deleteContactFromServer(contactId) {
  const contactsPath = getContactsPath();
  if (!contactsPath) return;

  try {
    const response = await fetch(`${contactsPath}/${contactId}.json`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete contact: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting contact:", error);
  }
}

// Global variables
window.globalPrio = "medium";
window.globalCategory = "";
window.globalSubtasks = [];
window.subtasksList = [];
window.assignedContacts = [];
window.contactsToAssigned = [];
window.selectedTask = null;

// Make functions globally available
window.loadContacts = loadContacts;
window.getTasks = getTasks;
window.deleteTask = deleteTask;
window.updateTaskBoardCategory = updateTaskBoardCategory;
window.assignColor = assignColor;
window.compareByName = compareByName;
window.getProfileData = getProfileData;
window.getInitials = getInitials;
window.getColorForLetter = getColorForLetter;
window.addTaskMinimumDate = addTaskMinimumDate;
window.addTaskPrioToggleButton = addTaskPrioToggleButton;
window.addTaskAssignedToUnCheck = addTaskAssignedToUnCheck;
window.addTaskClearFormularReset = addTaskClearFormularReset;
window.addTaskClearFormular = addTaskClearFormular;
window.showToast = showToast;
window.getContactsPath = getContactsPath;
window.isGuest = isGuest;
window.getContactsFromServer = getContactsFromServer;
window.processContactsData = processContactsData;
window.groupContactsByLetter = groupContactsByLetter;
window.getContactInitials = getContactInitials;
window.getContactFormData = getContactFormData;
window.clearContactForm = clearContactForm;
window.saveContactToServer = saveContactToServer;
window.updateContact = updateContact;
window.deleteContactFromServer = deleteContactFromServer;
