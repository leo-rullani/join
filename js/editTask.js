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
  if (
    !validateTask(
      "overlay-edit-task-title-input",
      "overlay-edit-task-textarea",
      "overlay-edit-date",
      "overlay-edit-task-category",
      "errorEditTitle",
      "errorEditDescription",
      "errorEditDate",
      "errorEditCategory"
    )
  ) {
    return;
  }
  const ref = `${window.databaseURL}/tasks/${taskId}.json`;
  const formElements = getFormElements();
  if (!formElements) return;

  const { title, description, date, category } = getTaskDetails(formElements);
  const priority = getEditTaskPriority();
  const overlaySubtasks = getOverlaySubtasks();
  const assignees = window.editAssignedContacts.slice();

  const updatedTask = createUpdatedTask(
    taskId,
    title,
    description,
    assignees,
    date,
    priority,
    category,
    overlaySubtasks
  );

  try {
    const resp = await fetch(ref, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });
    handleUpdateResponse(resp, updatedTask, taskId);
  } catch (err) {
    console.error("Error updating task:", err);
  }
}

/**
 * Retrieves the form elements for editing the task.
 * @returns {Object|null} The form elements or null if missing.
 */
function getFormElements() {
  const titleEl = document.getElementById("overlay-edit-task-title-input");
  const descEl = document.getElementById("overlay-edit-task-textarea");
  const dateEl = document.getElementById("overlay-edit-date");
  const catEl = document.getElementById("overlay-edit-task-category");

  if (!titleEl || !descEl || !dateEl || !catEl) {
    console.error("Missing edit form elements");
    return null;
  }

  return { titleEl, descEl, dateEl, catEl };
}

/**
 * Extracts task details from the form elements.
 * @param {Object} elements - The form elements.
 * @returns {Object} The extracted task details.
 */
function getTaskDetails(elements) {
  return {
    title: elements.titleEl.value.trim(),
    description: elements.descEl.value.trim(),
    date: elements.dateEl.value,
    category: elements.catEl.value.trim(),
  };
}

/**
 * Retrieves the subtasks from the overlay.
 * @returns {Array} The array of overlay subtasks.
 */
function getOverlaySubtasks() {
  const spans = document.querySelectorAll(
    "#overlay-edit-task-subtasks-list li span"
  );
  return Array.from(spans).map((s) => s.textContent.trim());
}

/**
 * Creates the updated task object.
 * @param {string} taskId - The ID of the task.
 * @param {string} title - The task title.
 * @param {string} description - The task description.
 * @param {Array} assignees - The list of assignees.
 * @param {string} date - The task date.
 * @param {string} priority - The task priority.
 * @param {string} category - The task category.
 * @param {Array} overlaySubtasks - The list of subtasks.
 * @returns {Object} The updated task object.
 */
function createUpdatedTask(
  taskId,
  title,
  description,
  assignees,
  date,
  priority,
  category,
  overlaySubtasks
) {
  return {
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
}

/**
 * Handles the response from the update request.
 * @param {Response} resp - The response from the fetch request.
 * @param {Object} updatedTask - The updated task object.
 * @param {string} taskId - The ID of the task.
 */
async function handleUpdateResponse(resp, updatedTask, taskId) {
  if (resp.ok) {
    showToast("Task updated!");
    await displayTasks();
    window.editingMode = false;
    window.editingTaskId = null;
    openBoardOverlay(taskId);
  } else {
    console.error("Update failed with status:", resp.status);
  }
}

window.updateTask = updateTask;

/**
 * Fills the edit form with task data.
 * @param {Object} task - The task object containing details to fill in the form.
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

/**
 * Sets the basic task details in the form.
 * @param {Object} task - The task object containing title, description, date, and category.
 */
function setTaskDetails(task) {
  document.getElementById("overlay-edit-task-title-input").value = task.title;
  document.getElementById("overlay-edit-task-textarea").value =
    task.description;
  document.getElementById("overlay-edit-date").value = task.date || "";
  document.getElementById("overlay-edit-task-category").value =
    task.category || "";
}

/**
 * Populates the subtasks list in the edit overlay.
 * @param {Array} subtasks - The array of subtask objects to populate the list.
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
 * Removes an edited subtask from edit overlay.
 * @param {number} index
 * @param {Event} event
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
  const searchValue = document
    .getElementById("overlay-find-person")
    .value.trim();
  if (searchValue) {
    editAssignedToSearch();
  } else {
    editShowContactList();
  }
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

  const contacts = window.editAssignedContacts || [];
  const maxVisible = 3;

  // 1) Bis zu 3 echte Avatare
  contacts.forEach((name, i) => {
    if (i < maxVisible) {
      const bg = assignColor(name);
      div.innerHTML += `
        <div class="avatar" style="background:${bg}">
          ${getUserInitials(name)}
        </div>`;
    }
  });

  if (contacts.length > maxVisible) {
    const leftover = contacts.length - maxVisible;
    div.innerHTML += `
      <div class="avatar-addtaskoverlay">
        +${leftover}
      </div>`;
  }
}
window.editShowAvatars = editShowAvatars;
