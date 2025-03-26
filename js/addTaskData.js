/**
 * Renders the subtasks list.
 * @returns {void}
 */
function addTaskSubtasksList() {
  const ul = document.getElementById("add-task-subtasks-list");
  ul.innerHTML = "";
  for (let i = 0; i < window.subtasksList.length; i++) {
    ul.innerHTML += subTaskTemplate(window.subtasksList[i], i);
  }
}
window.addTaskSubtasksList = addTaskSubtasksList;

/**
 * Removes a subtask from the list.
 * @param {number} i
 * @param {Event} event
 * @returns {void}
 */
function removeFromAddTaskSubtasksList(i, event) {
  event.stopPropagation();
  window.subtasksList.splice(i, 1);
  window.globalSubtasks.splice(i, 1);
  addTaskSubtasksList();
}
window.removeFromAddTaskSubtasksList = removeFromAddTaskSubtasksList;

/**
 * Edits a subtask (shows input for editing).
 * @param {number} param
 * @param {Event} event
 * @returns {void}
 */
function editTaskSubtasksList(param, event) {
  event.stopPropagation();
  const ul = document.getElementById("add-task-subtasks-list");
  ul.innerHTML = "";
  for (let i = 0; i < window.subtasksList.length; i++) {
    if (i === param) ul.appendChild(createEditLi(i));
    else ul.appendChild(createNormalLi(i));
  }
}
window.editTaskSubtasksList = editTaskSubtasksList;

function createIconsEdit(i) {
  const div = document.createElement("div");
  div.className = "add-task-subtasks-icons-edit";
  const trash = document.createElement("img");
  trash.className = "add-task-trash";
  trash.src = "/assets/icons/add-subtask-delete.svg";
  trash.setAttribute("onclick", `removeFromAddTaskSubtasksList(${i},event)`);
  const border = document.createElement("div");
  border.className = "add-tasks-border";
  const confirm = document.createElement("img");
  confirm.className = "add-task-confirm";
  confirm.src = "/assets/icons/done_inverted.svg";
  confirm.setAttribute("onclick", `confirmTaskSubtasksList(${i},event)`);
  [trash, border, confirm].forEach((el) => div.appendChild(el));
  return div;
}

function createIconsNormal(i) {
  const div = document.createElement("div");
  div.className = "add-task-subtasks-icons";
  const edit = document.createElement("img");
  edit.className = "add-task-edit";
  edit.src = "/assets/icons/add-subtask-edit.svg";
  edit.setAttribute("onclick", `editTaskSubtasksList(${i},event)`);
  const border = document.createElement("div");
  border.className = "add-tasks-border";
  const trash = document.createElement("img");
  trash.className = "add-task-trash";
  trash.src = "/assets/icons/add-subtask-delete.svg";
  trash.setAttribute("onclick", `removeFromAddTaskSubtasksList(${i},event)`);
  [edit, border, trash].forEach((el) => div.appendChild(el));
  return div;
}

function createEditLi(i) {
  const li = document.createElement("li");
  li.className = "add-task-subtask-li-edit";
  const input = document.createElement("input");
  input.className = "add-task-subtasks-input-edit";
  input.id = "add-task-subtasks-input-edit";
  input.type = "text";
  input.setAttribute("onkeypress", `confirmTaskSubtasksList(${i},event)`);
  const inputDiv = document.createElement("div");
  inputDiv.className = "add-task-subtasks-input-edit-div";
  inputDiv.appendChild(input);
  inputDiv.appendChild(createIconsEdit(i));
  li.appendChild(inputDiv);
  input.value = window.subtasksList[i];
  return li;
}

function createNormalLi(i) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.className = "add-task-subtasks-extra-task";
  span.id = "add-task-subtasks-extra-task";
  span.textContent = window.subtasksList[i];
  li.appendChild(span);
  li.appendChild(createIconsNormal(i));
  return li;
}

/**
 * Confirms editing of a subtask.
 * @param {number} i
 * @param {Event} event
 * @returns {void}
 */
function confirmTaskSubtasksList(i, event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById("add-task-subtasks-input-edit");
  const val = input.value.trim();
  if (!val) {
    window.subtasksList.splice(i, 1);
    window.globalSubtasks.splice(i, 1);
    addTaskSubtasksList();
    return;
  }
  window.subtasksList.splice(i, 1, val);
  window.globalSubtasks.splice(i, 1, val);
  addTaskSubtasksList();
}
window.confirmTaskSubtasksList = confirmTaskSubtasksList;

/**
 * Focuses the subtask input.
 * @param {Event} event
 * @returns {void}
 */
function addSubtasksPlus(event) {
  event.preventDefault();
  addTaskSubtasksClicked();
  document.getElementById("add-task-subtasks-input").focus();
  document.getElementById("add-task-subtasks-input").select();
}
window.addSubtasksPlus = addSubtasksPlus;

/**
 * Called when the input field or the plus icon is clicked.
 * - Switches icons (Plus → Check).
 * - Activates a global click listener to detect outside clicks.
 */
function addTaskSubtasksClicked() {
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.add("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.remove("d-none");

  document.addEventListener("click", handleOutsideClickSubtasks);
}

/**
 * Closes the subtask input field (resets icons, clears input).
 */
function closeSubtaskInput() {
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  document.getElementById("add-task-subtasks-input").value = "";
}

/**
 * Called on every click on the entire document.
 * Checks whether the container was clicked or not.
 */
function handleOutsideClickSubtasks(event) {
  const container = document.getElementById("add-task-subtasks-container");
  if (!container) return;

  if (!container.contains(event.target)) {
    closeSubtaskInput();
    document.removeEventListener("click", handleOutsideClickSubtasks);
  }
}

/**
 * Click on the X icon.
 * Since the X button is likely inside the same container,
 * we prevent the document listener from treating it as "outside."
 */
function clearSubtasks(event) {
  event.stopPropagation();
  closeSubtaskInput();
  document.removeEventListener("click", handleOutsideClickSubtasks);
}

/**
 * Clears all task input fields.
 * @returns {void}
 */
function clearTaskInputs() {
  document.getElementById("add-task-title-input").value = "";
  document.getElementById("add-task-textarea").value = "";
  document.getElementById("date").value = "";
  document.getElementById("add-task-category").value = "";
  document.getElementById("add-task-assigned-avatar").innerHTML = "";
  document.getElementById("add-task-subtasks-input").value = "";
  document.getElementById("add-task-subtasks-list").innerHTML = "";
}

/**
 * Resets task icons and priority toggle.
 * @returns {void}
 */
function resetTaskIcons() {
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  addTaskPrioToggleButton("medium", "add-task-urgent-medium-low-buttons");
}

/**
 * Clears selected contact styling.
 * @returns {void}
 */
function clearSelectedContacts() {
  const selected = document.querySelectorAll("li.selectedContact");
  selected.forEach((li) => li.classList.remove("selectedContact"));
}

/**
 * Clears global task arrays and resets the add task form.
 * @returns {void}
 */
function addTaskClearFormularReset() {
  window.globalSubtasks = [];
  window.subtasksList = [];
  clearTaskInputs();
  resetTaskIcons();
  clearSelectedContacts();
  window.assignedContacts = [];
  addTaskAssignedToUnCheck();
}
window.addTaskClearFormularReset = addTaskClearFormularReset;

/**
 * Prevents default form submission and resets the form.
 * @param {Event} event
 * @returns {void}
 */
function addTaskClearFormular(event) {
  event.preventDefault();
  addTaskClearFormularReset();
}
window.addTaskClearFormular = addTaskClearFormular;

/**
 * Validates a single field by checking its value against a regex.
 * Adds an error class and message if validation fails.
 * @param {string} fieldId - The DOM id of the input field.
 * @param {string} errorFieldId - The DOM id of the error message container.
 * @param {RegExp} regex - The regular expression for validation.
 * @param {string} errorMsg - The error message to display.
 * @returns {boolean} True if the field is valid, false otherwise.
 */
function validateField(fieldId, errorFieldId, regex, errorMsg) {
  const value = document.getElementById(fieldId).value.trim();
  if (!regex.test(value)) {
    document.getElementById(fieldId).classList.add("error");
    const errDiv = document.getElementById(errorFieldId);
    errDiv.textContent = errorMsg;
    errDiv.style.display = "flex";
    return false;
  }
  return true;
}

/**
 * Validates task fields.
 * @returns {boolean} True if all fields are valid.
 */
function validateTask(
  titleId,
  descriptionId,
  dateId,
  categoryId,
  errorTitleId,
  errorDescriptionId,
  errorDateId,
  errorCategoryId
) {
  const vals = [
    [
      titleId,
      errorTitleId,
      /^[-&.()-–_a-zA-ZÀ-ž\s0-9/"!,–]+$/,
      "Please enter a Title.",
    ],
    [
      descriptionId,
      errorDescriptionId,
      /^[-&.()-–_a-zA-ZÀ-ž\s0-9/"!,–]+$/,
      "Please enter a description.",
    ],
    [dateId, errorDateId, /^[0-9.-–-]+$/, "Please enter a Date."],
    [
      categoryId,
      errorCategoryId,
      /^[a-zA-ZÀ-ž\s]+$/,
      "Please enter a Category.",
    ],
  ];
  return vals.every((v) => validateField(v[0], v[1], v[2], v[3]));
}
function addTaskSubtasksClicked() {
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.add("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.remove("d-none");
  document.addEventListener("click", handleOutsideClickSubtasks);
}

/*
 * Closes the subtask input field (resets icons, clears input).
 */
function closeSubtaskInput() {
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  document.getElementById("add-task-subtasks-input").value = "";
}

/*
 * Called on every click on the entire document
 * (after addTaskSubtasksClicked() has registered the listener).
 * Checks whether the click occurred inside or outside the container.
 */
function handleOutsideClickSubtasks(event) {
  const container = document.getElementById("add-task-subtasks-container");
  if (!container) return;
  if (!container.contains(event.target)) {
    closeSubtaskInput();
    document.removeEventListener("click", handleOutsideClickSubtasks);
  }
}

/**
 * Click on the X icon.
 * Since the X button is likely inside the same container,
 * we prevent the document listener from treating it as "outside."
 */
function clearSubtasks(event) {
  event.stopPropagation();
  closeSubtaskInput();
  document.removeEventListener("click", handleOutsideClickSubtasks);
}
