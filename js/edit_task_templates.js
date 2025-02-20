/**
 * Returns the HTML string for a single subtask in the normal (non-edit) mode.
 * @param {string} name - The subtask name.
 * @param {number} i - The index of the subtask.
 * @returns {string} HTML for <li> element.
 */
window.createEditOverlaySubtaskTemplate = function (name, i) {
  return `
    <li>
      <span class="add-task-subtasks-extra-task">${name}</span>
      <div class="edit-task-subtasks-icons">
        <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg"
             onclick="editOverlaySubtask(${i}, event)">
        <div class="add-tasks-border"></div>
        <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg"
             onclick="editRemoveSubtask(this)">
      </div>
    </li>
  `;
};

/**
 * Returns the HTML string for a single subtask in EDIT mode (input visible).
 * @param {string} subtaskName - The current subtask name.
 * @param {number} i - The index of the subtask.
 * @returns {string} HTML for the editing <li>.
 */
window.createEditOverlaySubtaskEditMode = function (subtaskName, i) {
  return `
    <li class="add-task-subtask-li-edit">
      <div class="add-task-subtasks-input-edit-div">
        <input class="add-task-subtasks-input-edit"
               id="overlay-edit-task-subtasks-input-edit"
               type="text"
               value="${subtaskName}"
               onkeypress="confirmEditOverlaySubtask(${i}, event)">
        <div class="add-task-subtasks-icons-edit">
          <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg"
               onclick="removeEditOverlaySubtask(${i}, event)">
          <div class="add-tasks-border"></div>
          <img class="add-task-confirm" src="/assets/icons/done_inverted.svg"
               onclick="confirmEditOverlaySubtask(${i}, event)">
        </div>
      </div>
    </li>
  `;
};

/**
 * Returns the HTML string for each subtask <li> when loading an existing task's subtasks.
 * (Used in fillEditFormData)
 * @param {Object} sub - A single subtask object (with 'name').
 * @param {number} i - The index of the subtask.
 * @returns {string} HTML for the subtask <li>.
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
 * Returns the HTML <li> for a contact in the edit overlay's contact list.
 * @param {Object} contact - The contact object with 'name'.
 * @param {number} i - Index in the loop.
 * @param {string} bgColor - The assigned background color for the avatar.
 * @param {boolean} checked - Whether this contact is currently selected.
 * @returns {string} HTML for the <li> element.
 */
window.createEditOverlayContactLi = function (contact, i, bgColor, checked) {
  return `
    <li>
      <label for="edit-person${i}">
        <span class="avatar" style="background-color:${bgColor};">
          ${getUserInitials(contact.name)}
        </span>
        <span>${contact.name}</span>
      </label>
      <input
        class="overlay-add-task-checkbox"
        type="checkbox"
        id="edit-person${i}"
        value="${contact.name}"
        ${checked ? "checked" : ""}
        onclick="editToggleContactSelection('${contact.name}')"
      >
    </li>
  `;
};
