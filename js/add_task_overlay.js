"use strict";
/**
 * Creates a new task from the overlay form.
 * @returns {Promise<void>}
 */
async function overlayAddTaskCreateTask() {
  const taskId = "task_" + Date.now();
  const title = document
    .getElementById("overlay-add-task-title-input")
    .value.trim();
  const description = document
    .getElementById("overlay-add-task-textarea")
    .value.trim();
  const names = window.overlayAssignedContacts.slice();
  const date = document.getElementById("overlay-date").value;
  const priority = overlayGetPriority();
  const category = document
    .getElementById("overlay-add-task-category")
    .value.trim();
  const newTask = {
    id: taskId,
    title,
    description,
    assignees: names,
    date,
    priority,
    category,
    boardCategory: "todo",
    subtasks: window.overlaySubtasksList.map((st) => ({
      name: st,
      done: false,
    })),
  };
  const ref = `${window.databaseURL}/tasks/${taskId}.json`;
  try {
    const resp = await fetch(ref, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    if (resp.ok) {
      console.log("Overlay task saved:", newTask);
      addTaskCreateTaskConfirmation();
      overlayClearForm();
      document.getElementById("addTaskOverlay").style.display = "none";
      await displayTasks();
    } else {
      console.error("Error saving overlay task:", resp.status);
    }
  } catch (err) {
    console.error("Error (Overlay):", err);
  }
}
window.overlayAddTaskCreateTask = overlayAddTaskCreateTask;

/**
 * Clears the overlay form fields.
 * @returns {void}
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
window.overlayClearForm = overlayClearForm;

/**
 * Sets overlay priority via button click.
 * @param {string} prio
 * @param {string} containerId
 * @param {Event} event
 * @returns {void}
 */
function overlayAddTaskPrio(prio, containerId, event) {
  event.preventDefault();
  overlayAddTaskPrioToggleButton(prio, containerId);
}
window.overlayAddTaskPrio = overlayAddTaskPrio;

/**
 * Toggles overlay priority buttons.
 * @param {string} prio
 * @param {string} containerId
 * @returns {void}
 */
function overlayAddTaskPrioToggleButton(prio, containerId) {
  const container = document.getElementById(containerId);
  const btns = container.querySelectorAll("button");
  btns.forEach((btn) => {
    const icon = btn.querySelector("img");
    btn.classList.remove("add-task-clicked");
    if (icon) icon.src = `/assets/icons/${btn.dataset.priority}.svg`;
  });
  const active = container.querySelector(`button[data-priority="${prio}"]`);
  if (active) {
    active.classList.add("add-task-clicked");
    const icon = active.querySelector("img");
    if (icon) icon.src = `/assets/icons/${prio}_white.svg`;
  }
}
window.overlayAddTaskPrioToggleButton = overlayAddTaskPrioToggleButton;

/**
 * Retrieves the selected overlay priority.
 * @returns {string}
 */
function overlayGetPriority() {
  const container = document.getElementById(
    "overlay-add-task-urgent-medium-low-buttons"
  );
  const active = container.querySelector(".add-task-clicked");
  return active ? active.dataset.priority : "medium";
}
window.overlayGetPriority = overlayGetPriority;

/**
 * Sets the overlay task category.
 * @param {string} value
 * @returns {void}
 */
function overlayAddTaskChoseCategory(value) {
  document.getElementById("overlay-add-task-category").value = value;
}
window.overlayAddTaskChoseCategory = overlayAddTaskChoseCategory;

/**
 * Toggles subtask icon display in overlay.
 * @returns {void}
 */
function overlayAddTaskSubtasksClicked() {
  document
    .getElementById("overlay-add-task-subtasks-icon-plus")
    .classList.add("d-none");
  document
    .getElementById("overlay-add-task-subtasks-icon-plus-check")
    .classList.remove("d-none");
}
window.overlayAddTaskSubtasksClicked = overlayAddTaskSubtasksClicked;

/**
 * Adds a subtask in overlay.
 * @param {Event} event
 * @returns {void}
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
window.overlayAddTaskSubtasks = overlayAddTaskSubtasks;

/**
 * Renders overlay subtasks list.
 * @returns {void}
 */
function overlayAddTaskSubtasksList() {
  const ul = document.getElementById("overlay-add-task-subtasks-list");
  ul.innerHTML = "";
  for (let i = 0; i < window.overlaySubtasksList.length; i++) {
    ul.innerHTML += overlaySubTaskTemplate(window.overlaySubtasksList[i], i);
  }
}
window.overlayAddTaskSubtasksList = overlayAddTaskSubtasksList;

/**
 * Returns HTML for an overlay subtask.
 * @param {string} subtaskName
 * @param {number} index
 * @returns {string}
 */
function overlaySubTaskTemplate(subtaskName, index) {
  return `
    <li>
      <span class="add-task-subtasks-extra-task">${subtaskName}</span>
      <div class="overlay-add-task-subtasks-icons">
        <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg" onclick="overlayEditTaskSubtasksList(${index}, event)">
        <div class="add-tasks-border"></div>
        <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="overlayRemoveOverlaySubtask(${index}, event)">
      </div>
    </li>
  `;
}
window.overlaySubTaskTemplate = overlaySubTaskTemplate;

/**
 * Allows editing an overlay subtask.
 * @param {number} index
 * @param {Event} event
 * @returns {void}
 */
function overlayEditTaskSubtasksList(index, event) {
  event.stopPropagation();
  const ul = document.getElementById("overlay-add-task-subtasks-list");
  ul.innerHTML = "";
  for (let i = 0; i < window.overlaySubtasksList.length; i++) {
    if (i === index) {
      ul.innerHTML += `
        <li class="add-task-subtask-li-edit">
          <div class="add-task-subtasks-input-edit-div">
            <input class="add-task-subtasks-input-edit" id="overlay-add-task-subtasks-input-edit" type="text" value="${window.overlaySubtasksList[i]}" onkeypress="overlayConfirmEditSubtask(${i}, event)">
            <div class="add-task-subtasks-icons-edit">
              <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="overlayRemoveOverlaySubtask(${i}, event)">
              <div class="add-tasks-border"></div>
              <img class="add-task-confirm" src="/assets/icons/done_inverted.svg" onclick="overlayConfirmEditSubtask(${i}, event)">
            </div>
          </div>
        </li>
      `;
    } else {
      ul.innerHTML += overlaySubTaskTemplate(window.overlaySubtasksList[i], i);
    }
  }
}
window.overlayEditTaskSubtasksList = overlayEditTaskSubtasksList;

/**
 * Confirms editing of an overlay subtask.
 * @param {number} index
 * @param {Event} event
 * @returns {void}
 */
function overlayConfirmEditSubtask(index, event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById("overlay-add-task-subtasks-input-edit");
  const newVal = input.value.trim();
  if (!newVal) return;
  window.overlaySubtasksList[index] = newVal;
  overlayAddTaskSubtasksList();
}
window.overlayConfirmEditSubtask = overlayConfirmEditSubtask;

/**
 * Removes an overlay subtask.
 * @param {number} index
 * @param {Event} event
 * @returns {void}
 */
function overlayRemoveOverlaySubtask(index, event) {
  event.stopPropagation();
  window.overlaySubtasksList.splice(index, 1);
  overlayAddTaskSubtasksList();
}
window.overlayRemoveOverlaySubtask = overlayRemoveOverlaySubtask;

/**
 * Removes an overlay subtask (old method).
 * @param {HTMLElement} el
 * @returns {void}
 */
function overlayRemoveSubtask(el) {
  const li = el.closest("li");
  if (li) li.remove();
}
window.overlayRemoveSubtask = overlayRemoveSubtask;

/**
 * Focuses the overlay subtask input.
 * @param {Event} event
 * @returns {void}
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
window.overlayAddSubtasksPlus = overlayAddSubtasksPlus;

/**
 * Clears the overlay subtask input.
 * @param {Event} event
 * @returns {void}
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
window.overlayClearSubtasks = overlayClearSubtasks;

/**
 * Displays the contact list in overlay.
 * @returns {void}
 */
function overlayShowContactList() {
  const container = document.getElementById("overlay-add-task-contact");
  if (!container) return;
  container.innerHTML = "";
  window.contactsToAssigned.forEach((contact, i) => {
    const bg = assignColor(contact.name);
    const chk = window.overlayAssignedContacts.includes(contact.name);
    container.innerHTML += `
      <li>
        <label for="overlay-person${i}">
          <span class="avatar" style="background-color:${bg};">${getUserInitials(
      contact.name
    )}</span>
          <span>${contact.name}</span>
        </label>
        <input class="overlay-add-task-checkbox" type="checkbox" id="overlay-person${i}" value="${
      contact.name
    }" ${chk ? "checked" : ""} onclick="overlayToggleContactSelection('${
      contact.name
    }')">
      </li>
    `;
  });
}
window.overlayShowContactList = overlayShowContactList;

/**
 * Filters contacts in overlay.
 * @returns {void}
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
    container.innerHTML += `
      <li>
        <label for="overlay-person${i}">
          <span class="avatar" style="background-color:${bg};">${getUserInitials(
      c.name
    )}</span>
          <span>${c.name}</span>
        </label>
        <input class="overlay-add-task-checkbox" type="checkbox" id="overlay-person${i}" value="${
      c.name
    }" ${chk ? "checked" : ""} onclick="overlayToggleContactSelection('${
      c.name
    }')">
      </li>
    `;
  });
}
window.overlayAddTaskAssignedToSearch = overlayAddTaskAssignedToSearch;

/**
 * Toggles contact selection in overlay.
 * @param {string} contactName
 * @returns {void}
 */
function overlayToggleContactSelection(contactName) {
  const idx = window.overlayAssignedContacts.indexOf(contactName);
  if (idx >= 0) window.overlayAssignedContacts.splice(idx, 1);
  else window.overlayAssignedContacts.push(contactName);
  overlayShowAvatars();
}
window.overlayToggleContactSelection = overlayToggleContactSelection;

/**
 * Displays assigned contact avatars in overlay.
 * @returns {void}
 */
function overlayShowAvatars() {
  const div = document.getElementById("overlay-add-task-assigned-avatar");
  if (!div) return;
  div.innerHTML = "";
  window.overlayAssignedContacts.forEach((contact) => {
    const bg = assignColor(contact);
    div.innerHTML += `<div class="avatar" style="background-color:${bg};">${getUserInitials(
      contact
    )}</div>`;
  });
}
window.overlayShowAvatars = overlayShowAvatars;
