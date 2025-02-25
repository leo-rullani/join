"use strict";
/**
 * Validates the update task form.
 * @returns {boolean} True if the form is valid, otherwise false.
 */
function checkUpdateTaskValidation() {
  return validateTask(
    "overlay-edit-task-title-input",
    "overlay-edit-task-textarea",
    "overlay-edit-date",
    "overlay-edit-task-category",
    "errorEditTitle",
    "errorEditDescription",
    "errorEditDate",
    "errorEditCategory"
  );
}
window.checkUpdateTaskValidation = checkUpdateTaskValidation;

/**
 * Retrieves the update task context: reference URL and form elements.
 * @param {string} taskId - The ID of the task.
 * @returns {{ref: string, formElements: HTMLElement}} The context object.
 */
function getTaskUpdateContext(taskId) {
  const ref = `${window.databaseURL}/tasks/${taskId}.json`;
  const formElements = getFormElements();
  return { ref, formElements };
}
window.getTaskUpdateContext = getTaskUpdateContext;

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
window.getFormElements = getFormElements;

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
window.getTaskDetails = getTaskDetails;

/**
 * Retrieves the overlay subtasks.
 * @returns {Array} An array of subtask strings.
 */
function getOverlaySubtasks() {
  const spans = document.querySelectorAll(
    "#overlay-edit-task-subtasks-list li span"
  );
  return Array.from(spans).map((s) => s.textContent.trim());
}
window.getOverlaySubtasks = getOverlaySubtasks;

/**
 * Creates the updated task object.
 * @param {string} taskId - The ID of the task.
 * @param {string} title - The task title.
 * @param {string} description - The task description.
 * @param {Array} assignees - The list of assignees.
 * @param {string} date - The task date.
 * @param {string} priority - The task priority.
 * @param {string} category - The task category.
 * @param {Array} overlaySubtasks - The array of subtasks.
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
window.createUpdatedTask = createUpdatedTask;

/**
 * Builds the updated task object from form elements.
 * @param {string} taskId - The ID of the task.
 * @param {HTMLElement} formElements - The form elements.
 * @returns {Object} The updated task object.
 */
function buildUpdatedTask(taskId, formElements) {
  const { title, description, date, category } = getTaskDetails(formElements);
  const priority = getEditTaskPriority();
  const overlaySubtasks = getOverlaySubtasks();
  const assignees = window.editAssignedContacts.slice();
  return createUpdatedTask(
    taskId,
    title,
    description,
    assignees,
    date,
    priority,
    category,
    overlaySubtasks
  );
}
window.buildUpdatedTask = buildUpdatedTask;

/**
 * Sends the updated task data via a PUT request.
 * @param {string} ref - The reference URL for the task.
 * @param {Object} updatedTask - The updated task object.
 * @param {string} taskId - The ID of the task.
 * @returns {Promise<void>}
 */
async function sendUpdateRequest(ref, updatedTask, taskId) {
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
window.sendUpdateRequest = sendUpdateRequest;

/**
 * Updates a task by validating, building the updated object, and sending the update request.
 * @param {string} taskId - The ID of the task to update.
 * @returns {Promise<void>}
 */
async function updateTask(taskId) {
  if (!checkUpdateTaskValidation()) return;
  const { ref, formElements } = getTaskUpdateContext(taskId);
  if (!formElements) return;
  const updatedTask = buildUpdatedTask(taskId, formElements);
  await sendUpdateRequest(ref, updatedTask, taskId);
}
window.updateTask = updateTask;

/**
 * Handles the response from the update request.
 * @param {Response} resp - The response from the fetch request.
 * @param {Object} updatedTask - The updated task object.
 * @param {string} taskId - The ID of the task.
 * @returns {Promise<void>}
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
window.handleUpdateResponse = handleUpdateResponse;
