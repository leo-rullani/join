"use strict";
/**
 * Validates the overlay task fields.
 * @returns {boolean} True if the task fields are valid, false otherwise.
 */
function isOverlayTaskValid() {
  return validateTask(
    "overlay-add-task-title-input",
    "overlay-add-task-textarea",
    "overlay-date",
    "overlay-add-task-category",
    "errorOverlayTitle",
    "errorOverlayDescription",
    "errorOverlayDate",
    "errorOverlayCategory"
  );
}
/**
 * Sends the new task to the database using a PUT request.
 * @param {Object} newTask - The task object to be stored.
 * @returns {Promise<Response>} The response from the fetch request.
 */
async function putTaskToDatabase(newTask) {
  const ref = `${window.databaseURL}/tasks/${newTask.id}.json`;
  return await fetch(ref, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask),
  });
}

/**
 * Processes the new task by sending it to the database and handling the response.
 * @param {Object} newTask - The task object to process.
 * @returns {Promise<void>}
 */
async function processNewTask(newTask) {
  try {
    const resp = await putTaskToDatabase(newTask);
    await handleResponse(resp, newTask);
  } catch (err) {
    console.error("Error (Overlay):", err);
  }
}

/**
 * Creates a new task from the overlay form and sends it to the database.
 * @returns {Promise<void>}
 */
async function overlayAddTaskCreateTask() {
  if (!isOverlayTaskValid()) return;
  const newTask = createNewTask();
  await processNewTask(newTask);
}

/**
 * Retrieves input values for the new task.
 * @returns {Object} An object with taskId, title, description, date, and category.
 */
function getTaskInputs() {
  return {
    taskId: "task_" + Date.now(),
    title: document.getElementById("overlay-add-task-title-input").value.trim(),
    description: document
      .getElementById("overlay-add-task-textarea")
      .value.trim(),
    date: document.getElementById("overlay-date").value,
    category: document.getElementById("overlay-add-task-category").value.trim(),
  };
}

/**
 * Creates a new task object using input values and additional data.
 * @returns {Object} The new task object.
 */
function createNewTask() {
  const inputs = getTaskInputs();
  const names = window.overlayAssignedContacts.slice();
  const priority = overlayGetPriority();
  return {
    id: inputs.taskId,
    title: inputs.title,
    description: inputs.description,
    assignees: names,
    date: inputs.date,
    priority: priority,
    category: inputs.category,
    boardCategory: "todo",
    subtasks: window.overlaySubtasksList.map((st) => ({
      name: st,
      done: false,
    })),
  };
}

/**
 * Handles the response from the fetch request.
 * @param {Response} resp - The fetch response.
 * @param {Object} newTask - The newly created task.
 */
async function handleResponse(resp, newTask) {
  if (resp.ok) {
    addTaskCreateTaskConfirmation();
    overlayClearForm();
    document.getElementById("addTaskOverlay").style.display = "none";
    await displayTasks();
  } else {
    console.error("Error saving overlay task:", resp.status);
  }
}

/**
 * Clears the overlay form fields.
 */
function overlayClearForm() {
  document.getElementById("overlay-add-task-title-input").value = "";
  document.getElementById("overlay-add-task-textarea").value = "";
  document.getElementById("overlay-date").value = "";
  document.getElementById("overlay-add-task-category").value = "";
  document.getElementById("overlay-add-task-assigned-avatar").innerHTML = "";
  window.overlayAssignedContacts = [];
  document.getElementById("overlay-add-task-subtasks-list").innerHTML = "";
  overlayAddTaskPrioToggleButton(
    "medium",
    "overlay-add-task-urgent-medium-low-buttons"
  );
  const container = document.getElementById("overlay-add-task-contact");
  if (container) container.innerHTML = "";
}

/**
 * Sets overlay priority via button click.
 * @param {string} prio - The selected priority.
 * @param {string} containerId - The container ID.
 * @param {Event} event - The click event.
 */
function overlayAddTaskPrio(prio, containerId, event) {
  event.preventDefault();
  overlayAddTaskPrioToggleButton(prio, containerId);
}

/**
 * Toggles overlay priority buttons.
 * @param {string} prio - The priority.
 * @param {string} containerId - The container ID.
 */
function overlayAddTaskPrioToggleButton(prio, containerId) {
  const container = document.getElementById(containerId);
  const btns = container.querySelectorAll("button");
  btns.forEach((btn) => {
    btn.classList.remove("add-task-clicked");
    const icon = btn.querySelector("img");
    if (icon) icon.src = `/assets/icons/${btn.dataset.priority}.svg`;
  });
  const active = container.querySelector(`button[data-priority="${prio}"]`);
  if (active) {
    active.classList.add("add-task-clicked");
    const icon = active.querySelector("img");
    if (icon) icon.src = `/assets/icons/${prio}_white.svg`;
  }
}

/**
 * Retrieves the selected overlay priority.
 * @returns {string} The priority.
 */
function overlayGetPriority() {
  const container = document.getElementById(
    "overlay-add-task-urgent-medium-low-buttons"
  );
  const active = container.querySelector(".add-task-clicked");
  return active ? active.dataset.priority : "medium";
}

/**
 * Sets the overlay task category.
 * @param {string} value - The category value.
 */
function overlayAddTaskChoseCategory(value) {
  document.getElementById("overlay-add-task-category").value = value;
}

/**
 * Toggles subtask icon display in overlay.
 */
function overlayAddTaskSubtasksClicked() {
  document
    .getElementById("overlay-add-task-subtasks-icon-plus")
    .classList.add("d-none");
  document
    .getElementById("overlay-add-task-subtasks-icon-plus-check")
    .classList.remove("d-none");
}

/**
 * Adds a subtask in overlay.
 * @param {Event} event - The event.
 */
function overlayAddTaskSubtasks(event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById("overlay-add-task-subtasks-input");
  const val = input.value.trim();
  if (!val) return;
  window.overlaySubtasksList.unshift(val);
  input.value = "";
  document
    .getElementById("overlay-add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("overlay-add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  overlayAddTaskSubtasksList();
}

/**
 * Renders overlay subtasks list.
 */
function overlayAddTaskSubtasksList() {
  const ul = document.getElementById("overlay-add-task-subtasks-list");
  ul.innerHTML = "";
  for (let i = 0; i < window.overlaySubtasksList.length; i++) {
    ul.innerHTML += overlaySubTaskTemplate(window.overlaySubtasksList[i], i);
  }
}

/**
 * Allows editing an overlay subtask.
 * @param {number} index - The subtask index.
 * @param {Event} event - The event.
 */
function overlayEditTaskSubtasksList(index, event) {
  event.stopPropagation();
  const ul = document.getElementById("overlay-add-task-subtasks-list");
  ul.innerHTML = "";
  for (let i = 0; i < window.overlaySubtasksList.length; i++) {
    ul.innerHTML +=
      i === index
        ? overlayEditTaskSubtasksListTemplate(i)
        : overlaySubTaskTemplate(i);
  }
}

/**
 * Confirms editing of an overlay subtask.
 * @param {number} index - The subtask index.
 * @param {Event} event - The event.
 */
function overlayConfirmEditSubtask(index, event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById("overlay-add-task-subtasks-input-edit");
  const newVal = input.value.trim();
  if (!newVal) {
    window.overlaySubtasksList.splice(index, 1);
    window.globalSubtasks.splice(index, 1);
    overlayAddTaskSubtasksList();
    return;
  }
  window.overlaySubtasksList.splice(index, 1, newVal);
  overlayAddTaskSubtasksList();
}

/**
 * Removes an overlay subtask.
 * @param {number} index - The subtask index.
 * @param {Event} event - The event.
 */
function overlayRemoveOverlaySubtask(index, event) {
  event.stopPropagation();
  window.overlaySubtasksList.splice(index, 1);
  overlayAddTaskSubtasksList();
}

/**
 * Removes an overlay subtask (legacy).
 * @param {HTMLElement} el - The element to remove.
 */
function overlayRemoveSubtask(el) {
  const li = el.closest("li");
  if (li) li.remove();
}

/**
 * Focuses the overlay subtask input.
 * @param {Event} event - The event.
 */
function overlayAddSubtasksPlus(event) {
  event.preventDefault();
  overlayAddTaskSubtasksClicked();
  const input = document.getElementById("overlay-add-task-subtasks-input");
  if (input) {
    input.focus();
    input.select();
  }
}

/**
 * Clears the overlay subtask input.
 * @param {Event} event - The event.
 */
function overlayClearSubtasks(event) {
  event.preventDefault();
  document
    .getElementById("overlay-add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("overlay-add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  const input = document.getElementById("overlay-add-task-subtasks-input");
  if (input) input.value = "";
}

/**
 * Displays the contact list in overlay.
 */
function overlayShowContactList() {
  const container = document.getElementById("overlay-add-task-contact");
  if (!container) return;
  container.innerHTML = "";
  window.contactsToAssigned.forEach((contact, i) => {
    const bg = assignColor(contact.name);
    const chk = window.overlayAssignedContacts.includes(contact.name);
    container.innerHTML += overlayShowContactListTemplate(chk, i, bg, contact);
  });
}

/**
 * Filters contacts in overlay.
 */
function overlayAddTaskAssignedToSearch() {
  const search = document
    .getElementById("overlay-find-person")
    .value.toLowerCase();
  const container = document.getElementById("overlay-add-task-contact");
  container.innerHTML = "";
  window.contactsToAssigned.forEach((c, i) => {
    if (!c.name.toLowerCase().includes(search)) return;
    const bg = assignColor(c.name);
    const chk = window.overlayAssignedContacts.includes(c.name);
    container.innerHTML += overlayAddTaskAssignedToSearchTemplate(
      chk,
      i,
      bg,
      c
    );
  });
}

/**
 * Toggles contact selection in overlay.
 * @param {string} contactName - The contact name.
 */
function overlayToggleContactSelection(contactName) {
  const idx = window.overlayAssignedContacts.indexOf(contactName);
  if (idx >= 0) window.overlayAssignedContacts.splice(idx, 1);
  else window.overlayAssignedContacts.push(contactName);
  overlayShowAvatars();
  const searchValue = document
    .getElementById("overlay-find-person")
    .value.trim();
  if (searchValue) overlayAddTaskAssignedToSearch();
  else overlayShowContactList();
}

/**
 * Returns the HTML for a single overlay avatar.
 * @param {string} contact - The contact name.
 * @returns {string} The avatar HTML.
 */
function createOverlayAvatarHtml(contact) {
  const bg = assignColor(contact);
  return `<div class="avatar" style="background-color:${bg};">
    ${getUserInitials(contact)}
  </div>`;
}

/**
 * Returns the HTML for the leftover avatar indicator.
 * @param {number} leftover - The number of remaining contacts.
 * @returns {string} The leftover avatar HTML.
 */
function createOverlayLeftoverAvatarHtml(leftover) {
  return `<div class="avatar-addtaskoverlay">
      +${leftover}
    </div>`;
}

/**
 * Clears the overlay avatar container and renders avatars.
 */
function overlayShowAvatars() {
  const div = document.getElementById("overlay-add-task-assigned-avatar");
  if (!div) return;
  div.innerHTML = "";
  const contacts = window.overlayAssignedContacts || [];
  const maxVisible = 3;
  for (let i = 0; i < contacts.length && i < maxVisible; i++) {
    div.innerHTML += createOverlayAvatarHtml(contacts[i]);
  }
  if (contacts.length > maxVisible) {
    const leftover = contacts.length - maxVisible;
    div.innerHTML += createOverlayLeftoverAvatarHtml(leftover);
  }
}
