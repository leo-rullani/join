/**
 * Opens the overlay in "edit mode" for a given task.
 * @param {string} taskId - The ID of the task to edit.
 */
function editTask(taskId) {
  window.editingMode = true;
  window.editingTaskId = taskId;
  openBoardOverlay(taskId);
}
window.editTask = editTask;

/**
 * Updates the existing task in Firebase with edited data from the overlay.
 * @async
 * @param {string} taskId - The ID of the task to update.
 * @returns {Promise<void>}
 */
async function updateTask(taskId) {
  const taskRef = `${window.databaseURL}/tasks/${taskId}.json`;

  const titleEl = document.getElementById("overlay-edit-task-title-input");
  const descEl = document.getElementById("overlay-edit-task-textarea");
  const dateEl = document.getElementById("overlay-edit-date");
  const catEl = document.getElementById("overlay-edit-task-category");

  if (!titleEl || !descEl || !dateEl || !catEl) {
    console.error("One or more edit form elements not found!");
    return;
  }

  const title = titleEl.value.trim();
  const description = descEl.value.trim();
  const date = dateEl.value;
  const category = catEl.value.trim();
  const priority = getEditTaskPriority();

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
    const response = await fetch(taskRef, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });

    if (response.ok) {
      console.log("Task updated:", updatedTask);
      showToast("Task updated!");
      await displayTasks();
      window.editingMode = false;
      window.editingTaskId = null;
      openBoardOverlay(taskId);
    } else {
      console.error("Update failed with status:", response.status);
    }
  } catch (err) {
    console.error("Error updating task:", err);
  }
}
window.updateTask = updateTask;

/**
 * Fills the edit overlay form fields with the existing task data.
 * @param {Object} task - The task object to fill in.
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

  // Hier statt Inline-Template => rufen wir jetzt createExistingSubtaskLi(...) auf
  (task.subtasks || []).forEach((sub, i) => {
    const li = document.createElement("li");
    li.innerHTML = createExistingSubtaskLi(sub, i);
    ul.appendChild(li);
  });

  window.oldBoardCategory = task.boardCategory;
}
window.fillEditFormData = fillEditFormData;

/**
 * Sets the task priority in the edit overlay by toggling the relevant button.
 * @param {string} prio - The priority to set.
 * @param {string} containerId - The container ID with the priority buttons.
 * @param {Event} event - The click event.
 */
function editSetTaskPrio(prio, containerId, event) {
  event.preventDefault();
  editTogglePrioButton(prio, containerId);
}
window.editSetTaskPrio = editSetTaskPrio;

/**
 * Toggles the priority button in the edit overlay.
 * @param {string} prio - The priority value.
 * @param {string} containerId - The DOM element ID of the button container.
 */
function editTogglePrioButton(prio, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const buttons = container.querySelectorAll("button");

  buttons.forEach((btn) => {
    btn.classList.remove("add-task-clicked");
    const icon = btn.querySelector("img");
    const p = btn.dataset.priority;
    if (icon) icon.src = `/assets/icons/${p}.svg`;
  });

  const activeBtn = container.querySelector(`button[data-priority="${prio}"]`);
  if (activeBtn) {
    activeBtn.classList.add("add-task-clicked");
    const icon = activeBtn.querySelector("img");
    if (icon) icon.src = `/assets/icons/${prio}_white.svg`;
  }
}
window.editTogglePrioButton = editTogglePrioButton;

/**
 * Retrieves the currently selected priority in the edit overlay.
 * @returns {string} The priority value ('urgent', 'medium', or 'low').
 */
function getEditTaskPriority() {
  const container = document.getElementById(
    "overlay-edit-task-urgent-medium-low-buttons"
  );
  if (!container) return "medium";
  const activeBtn = container.querySelector(".add-task-clicked");
  if (activeBtn) {
    return activeBtn.dataset.priority;
  }
  return "medium";
}
window.getEditTaskPriority = getEditTaskPriority;

/**
 * Sets the category in the edit overlay form.
 * @param {string} value - The category value.
 * @param {Event} event - The click event.
 */
function editSetCategory(value, event) {
  if (event) event.preventDefault();
  document.getElementById("overlay-edit-task-category").value = value;
}
window.editSetCategory = editSetCategory;

/**
 * Shows the subtask plus-check icons in the edit overlay.
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
 * Adds a new subtask to the edit overlay form.
 * @param {Event} event - The keypress or click event.
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
 * Renders the entire subtask list in the edit overlay.
 */
function renderEditOverlaySubtasksList() {
  const ul = document.getElementById("overlay-edit-task-subtasks-list");
  ul.innerHTML = "";

  for (let i = 0; i < window.editOverlaySubtasksList.length; i++) {
    const subtaskName = window.editOverlaySubtasksList[i];
    ul.innerHTML += createEditOverlaySubtaskTemplate(subtaskName, i);
  }
}
window.renderEditOverlaySubtasksList = renderEditOverlaySubtasksList;

/**
 * Switches a subtask in the edit overlay into "edit mode."
 * @param {number} index - The index of the subtask to edit.
 * @param {Event} event - The click event.
 */
function editOverlaySubtask(index, event) {
  event.stopPropagation();
  const ul = document.getElementById("overlay-edit-task-subtasks-list");
  ul.innerHTML = "";

  for (let i = 0; i < window.editOverlaySubtasksList.length; i++) {
    const subtaskName = window.editOverlaySubtasksList[i];
    if (i === index) {
      ul.innerHTML += createEditOverlaySubtaskEditMode(subtaskName, i);
    } else {
      ul.innerHTML += createEditOverlaySubtaskTemplate(subtaskName, i);
    }
  }
}
window.editOverlaySubtask = editOverlaySubtask;

/**
 * Confirms an edited subtask in the edit overlay form.
 * @param {number} index - The index of the subtask being edited.
 * @param {Event} event - The keypress or click event.
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
 * Removes a subtask by index from the editOverlaySubtasksList array.
 * @param {number} index - The index of the subtask to remove.
 * @param {Event} event - The click event.
 */
function removeEditOverlaySubtask(index, event) {
  event.stopPropagation();
  window.editOverlaySubtasksList.splice(index, 1);
  renderEditOverlaySubtasksList();
}
window.removeEditOverlaySubtask = removeEditOverlaySubtask;

/**
 * Removes a subtask <li> element in the edit overlay (old method).
 * @param {HTMLElement} el - The element that triggered removal.
 */
function editRemoveSubtask(el) {
  const li = el.closest("li");
  if (li) li.remove();
}
window.editRemoveSubtask = editRemoveSubtask;

/**
 * Shows the plus/check icons for adding a subtask in the edit overlay.
 * @param {Event} event - The click event.
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
 * @param {Event} event - The click event.
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
 * Shows the list of contacts in the edit overlay form.
 */
function editShowContactList() {
  const container = document.getElementById("overlay-edit-task-contact");
  if (!container) return;
  container.innerHTML = "";

  (window.contactsToAssigned || []).forEach((contact, i) => {
    const bgColor = assignColor(contact.name);
    const checked = window.editAssignedContacts.includes(contact.name);

    container.innerHTML += createEditOverlayContactLi(
      contact,
      i,
      bgColor,
      checked
    );
  });
}
window.editShowContactList = editShowContactList;

/**
 * Searches contacts in edit overlay and updates the list.
 */
function editAssignedToSearch() {
  const search = document
    .getElementById("overlay-find-person")
    .value.toLowerCase();
  const container = document.getElementById("overlay-edit-task-contact");
  container.innerHTML = "";

  (window.contactsToAssigned || []).forEach((c, i) => {
    const contactName = c.name;
    if (!contactName.toLowerCase().includes(search)) return;

    const bgColor = assignColor(contactName);
    const checked = window.editAssignedContacts.includes(contactName);

    container.innerHTML += createEditOverlayContactLi(c, i, bgColor, checked);
  });
}
window.editAssignedToSearch = editAssignedToSearch;

/**
 * Toggles a contact in the editAssignedContacts array.
 * @param {string} contactName - The name of the contact to toggle.
 */
function editToggleContactSelection(contactName) {
  const idx = window.editAssignedContacts.indexOf(contactName);
  if (idx >= 0) {
    window.editAssignedContacts.splice(idx, 1);
  } else {
    window.editAssignedContacts.push(contactName);
  }
  editShowAvatars();
}
window.editToggleContactSelection = editToggleContactSelection;

/**
 * Displays the avatars for assigned contacts in the edit overlay.
 */
function editShowAvatars() {
  const avatarDiv = document.getElementById(
    "overlay-edit-task-assigned-avatar"
  );
  if (!avatarDiv) return;
  avatarDiv.innerHTML = "";

  window.editAssignedContacts.forEach((contactName) => {
    const bgColor = assignColor(contactName);
    avatarDiv.innerHTML += `
      <div class="avatar" style="background:${bgColor}">
        ${getUserInitials(contactName)}
      </div>
    `;
  });
}
window.editShowAvatars = editShowAvatars;
