"use strict";
/**
 * Initializes the main add-task form.
 * @returns {Promise<void>}
 */
function initAddTask() {
  loadContacts().then(() => {
    createAssignedTo();
    getCategoryFromUrl();
  });
}
window.initAddTask = initAddTask;

/**
 * Retrieves category from URL parameters.
 * @returns {void}
 */
function getCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("category"))
    window.globalBoardCategory = params.get("category");
}
window.getCategoryFromUrl = getCategoryFromUrl;

/**
 * Gets and clears the task title.
 * @returns {string}
 */
function addTaskTitle() {
  const title = document.getElementById("add-task-title-input").value;
  document.getElementById("add-task-title-input").value = "";
  return title;
}
window.addTaskTitle = addTaskTitle;

/**
 * Gets and clears the task description.
 * @returns {string}
 */
function addTaskDescription() {
  const desc = document.getElementById("add-task-textarea").value;
  document.getElementById("add-task-textarea").value = "";
  return desc;
}
window.addTaskDescription = addTaskDescription;

/**
 * Gets and clears the due date.
 * @returns {string}
 */
function addTaskDueDate() {
  const date = document.getElementById("date").value;
  document.getElementById("date").value = "";
  return date;
}
window.addTaskDueDate = addTaskDueDate;

/**
 * Creates a new task and saves it to Firebase.
 * @returns {void}
 */
function addTaskCreateTask() {
  if (
    !validateTask(
      "add-task-title-input",
      "add-task-textarea",
      "date",
      "add-task-category",
      "errorTitle",
      "errorDescription",
      "errorDate",
      "errorCategory"
    )
  ) {
    return;
  }
  const taskId = "task_" + Date.now();
  const title = addTaskTitle();
  const desc = addTaskDescription();
  const names = window.assignedContacts.slice();
  const date = addTaskDueDate();
  const subtasks = window.globalSubtasks || [];
  const newTask = {
    id: taskId,
    title: title,
    description: desc,
    assignees: names,
    date: date,
    priority: window.globalPrio,
    category: window.globalCategory,
    boardCategory: "todo",
    subtasks: subtasks.map((sb) => ({ name: sb, done: false })),
  };
  const ref = `${window.databaseURL}/tasks/${taskId}.json`;
  fetch(ref, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask),
  })
    .then((resp) => {
      if (resp.ok) {
        addTaskClearFormularReset();
        addTaskCreateTaskConfirmation();
      } else {
        console.error("Error saving task");
      }
    })
    .catch((err) => console.error("Error:", err));
}
window.addTaskCreateTask = addTaskCreateTask;

/**
 * Sets the task category.
 * @param {string} category
 * @returns {void}
 */
function addTaskChoseCategory(category) {
  document.getElementById("add-task-category").value = category;
  window.globalCategory = category;
}
window.addTaskChoseCategory = addTaskChoseCategory;

/**
 * Adds a subtask to the main form.
 * @param {Event} event
 * @returns {void}
 */
function addTaskSubtasks(event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById("add-task-subtasks-input");
  const val = input.value.trim();
  if (!val) return;
  window.globalSubtasks.unshift(val);
  window.subtasksList.unshift(val);
  addTaskSubtasksList();
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  input.value = "";
}
window.addTaskSubtasks = addTaskSubtasks;

/**
 * Renders the contact list for assignment.
 * @returns {void}
 */
function createAssignedTo() {
  const container = document.getElementById("add-task-contact");
  if (!container) return;
  container.innerHTML = "";
  window.contactsToAssigned.forEach((c, i) => {
    const bg = assignColor(c.name);
    const chk = window.assignedContacts.includes(c.name);
    container.innerHTML += createAssignedToTemplate(chk, i, bg, c);
  });
}
window.createAssignedTo = createAssignedTo;

/**
 * Filters contacts in the main form.
 * @returns {void}
 */
function addTaskAssignedToSearch() {
  const search = document.getElementById("find-person").value.toLowerCase();
  const container = document.getElementById("add-task-contact");
  container.innerHTML = "";
  window.contactsToAssigned.forEach((c, i) => {
    if (!c.name.toLowerCase().includes(search)) return;
    const bg = assignColor(c.name);
    const chk = window.assignedContacts.includes(c.name);
    container.innerHTML += addTaskAssignedToSearchTemplate(chk, i, bg, c);
  });
}
window.addTaskAssignedToSearch = addTaskAssignedToSearch;

/**
 * Toggles a contact selection.
 * @param {string} contactName
 * @returns {void}
 */
function toggleContactSelection(contactName) {
  const idx = window.assignedContacts.indexOf(contactName);
  if (idx >= 0) {
    window.assignedContacts.splice(idx, 1);
  } else {
    window.assignedContacts.push(contactName);
  }

  addTaskShowAvatars();
  const searchValue = document.getElementById("find-person").value.trim();
  if (searchValue) {
    addTaskAssignedToSearch();
  } else {
    createAssignedTo();
  }
}
window.toggleContactSelection = toggleContactSelection;

/**
 * Displays assigned contact avatars, up to 3.
 * If more than 3, adds a "+X others" avatar.
 */
function addTaskShowAvatars() {
  const container = document.getElementById("add-task-assigned-avatar");
  if (!container) return;
  container.innerHTML = "";
  const contacts = window.assignedContacts || [];
  const max = 3;
  contacts.forEach((c, i) => {
    if (i < max)
      container.innerHTML += `<div class="avatar" style="background:${assignColor(
        c
      )}">
      ${getUserInitials(c)}
    </div>`;
  });
  if (contacts.length > max) {
    const leftover = contacts.length - max;
    container.innerHTML += `<div class="avatar-addtaskoverlay">+${leftover} </div>`;
  }
}
window.addTaskShowAvatars = addTaskShowAvatars;

/**
 * Loads contacts from Firebase.
 * @returns {Promise<void>}
 */
async function loadContacts() {
  const resp = await fetch(`${window.databaseURL}/contacts.json`);
  const data = await resp.json();
  window.contactsToAssigned = Object.values(data || {});
  createAssignedTo();
}
window.loadContacts = loadContacts;

/**
 * Sets the minimum due date.
 * @returns {void}
 */
function addTaskMinimumDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").setAttribute("min", today);
}
window.addTaskMinimumDate = addTaskMinimumDate;

/**
 * Toggles the priority buttons.
 * @param {string} prio
 * @param {string} containerId
 * @returns {void}
 */
function addTaskPrioToggleButton(prio, containerId) {
  const container = document.getElementById(containerId);
  const btns = container.children;
  for (const btn of btns) {
    if (btn.dataset.priority === prio) {
      btn.classList.add("add-task-clicked");
      btn.children[0].children[1].src = `/assets/icons/${btn.dataset.priority}_white.svg`;
    } else {
      btn.classList.remove("add-task-clicked");
      btn.children[0].children[1].src = `/assets/icons/${btn.dataset.priority}.svg`;
    }
  }
}
window.addTaskPrioToggleButton = addTaskPrioToggleButton;

/**
 * Unchecks all contact checkboxes.
 * @returns {void}
 */
function addTaskAssignedToUnCheck() {
  const boxes = document.querySelectorAll(".add-task-checkbox");
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) boxes[i].checked = false;
  }
}
window.addTaskAssignedToUnCheck = addTaskAssignedToUnCheck;

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
  edit.setAttribute("onclick", `editTaskSubtaskList(${i},event)`);
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
 * Wird aufgerufen, sobald man das Input oder das Plus-Symbol anklickt.
 * - Wechselt Icons (Plus → Check).
 * - Aktiviert einen globalen Klick-Listener, um Outside-Klick zu erkennen.
 */
function addTaskSubtasksClicked() {
  // Plus ausblenden, Check-Bereich einblenden
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.add("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.remove("d-none");

  // Klick-Listener aktivieren
  document.addEventListener("click", handleOutsideClickSubtasks);
}

/**
 * Schließt das Subtask-Eingabefeld wieder (Icons zurück, Input leeren).
 */
function closeSubtaskInput() {
  // Check ausblenden, Plus wieder zeigen
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.add("d-none");

  // Eingabefeld leeren
  document.getElementById("add-task-subtasks-input").value = "";
}

/**
 * Wird bei jedem Klick auf das gesamte Dokument aufgerufen.
 * Prüft, ob wir den Container angeklickt haben oder nicht.
 */
function handleOutsideClickSubtasks(event) {
  const container = document.getElementById("add-task-subtasks-container");
  if (!container) return;

  // Falls der Klick NICHT innerhalb des Containers stattfand → schliessen:
  if (!container.contains(event.target)) {
    closeSubtaskInput();
    // WICHTIG: Event-Listener entfernen, damit wir nicht permanent lauschen.
    document.removeEventListener("click", handleOutsideClickSubtasks);
  }
}

/**
 * Resets the add-task form.
 * @returns {void}
 */
function addTaskClearFormularReset() {
  const selectedContacts = document.querySelectorAll("li.selectedContact");
  window.globalSubtasks = [];
  window.subtasksList = [];
  document.getElementById("add-task-title-input").value = "";
  document.getElementById("add-task-textarea").value = "";
  document.getElementById("date").value = "";
  document.getElementById("add-task-category").value = "";
  document.getElementById("add-task-assigned-avatar").innerHTML = "";
  document.getElementById("add-task-subtasks-input").value = "";
  document.getElementById("add-task-subtasks-list").innerHTML = "";
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  addTaskPrioToggleButton("medium", "add-task-urgent-medium-low-buttons");

  selectedContacts.forEach((li) => {
    li.classList.remove("selectedContact");
  });

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
  const titleValue = document.getElementById(titleId).value.trim();
  const descriptionValue = document.getElementById(descriptionId).value.trim();
  const dateValue = document.getElementById(dateId).value.trim();
  const categoryValue = document.getElementById(categoryId).value.trim();

  let isValid = true;

  if (!/^[-a-zA-ZÀ-ž\s0-9/"!,–]+$/.test(titleValue)) {
    document.getElementById(titleId).classList.add("error");
    const errDivTitle = document.getElementById(errorTitleId);
    errDivTitle.textContent = "Please enter a Title.";
    errDivTitle.style.display = "flex";
    isValid = false;
  }
  if (!/^[-a-zA-ZÀ-ž\s0-9/"!,–]+$/.test(descriptionValue)) {
    document.getElementById(descriptionId).classList.add("error");
    const errDivDescription = document.getElementById(errorDescriptionId);
    errDivDescription.textContent = "Please enter a discription.";
    errDivDescription.style.display = "flex";
    isValid = false;
  }
  if (!/^[0-9.-]+$/.test(dateValue)) {
    document.getElementById(dateId).classList.add("error");
    const errDivDate = document.getElementById(errorDateId);
    errDivDate.textContent = "Please enter a Date.";
    errDivDate.style.display = "flex";
    isValid = false;
  }
  if (!/^[a-zA-ZÀ-ž\s]+$/.test(categoryValue)) {
    document.getElementById(categoryId).classList.add("error");
    const errDivCategory = document.getElementById(errorCategoryId);
    errDivCategory.textContent = "Please enter a Category.";
    errDivCategory.style.display = "flex";
    isValid = false;
  }
  return isValid;
}

function addTaskSubtasksClicked() {
  document.getElementById("add-task-subtasks-icon-plus").classList.add("d-none");
  document.getElementById("add-task-subtasks-icon-plus-check").classList.remove("d-none");

  // Listener auf document für Klicks ausserhalb
  document.addEventListener("click", handleOutsideClickSubtasks);
}

/*
 
Schließt das Subtask-Eingabefeld (Icons zurück, Input leeren).*/
function closeSubtaskInput() {
  document.getElementById("add-task-subtasks-icon-plus").classList.remove("d-none");
  document.getElementById("add-task-subtasks-icon-plus-check").classList.add("d-none");
  document.getElementById("add-task-subtasks-input").value = "";
}

/*
 
Wird bei jedem Klick auf das gesamte Dokument aufgerufen
(nachdem addTaskSubtasksClicked() den Listener angemeldet hat).
Prüft, ob wir innerhalb oder ausserhalb des Containers geklickt haben.*/
function handleOutsideClickSubtasks(event) {
  const container = document.getElementById("add-task-subtasks-container");
  if (!container) return;

  // Prüfen, ob es AUSSERHALB war:
  if (!container.contains(event.target)) {
    closeSubtaskInput();
    // WICHTIG: den Listener entfernen, sonst bleibt er aktiv
    document.removeEventListener("click", handleOutsideClickSubtasks);
  }
}

/**
 
Klick auf das X-Icon.
Da der X-Button wahrscheinlich auch im selben Container sitzt,
verhindern wir, dass der Document-Listener es als "Außerhalb" ansieht.*/
function clearSubtasks(event) {
  // 1. Klick nicht weiterreichen
  event.stopPropagation();

  // 2. Hier kannst du definieren, was das X tun soll:
  //    Eingabefeld leeren, Icons zurück:
  closeSubtaskInput();

  // 3. Und weil wir das Input manuell schließen,
  //    können wir den Outside-Listener entfernen:
  document.removeEventListener("click", handleOutsideClickSubtasks);
}