"use strict";
/**
 * Returns HTML for a non-edit subtask in edit overlay.
 * @param {string} name
 * @param {number} i
 * @returns {string}
 */
window.createEditOverlaySubtaskTemplate = function (name, i) {
  return `
    <li>
      <span class="add-task-subtasks-extra-task">${name}</span>
      <div class="edit-task-subtasks-icons">
        <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg" onclick="editOverlaySubtask(${i}, event)">
        <div class="add-tasks-border"></div>
        <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="removeEditOverlaySubtask(${i}, event)">
      </div>
    </li>
  `;
};

/**
 * Returns HTML for an editable subtask in edit overlay.
 * @param {string} subtaskName
 * @param {number} i
 * @returns {string}
 */
window.createEditOverlaySubtaskEditMode = function (subtaskName, i) {
  return `
    <li class="add-task-subtask-li-edit">
      <div class="add-task-subtasks-input-edit-div">
        <input class="add-task-subtasks-input-edit" id="overlay-edit-task-subtasks-input-edit" type="text" value="${subtaskName}" onkeypress="confirmEditOverlaySubtask(${i}, event)">
        <div class="add-task-subtasks-icons-edit">
          <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="removeEditOverlaySubtask(${i}, event)">
          <div class="add-tasks-border"></div>
          <img class="add-task-confirm" src="/assets/icons/done_inverted.svg" onclick="confirmEditOverlaySubtask(${i}, event)">
        </div>
      </div>
    </li>
  `;
};

/**
 * Returns HTML for an existing subtask.
 * @param {Object} sub
 * @param {number} i
 * @returns {string}
 */
window.createExistingSubtaskLi = function (sub, i) {
  return `
    <span class="add-task-subtasks-extra-task">${sub.name}</span>
    <div class="edit-task-subtasks-icons">
      <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg" onclick="editOverlaySubtask(${i}, event)">
      <div class="add-tasks-border"></div>
      <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="editRemoveSubtask(this)">
    </div>
  `;
};

/**
 * Returns HTML for a contact in the edit overlay.
 * @param {Object} contact
 * @param {number} i
 * @param {string} bgColor
 * @param {boolean} checked
 * @returns {string}
 */
window.createEditOverlayContactLi = function (contact, i, bgColor, checked) {
  return `
     <li class="${checked ? "selectedContact" : ""}">
      <label for="edit-person${i}">
        <span class="avatar" style="background-color:${bgColor};">${getUserInitials(
    contact.name
  )}</span>
        <span>${contact.name}</span>
      </label>
      <input class="add-task-checkbox" type="checkbox" id="edit-person${i}" value="${
    contact.name
  }" ${checked ? "checked" : ""} onclick="editToggleContactSelection('${
    contact.name
  }')">
    </li>
  `;
};
