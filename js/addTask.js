"use strict";
/**
 * Initializes the main add-task form.
 * @returns {Promise<void>}
 */
function initAddTask() {
  loadContacts().then(() => {
    createAssignedTo();
    getCategoryFromUrl();
  });
}
window.initAddTask = initAddTask;

/**
 * Retrieves category from URL parameters.
 * @returns {void}
 */
function getCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("category"))
    window.globalBoardCategory = params.get("category");
}
window.getCategoryFromUrl = getCategoryFromUrl;

/**
 * Gets and clears the task title.
 * @returns {string}
 */
function addTaskTitle() {
  const title = document.getElementById("add-task-title-input").value;
  document.getElementById("add-task-title-input").value = "";
  return title;
}
window.addTaskTitle = addTaskTitle;

/**
 * Gets and clears the task description.
 * @returns {string}
 */
function addTaskDescription() {
  const desc = document.getElementById("add-task-textarea").value;
  document.getElementById("add-task-textarea").value = "";
  return desc;
}
window.addTaskDescription = addTaskDescription;

/**
 * Gets and clears the due date.
 * @returns {string}
 */
function addTaskDueDate() {
  const date = document.getElementById("date").value;
  document.getElementById("date").value = "";
  return date;
}
window.addTaskDueDate = addTaskDueDate;

/**
 * Validates the add task form.
 * @returns {boolean} True if the form is valid, otherwise false.
 */
function checkAddTaskValidation() {
  return validateTask(
    "add-task-title-input",
    "add-task-textarea",
    "date",
    "add-task-category",
    "errorTitle",
    "errorDescription",
    "errorDate",
    "errorCategory"
  );
}

/**
 * Builds a new task object from form inputs.
 * @returns {Object} The new task object.
 */
function buildNewTaskObject() {
  const taskId = "task_" + Date.now();
  const title = addTaskTitle();
  const desc = addTaskDescription();
  const names = window.assignedContacts.slice();
  const date = addTaskDueDate();
  const subtasks = window.globalSubtasks || [];
  return {
    id: taskId,
    title: title,
    description: desc,
    assignees: names,
    date: date,
    priority: window.globalPrio,
    category: window.globalCategory,
    boardCategory: "todo",
    subtasks: subtasks.map((sb) => ({ name: sb, done: false })),
  };
}

/**
 * Sends the new task to the server.
 * @param {Object} newTask - The task object to send.
 * @returns {Promise<void>}
 */
function sendNewTask(newTask) {
  const ref = `${window.databaseURL}/tasks/${newTask.id}.json`;
  return fetch(ref, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask),
  })
    .then((resp) => {
      if (resp.ok) {
        addTaskClearFormularReset();
        addTaskCreateTaskConfirmation();
      } else {
        console.error("Error saving task");
      }
    })
    .catch((err) => console.error("Error:", err));
}

/**
 * Creates a new task from the add task form.
 * @returns {Promise<void>}
 */
async function addTaskCreateTask() {
  if (!checkAddTaskValidation()) return;
  const newTask = buildNewTaskObject();
  await sendNewTask(newTask);
}
window.addTaskCreateTask = addTaskCreateTask;

/**
 * Sets the task category.
 * @param {string} category
 * @returns {void}
 */
function addTaskChoseCategory(category) {
  document.getElementById("add-task-category").value = category;
  window.globalCategory = category;
}
window.addTaskChoseCategory = addTaskChoseCategory;

/**
 * Adds a subtask to the main form.
 * @param {Event} event
 * @returns {void}
 */
function addTaskSubtasks(event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById("add-task-subtasks-input");
  const val = input.value.trim();
  if (!val) return;
  window.globalSubtasks.unshift(val);
  window.subtasksList.unshift(val);
  addTaskSubtasksList();
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  input.value = "";
}
window.addTaskSubtasks = addTaskSubtasks;

/**
 * Renders the contact list for assignment.
 * @returns {void}
 */
function createAssignedTo() {
  const container = document.getElementById("add-task-contact");
  if (!container) return;
  container.innerHTML = "";
  window.contactsToAssigned.forEach((c, i) => {
    const bg = assignColor(c.name);
    const chk = window.assignedContacts.includes(c.name);
    container.innerHTML += createAssignedToTemplate(chk, i, bg, c);
  });
}
window.createAssignedTo = createAssignedTo;

/**
 * Filters contacts in the main form.
 * @returns {void}
 */
function addTaskAssignedToSearch() {
  const search = document.getElementById("find-person").value.toLowerCase();
  const container = document.getElementById("add-task-contact");
  container.innerHTML = "";
  window.contactsToAssigned.forEach((c, i) => {
    if (!c.name.toLowerCase().includes(search)) return;
    const bg = assignColor(c.name);
    const chk = window.assignedContacts.includes(c.name);
    container.innerHTML += addTaskAssignedToSearchTemplate(chk, i, bg, c);
  });
}
window.addTaskAssignedToSearch = addTaskAssignedToSearch;

/**
 * Toggles a contact selection.
 * @param {string} contactName
 * @returns {void}
 */
function toggleContactSelection(contactName) {
  const idx = window.assignedContacts.indexOf(contactName);
  if (idx >= 0) {
    window.assignedContacts.splice(idx, 1);
  } else {
    window.assignedContacts.push(contactName);
  }

  addTaskShowAvatars();
  const searchValue = document.getElementById("find-person").value.trim();
  if (searchValue) {
    addTaskAssignedToSearch();
  } else {
    createAssignedTo();
  }
}
window.toggleContactSelection = toggleContactSelection;

/**
 * Returns the HTML for a single task avatar.
 * @param {string} contact - The contact name.
 * @returns {string} The HTML string for the avatar.
 */
function createTaskAvatarHtml(contact) {
  const bg = assignColor(contact);
  return `<div class="avatar" style="background:${bg}">${getUserInitials(
    contact
  )}</div>`;
}

/**
 * Returns the HTML for the leftover avatar indicator.
 * @param {number} leftover - The number of extra contacts.
 * @returns {string} The HTML string for the leftover indicator.
 */
function createTaskLeftoverAvatarHtml(leftover) {
  return `<div class="avatar-addtaskoverlay">+${leftover}</div>`;
}

/**
 * Clears the assigned avatars container and renders avatars for assigned contacts.
 * @returns {void}
 */
function addTaskShowAvatars() {
  const container = document.getElementById("add-task-assigned-avatar");
  if (!container) return;
  container.innerHTML = "";
  const contacts = window.assignedContacts || [];
  const max = 3;
  for (let i = 0; i < contacts.length && i < max; i++) {
    container.innerHTML += createTaskAvatarHtml(contacts[i]);
  }
  if (contacts.length > max) {
    const leftover = contacts.length - max;
    container.innerHTML += createTaskLeftoverAvatarHtml(leftover);
  }
}
window.addTaskShowAvatars = addTaskShowAvatars;

/**
 * Loads contacts from Firebase.
 * @returns {Promise<void>}
 */
async function loadContacts() {
  const resp = await fetch(`${window.databaseURL}/contacts.json`);
  const data = await resp.json();
  window.contactsToAssigned = Object.values(data || {});
  createAssignedTo();
}
window.loadContacts = loadContacts;

/**
 * Sets the minimum due date.
 * @returns {void}
 */
function addTaskMinimumDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").setAttribute("min", today);
}
window.addTaskMinimumDate = addTaskMinimumDate;

/**
 * Toggles the priority buttons.
 * @param {string} prio
 * @param {string} containerId
 * @returns {void}
 */
function addTaskPrioToggleButton(prio, containerId) {
  const container = document.getElementById(containerId);
  const btns = container.children;
  for (const btn of btns) {
    if (btn.dataset.priority === prio) {
      btn.classList.add("add-task-clicked");
      btn.children[0].children[1].src = `/assets/icons/${btn.dataset.priority}_white.svg`;
    } else {
      btn.classList.remove("add-task-clicked");
      btn.children[0].children[1].src = `/assets/icons/${btn.dataset.priority}.svg`;
    }
  }
}
window.addTaskPrioToggleButton = addTaskPrioToggleButton;

/**
 * Unchecks all contact checkboxes.
 * @returns {void}
 */
function addTaskAssignedToUnCheck() {
  const boxes = document.querySelectorAll(".add-task-checkbox");
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) boxes[i].checked = false;
  }
}
window.addTaskAssignedToUnCheck = addTaskAssignedToUnCheck;
