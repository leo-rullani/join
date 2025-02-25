"use strict";
/**
 * Opens the edit overlay for a task.
 * @param {string} taskId - The task ID.
 * @returns {void}
 */
function editTask(taskId) {
  window.editingMode = true;
  window.editingTaskId = taskId;
  openBoardOverlay(taskId);
}
window.editTask = editTask;

/**
 * Fills the edit form with task data.
 * @param {Object} task - The task object.
 * @returns {void}
 */
function fillEditFormData(task) {
  setTaskDetails(task);
  editTogglePrioButton(
    task.priority || "medium",
    "overlay-edit-task-urgent-medium-low-buttons"
  );
  window.editOverlaySubtasksList = (task.subtasks || []).map((sub) => sub.name);
  renderEditOverlaySubtasksList();
  window.editAssignedContacts = [...(task.assignees || [])];
  editShowAvatars();
  window.oldBoardCategory = task.boardCategory;
}
window.fillEditFormData = fillEditFormData;

/**
 * Sets basic task details in the edit form.
 * @param {Object} task - The task object.
 * @returns {void}
 */
function setTaskDetails(task) {
  document.getElementById("overlay-edit-task-title-input").value = task.title;
  document.getElementById("overlay-edit-task-textarea").value =
    task.description;
  document.getElementById("overlay-edit-date").value = task.date || "";
  document.getElementById("overlay-edit-task-category").value =
    task.category || "";
}
window.setTaskDetails = setTaskDetails;

/**
 * Populates the subtasks list in the edit overlay.
 * @param {Array} subtasks - Array of subtasks.
 * @returns {void}
 */
function populateSubtasksList(subtasks) {
  const ul = document.getElementById("overlay-edit-task-subtasks-list");
  ul.innerHTML = "";
  subtasks.forEach((sub, i) => {
    const li = document.createElement("li");
    li.innerHTML = createExistingSubtaskLi(sub, i);
    ul.appendChild(li);
  });
}
window.populateSubtasksList = populateSubtasksList;

/**
 * Sets task priority in the edit overlay.
 * @param {string} prio - The priority.
 * @param {string} containerId - The container ID.
 * @param {Event} event - The event.
 * @returns {void}
 */
function editSetTaskPrio(prio, containerId, event) {
  event.preventDefault();
  editTogglePrioButton(prio, containerId);
}
window.editSetTaskPrio = editSetTaskPrio;

/**
 * Toggles priority buttons in the edit overlay.
 * @param {string} prio - The priority.
 * @param {string} containerId - The container ID.
 * @returns {void}
 */
function editTogglePrioButton(prio, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
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
window.editTogglePrioButton = editTogglePrioButton;

/**
 * Retrieves the selected priority in the edit overlay.
 * @returns {string} The selected priority.
 */
function getEditTaskPriority() {
  const container = document.getElementById(
    "overlay-edit-task-urgent-medium-low-buttons"
  );
  if (!container) return "medium";
  const active = container.querySelector(".add-task-clicked");
  return active ? active.dataset.priority : "medium";
}
window.getEditTaskPriority = getEditTaskPriority;

/**
 * Sets the category in the edit overlay.
 * @param {string} value - The category value.
 * @param {Event} event - The event.
 * @returns {void}
 */
function editSetCategory(value, event) {
  if (event) event.preventDefault();
  document.getElementById("overlay-edit-task-category").value = value;
}
window.editSetCategory = editSetCategory;

/**
 * Toggles subtasks icon display in the edit overlay.
 * @returns {void}
 */
function editSubtasksClicked() {
  document
    .getElementById("overlay-edit-task-subtasks-icon-plus")
    .classList.add("d-none");
  document
    .getElementById("overlay-edit-task-subtasks-icon-plus-check")
    .classList.remove("d-none");
}
window.editSubtasksClicked = editSubtasksClicked;

/**
 * Adds a new subtask in the edit overlay.
 * @param {Event} event - The event.
 * @returns {void}
 */
function editAddSubtask(event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById("overlay-edit-task-subtasks-input");
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  window.editOverlaySubtasksList.unshift(val);
  window.globalSubtasks.unshift(val);
  input.value = "";
  document
    .getElementById("overlay-edit-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("overlay-edit-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  renderEditOverlaySubtasksList();
}
window.editAddSubtask = editAddSubtask;

/**
 * Renders the edit overlay subtasks list.
 * @returns {void}
 */
function renderEditOverlaySubtasksList() {
  const ul = document.getElementById("overlay-edit-task-subtasks-list");
  ul.innerHTML = "";
  for (let i = 0; i < window.editOverlaySubtasksList.length; i++) {
    ul.innerHTML += createEditOverlaySubtaskTemplate(
      window.editOverlaySubtasksList[i],
      i
    );
  }
}
window.renderEditOverlaySubtasksList = renderEditOverlaySubtasksList;

/**
 * Switches a subtask into edit mode.
 * @param {number} index - The subtask index.
 * @param {Event} event - The event.
 * @returns {void}
 */
function editOverlaySubtask(index, event) {
  event.stopPropagation();
  const ul = document.getElementById("overlay-edit-task-subtasks-list");
  ul.innerHTML = "";
  for (let i = 0; i < window.editOverlaySubtasksList.length; i++) {
    if (i === index)
      ul.innerHTML += createEditOverlaySubtaskEditMode(
        window.editOverlaySubtasksList[i],
        i
      );
    else
      ul.innerHTML += createEditOverlaySubtaskTemplate(
        window.editOverlaySubtasksList[i],
        i
      );
  }
}
window.editOverlaySubtask = editOverlaySubtask;

/**
 * Confirms an edited subtask in the edit overlay.
 * @param {number} index - The subtask index.
 * @param {Event} event - The event.
 * @returns {void}
 */
function confirmEditOverlaySubtask(index, event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById(
    "overlay-edit-task-subtasks-input-edit"
  );
  const val = input.value.trim();
  if (!val) {
    window.editOverlaySubtasksList.splice(index, 1);
    window.globalSubtasks.splice(index, 1);
    renderEditOverlaySubtasksList();
    return;
  }
  window.editOverlaySubtasksList.splice(index, 1, val);
  window.globalSubtasks.splice(index, 1, val);
  renderEditOverlaySubtasksList();
}
window.confirmEditOverlaySubtask = confirmEditOverlaySubtask;

/**
 * Removes an edited subtask from the edit overlay.
 * @param {number} index - The subtask index.
 * @param {Event} event - The event.
 * @returns {void}
 */
function removeEditOverlaySubtask(index, event) {
  event.stopPropagation();
  window.editOverlaySubtasksList.splice(index, 1);
  window.globalSubtasks.splice(index, 1);
  renderEditOverlaySubtasksList();
}
window.removeEditOverlaySubtask = removeEditOverlaySubtask;

/**
 * Removes a subtask element (legacy).
 * @param {HTMLElement} el - The element to remove.
 * @returns {void}
 */
function editRemoveSubtask(el) {
  const li = el.closest("li");
  if (li) li.remove();
}
window.editRemoveSubtask = editRemoveSubtask;

/**
 * Focuses the subtask input in the edit overlay.
 * @param {Event} event - The event.
 * @returns {void}
 */
function editSubtasksPlus(event) {
  event.preventDefault();
  editSubtasksClicked();
  const input = document.getElementById("overlay-edit-task-subtasks-input");
  if (input) {
    input.focus();
    input.select();
  }
}
window.editSubtasksPlus = editSubtasksPlus;

/**
 * Clears the subtask input in the edit overlay.
 * @param {Event} event - The event.
 * @returns {void}
 */
function editClearSubtasksInput(event) {
  event.preventDefault();
  document
    .getElementById("overlay-edit-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("overlay-edit-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  const input = document.getElementById("overlay-edit-task-subtasks-input");
  if (input) input.value = "";
}
window.editClearSubtasksInput = editClearSubtasksInput;

/**
 * Displays the contact list in the edit overlay.
 * @returns {void}
 */
function editShowContactList() {
  const container = document.getElementById("overlay-edit-task-contact");
  if (!container) return;
  container.innerHTML = "";
  (window.contactsToAssigned || []).forEach((c, i) => {
    const bg = assignColor(c.name);
    const chk = window.editAssignedContacts.includes(c.name);
    container.innerHTML += createEditOverlayContactLi(c, i, bg, chk);
  });
}
window.editShowContactList = editShowContactList;

/**
 * Filters contacts in the edit overlay.
 * @returns {void}
 */
function editAssignedToSearch() {
  const search = document
    .getElementById("overlay-find-person")
    .value.toLowerCase();
  const container = document.getElementById("overlay-edit-task-contact");
  container.innerHTML = "";
  (window.contactsToAssigned || []).forEach((c, i) => {
    if (!c.name.toLowerCase().includes(search)) return;
    const bg = assignColor(c.name);
    const chk = window.editAssignedContacts.includes(c.name);
    container.innerHTML += createEditOverlayContactLi(c, i, bg, chk);
  });
}
window.editAssignedToSearch = editAssignedToSearch;

/**
 * Toggles contact selection in the edit overlay.
 * @param {string} contactName - The contact name.
 * @returns {void}
 */
function editToggleContactSelection(contactName) {
  const idx = window.editAssignedContacts.indexOf(contactName);
  if (idx >= 0) window.editAssignedContacts.splice(idx, 1);
  else window.editAssignedContacts.push(contactName);
  editShowAvatars();
  const searchValue = document
    .getElementById("overlay-find-person")
    .value.trim();
  if (searchValue) editAssignedToSearch();
  else editShowContactList();
}
window.editToggleContactSelection = editToggleContactSelection;

/**
 * Returns the HTML for a single avatar.
 * @param {string} name - The contact name.
 * @returns {string} The avatar HTML.
 */
function createAvatarHtml(name) {
  const bg = assignColor(name);
  return `<div class="avatar" style="background:${bg}">${getUserInitials(
    name
  )}</div>`;
}

/**
 * Returns the HTML for the leftover avatar indicator.
 * @param {number} leftover - Number of additional contacts.
 * @returns {string} The leftover avatar HTML.
 */
function createLeftoverAvatarHtml(leftover) {
  return `<div class="avatar-addtaskoverlay">+${leftover}</div>`;
}

/**
 * Clears the avatar container and renders avatars based on assigned contacts.
 * @returns {void}
 */
function editShowAvatars() {
  const container = document.getElementById(
    "overlay-edit-task-assigned-avatar"
  );
  if (!container) return;
  container.innerHTML = "";
  const contacts = window.editAssignedContacts || [];
  const maxVisible = 3;
  for (let i = 0; i < contacts.length && i < maxVisible; i++) {
    container.innerHTML += createAvatarHtml(contacts[i]);
  }
  if (contacts.length > maxVisible) {
    const leftover = contacts.length - maxVisible;
    container.innerHTML += createLeftoverAvatarHtml(leftover);
  }
}
window.editShowAvatars = editShowAvatars;
