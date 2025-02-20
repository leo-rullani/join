"use strict";
/**
 * Opens the edit overlay for a task.
 * @param {string} taskId
 * @returns {void}
 */
function editTask(taskId) {
  window.editingMode = true;
  window.editingTaskId = taskId;
  openBoardOverlay(taskId);
}
window.editTask = editTask;

/**
 * Updates an edited task in Firebase.
 * @param {string} taskId
 * @returns {Promise<void>}
 */
async function updateTask(taskId) {
  const ref = `${window.databaseURL}/tasks/${taskId}.json`;
  const titleEl = document.getElementById("overlay-edit-task-title-input");
  const descEl = document.getElementById("overlay-edit-task-textarea");
  const dateEl = document.getElementById("overlay-edit-date");
  const catEl = document.getElementById("overlay-edit-task-category");
  if (!titleEl || !descEl || !dateEl || !catEl) {
    console.error("Missing edit form elements");
    return;
  }
  const title = titleEl.value.trim(),
    description = descEl.value.trim(),
    date = dateEl.value,
    category = catEl.value.trim(),
    priority = getEditTaskPriority();
  const spans = document.querySelectorAll(
    "#overlay-edit-task-subtasks-list li span"
  );
  let overlaySubtasks = [];
  spans.forEach((s) => overlaySubtasks.push(s.textContent.trim()));
  const assignees = window.editAssignedContacts.slice();
  const updatedTask = {
    id: taskId,
    title,
    description,
    assignees,
    date,
    priority,
    category,
    boardCategory: window.oldBoardCategory || "todo",
    subtasks: overlaySubtasks.map((st) => ({ name: st, done: false })),
  };
  try {
    const resp = await fetch(ref, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });
    if (resp.ok) {
      console.log("Task updated:", updatedTask);
      showToast("Task updated!");
      await displayTasks();
      window.editingMode = false;
      window.editingTaskId = null;
      openBoardOverlay(taskId);
    } else {
      console.error("Update failed with status:", resp.status);
    }
  } catch (err) {
    console.error("Error updating task:", err);
  }
}
window.updateTask = updateTask;

/**
 * Fills the edit overlay form with task data.
 * @param {Object} task
 * @returns {void}
 */
function fillEditFormData(task) {
  document.getElementById("overlay-edit-task-title-input").value = task.title;
  document.getElementById("overlay-edit-task-textarea").value =
    task.description;
  document.getElementById("overlay-edit-date").value = task.date || "";
  document.getElementById("overlay-edit-task-category").value =
    task.category || "";
  editTogglePrioButton(
    task.priority || "medium",
    "overlay-edit-task-urgent-medium-low-buttons"
  );
  window.editOverlaySubtasksList = (task.subtasks || []).map((sub) => sub.name);
  renderEditOverlaySubtasksList();
  window.editAssignedContacts = [...(task.assignees || [])];
  editShowAvatars();
  const ul = document.getElementById("overlay-edit-task-subtasks-list");
  ul.innerHTML = "";
  (task.subtasks || []).forEach((sub, i) => {
    const li = document.createElement("li");
    li.innerHTML = createExistingSubtaskLi(sub, i);
    ul.appendChild(li);
  });
  window.oldBoardCategory = task.boardCategory;
}
window.fillEditFormData = fillEditFormData;

/**
 * Sets task priority in edit overlay.
 * @param {string} prio
 * @param {string} containerId
 * @param {Event} event
 * @returns {void}
 */
function editSetTaskPrio(prio, containerId, event) {
  event.preventDefault();
  editTogglePrioButton(prio, containerId);
}
window.editSetTaskPrio = editSetTaskPrio;

/**
 * Toggles priority buttons in edit overlay.
 * @param {string} prio
 * @param {string} containerId
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
 * Retrieves the selected priority in edit overlay.
 * @returns {string}
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
 * Sets the category in edit overlay.
 * @param {string} value
 * @param {Event} event
 * @returns {void}
 */
function editSetCategory(value, event) {
  if (event) event.preventDefault();
  document.getElementById("overlay-edit-task-category").value = value;
}
window.editSetCategory = editSetCategory;

/**
 * Toggles subtask icon display in edit overlay.
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
 * Adds a new subtask in edit overlay.
 * @param {Event} event
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
 * @param {number} index
 * @param {Event} event
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
 * Confirms an edited subtask in edit overlay.
 * @param {number} index
 * @param {Event} event
 * @returns {void}
 */
function confirmEditOverlaySubtask(index, event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById(
    "overlay-edit-task-subtasks-input-edit"
  );
  const val = input.value.trim();
  if (!val) return;
  window.editOverlaySubtasksList[index] = val;
  renderEditOverlaySubtasksList();
}
window.confirmEditOverlaySubtask = confirmEditOverlaySubtask;

/**
 * Removes an edited subtask from edit overlay.
 * @param {number} index
 * @param {Event} event
 * @returns {void}
 */
function removeEditOverlaySubtask(index, event) {
  event.stopPropagation();
  window.editOverlaySubtasksList.splice(index, 1);
  renderEditOverlaySubtasksList();
}
window.removeEditOverlaySubtask = removeEditOverlaySubtask;

/**
 * Removes a subtask element (legacy).
 * @param {HTMLElement} el
 * @returns {void}
 */
function editRemoveSubtask(el) {
  const li = el.closest("li");
  if (li) li.remove();
}
window.editRemoveSubtask = editRemoveSubtask;

/**
 * Focuses the subtask input in edit overlay.
 * @param {Event} event
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
 * Clears the subtask input in edit overlay.
 * @param {Event} event
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
 * Displays the contact list in edit overlay.
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
 * Filters contacts in edit overlay.
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
 * Toggles contact selection in edit overlay.
 * @param {string} contactName
 * @returns {void}
 */
function editToggleContactSelection(contactName) {
  const idx = window.editAssignedContacts.indexOf(contactName);
  if (idx >= 0) window.editAssignedContacts.splice(idx, 1);
  else window.editAssignedContacts.push(contactName);
  editShowAvatars();
}
window.editToggleContactSelection = editToggleContactSelection;

/**
 * Displays assigned contact avatars in edit overlay.
 * @returns {void}
 */
function editShowAvatars() {
  const div = document.getElementById("overlay-edit-task-assigned-avatar");
  if (!div) return;
  div.innerHTML = "";
  window.editAssignedContacts.forEach((name) => {
    const bg = assignColor(name);
    div.innerHTML += `<div class="avatar" style="background:${bg}">${getUserInitials(
      name
    )}</div>`;
  });
}
window.editShowAvatars = editShowAvatars;
