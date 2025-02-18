// ===== Globale Variablen =====
let databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";
let globalPrio = "medium";
let globalCategory = "";
let globalSubtasks = [];
let subtasksList = [];
let assignedContacts = [];
let editAssignedContacts = [];
let contactsToAssigned = [];
let selectedTask = null;
let editingTaskId = null;
let editingMode = false;

// ===== 1) Init-Funktion fürs Hauptformular =====
async function initAddTask() {
  await loadContacts();
  createAssignedTo();
  getCategoryFromUrl();
}

function getCategoryFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("category")) {
    globalBoardCategory = urlParams.get("category");
  }
}

// =============== ALTE FUNKTIONEN (Titel, Beschreibung etc.) ===============
function addTaskTitle() {
  const valueFromTitle = document.getElementById("add-task-title-input").value;
  document.getElementById("add-task-title-input").value = "";
  return valueFromTitle;
}

function addTaskDescription() {
  const valueFromDescription =
    document.getElementById("add-task-textarea").value;
  document.getElementById("add-task-textarea").value = "";
  return valueFromDescription;
}

function addTaskDueDate() {
  const date = document.getElementById("date").value;
  document.getElementById("date").value = "";
  return date;
}

function addTaskCreateTask() {
  const taskId = "task_" + Date.now();
  const title = addTaskTitle();
  const description = addTaskDescription();
  const names = assignedContacts.slice();
  const date = addTaskDueDate();
  const subtasks = globalSubtasks || [];

  const newTask = {
    id: taskId,
    title: title,
    description: description,
    assignees: names,
    date: date,
    priority: globalPrio,
    category: globalCategory,
    boardCategory: "todo",
    subtasks: subtasks.map((sb) => ({ name: sb, done: false })),
  };

  const taskRef = `${databaseURL}/tasks/${taskId}.json`;
  fetch(taskRef, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask),
  })
    .then((response) => {
      if (response.ok) {
        addTaskClearFormularReset();
        addTaskCreateTaskConfirmation();
        console.log("Task erfolgreich gespeichert!");
      } else {
        console.error("Fehler beim Speichern des Tasks");
      }
    })
    .catch((err) => console.error("Fehler:", err));
}

function addTaskChoseCategory(category) {
  let selectElement = (document.getElementById("add-task-category").value =
    category);
  globalCategory = selectElement;
}

function addTaskSubtasks(event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const subtasks = document.getElementById("add-task-subtasks-input");
  const subtaskValue = subtasks.value.trim();
  if (!subtaskValue) return;

  globalSubtasks.unshift(subtaskValue);
  subtasksList.unshift(subtaskValue);
  addTaskSubtasksList();

  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  subtasks.value = "";
}

function addGlobalSubtasksToTask(taskIndex, subtasks, tasks) {
  if (tasks[taskIndex]) {
    if (subtasks.length > 0) {
      subtasks.forEach((subtaskName) => {
        tasks[taskIndex].subtasks.push({ name: subtaskName, done: false });
      });
    }
  } else {
    console.error("Task at index", taskIndex, "is undefined");
  }
}

// =============== KONTAKTLISTE IM HAUPTFORMULAR ===============

/**
 * Erzeugt die Liste aller Kontakte (ohne Such-Filter).
 */
function createAssignedTo() {
  const createContactsContainer = document.getElementById("add-task-contact");
  if (!createContactsContainer) return;

  createContactsContainer.innerHTML = "";
  contactsToAssigned.forEach((contact, i) => {
    const bgColor = assignColor(contact.name);
    const checked = assignedContacts.includes(contact.name);

    createContactsContainer.innerHTML += `
      <li>
        <label for="person${i}">
          <span class="avatar" style="background-color:${bgColor};">
            ${getUserInitials(contact.name)}
          </span>
          <span>${contact.name}</span>
        </label>
        <input
          class="add-task-checkbox"
          type="checkbox"
          name="person[${i}]"
          id="person${i}"
          value="${contact.name}"
          ${checked ? "checked" : ""}
          onclick="toggleContactSelection('${contact.name}')"
        >
      </li>
    `;
  });
}

/**
 * Sucht in contactsToAssigned nach passenden Kontakten und rendert neu.
 */
function addTaskAssignedToSearch() {
  let search = document.getElementById("find-person").value.toLowerCase();
  const container = document.getElementById("add-task-contact");
  container.innerHTML = "";

  contactsToAssigned.forEach((c, i) => {
    let contactName = c.name;
    if (!contactName.toLowerCase().includes(search)) {
      return;
    }
    const bgColor = assignColor(contactName);
    const checked = assignedContacts.includes(contactName);

    container.innerHTML += `
      <li>
        <label for="person${i}">
          <span class="avatar" style="background-color:${bgColor};">
            ${getUserInitials(contactName)}
          </span>
          <span>${contactName}</span>
        </label>
        <input
          class="add-task-checkbox"
          type="checkbox"
          name="person[${i}]"
          id="person${i}"
          value="${contactName}"
          ${checked ? "checked" : ""}
          onclick="toggleContactSelection('${contactName}')"
        >
      </li>
    `;
  });
}

/**
 * Toggelt einen Kontakt in assignedContacts (Haupt-Formular).
 */
function toggleContactSelection(contactName) {
  const index = assignedContacts.indexOf(contactName);
  if (index >= 0) {
    assignedContacts.splice(index, 1);
  } else {
    assignedContacts.push(contactName);
  }
  addTaskShowAvatars();
}

/**
 * Zeigt Avatare unten an (ohne "x"-Button).
 */
function addTaskShowAvatars() {
  const avatarContainer = document.getElementById("add-task-assigned-avatar");
  if (!avatarContainer) return;

  avatarContainer.innerHTML = "";
  assignedContacts.forEach((contact) => {
    const color = assignColor(contact);
    avatarContainer.innerHTML += `
      <div class="avatar" style="background:${color}">
        ${getUserInitials(contact)}
      </div>
    `;
  });
}

/**
 * Lädt die Kontakte aus Firebase (contacts.json)
 * und ruft danach createAssignedTo() auf, um sie anzuzeigen.
 */
async function loadContacts() {
  const response = await fetch(`${databaseURL}/contacts.json`);
  const data = await response.json();
  contactsToAssigned = Object.values(data || {});
  createAssignedTo();
}

// =============== ALTE HILFSFUNKTIONEN ===============
function loadTasks() {
  getTasks().then((loadedTasks) => {
    window.tasks = loadedTasks;
    console.log("Tasks gespeichert in window.tasks:", window.tasks);
  });
}
loadTasks();

function assignColor(name) {
  const colors = {
    A: "#FF5733",
    B: "#33FF57",
    C: "#5733FF",
    D: "#FF33A8",
    E: "#33A8FF",
    F: "#A8FF33",
    G: "#FF8C33",
    H: "#8C33FF",
    I: "#33FFD7",
    J: "#FFD733",
    K: "#33FF8C",
    L: "#D733FF",
    M: "#FF336E",
    N: "#338CFF",
    O: "#33FFBD",
    P: "#FFBD33",
    Q: "#8CFF33",
    R: "#FF338C",
    S: "#336EFF",
    T: "#33FF57",
    U: "#FF5733",
    V: "#5733FF",
    W: "#FF33A8",
    X: "#33A8FF",
    Y: "#A8FF33",
    Z: "#FF8C33",
  };
  const firstLetter = name.trim()[0]?.toUpperCase() || "Z";
  return colors[firstLetter] || "#999999";
}

function getUserInitials(contact) {
  let parts = contact.trim().split(" ");
  let first = parts[0]?.[0]?.toUpperCase() || "";
  let last = parts[1]?.[0]?.toUpperCase() || "";
  return first + last;
}

/** usw... (Subtasks, createTaskTemplate, displayTasks, etc.) **/

// =============== OVERLAY-FUNKTIONEN ===============
/**
 * Seperates Array fürs Overlay:
 */
let overlayAssignedContacts = [];

/**
 * Overlay-Form abschicken
 */
async function overlayAddTaskCreateTask() {
  const taskId = "task_" + Date.now();

  const title = document
    .getElementById("overlay-add-task-title-input")
    .value.trim();
  const description = document
    .getElementById("overlay-add-task-textarea")
    .value.trim();

  const names = overlayAssignedContacts.slice();

  const date = document.getElementById("overlay-date").value;
  const priority = overlayGetPriority();
  const category = document
    .getElementById("overlay-add-task-category")
    .value.trim();

  const spans = document.querySelectorAll(
    "#overlay-add-task-subtasks-list li span"
  );
  let overlaySubtasks = [];
  spans.forEach((s) => overlaySubtasks.push(s.textContent.trim()));

  const newTask = {
    id: taskId,
    title,
    description,
    assignees: names,
    date,
    priority,
    category,
    boardCategory: "todo",
    subtasks: overlaySubtasks.map((st) => ({ name: st, done: false })),
  };

  const taskRef = `${databaseURL}/tasks/${taskId}.json`;
  try {
    const response = await fetch(taskRef, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    if (response.ok) {
      console.log("Overlay-Task erfolgreich gespeichert:", newTask);
      addTaskCreateTaskConfirmation();

      overlayClearForm();
      document.getElementById("addTaskOverlay").style.display = "none";

      await displayTasks();
    } else {
      console.error("Fehler beim Speichern (Overlay)", response.status);
    }
  } catch (err) {
    console.error("Fehler (Overlay):", err);
  }
}

/**
 * Overlay-Form resetten
 */
function overlayClearForm() {
  document.getElementById("overlay-add-task-title-input").value = "";
  document.getElementById("overlay-add-task-textarea").value = "";
  document.getElementById("overlay-date").value = "";
  document.getElementById("overlay-add-task-category").value = "";

  document.getElementById("overlay-add-task-assigned-avatar").innerHTML = "";
  overlayAssignedContacts = [];

  document.getElementById("overlay-add-task-subtasks-list").innerHTML = "";

  overlayAddTaskPrioToggleButton(
    "medium",
    "overlay-add-task-urgent-medium-low-buttons"
  );
  const container = document.getElementById("overlay-add-task-contact");
  if (container) container.innerHTML = "";
}

function overlayAddTaskPrio(prio, containerId, event) {
  event.preventDefault();
  overlayAddTaskPrioToggleButton(prio, containerId);
}
function overlayAddTaskPrioToggleButton(prio, containerId) {
  const container = document.getElementById(containerId);
  const buttons = container.querySelectorAll("button");
  buttons.forEach((btn) => {
    const icon = btn.querySelector("img");
    btn.classList.remove("add-task-clicked");
    const p = btn.dataset.priority;
    if (icon) {
      icon.src = `/assets/icons/${p}.svg`;
    }
  });
  const activeBtn = container.querySelector(`button[data-priority="${prio}"]`);
  if (activeBtn) {
    activeBtn.classList.add("add-task-clicked");
    const icon = activeBtn.querySelector("img");
    if (icon) icon.src = `/assets/icons/${prio}_white.svg`;
  }
}
function overlayGetPriority() {
  const container = document.getElementById(
    "overlay-add-task-urgent-medium-low-buttons"
  );
  const activeBtn = container.querySelector(".add-task-clicked");
  if (activeBtn) {
    return activeBtn.dataset.priority;
  }
  return "medium";
}

function overlayAddTaskChoseCategory(value) {
  document.getElementById("overlay-add-task-category").value = value;
}

function overlayAddTaskSubtasksClicked() {
  document
    .getElementById("overlay-add-task-subtasks-icon-plus")
    .classList.add("d-none");
  document
    .getElementById("overlay-add-task-subtasks-icon-plus-check")
    .classList.remove("d-none");
}
function overlayAddTaskSubtasks(event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById("overlay-add-task-subtasks-input");
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;

  const ul = document.getElementById("overlay-add-task-subtasks-list");
  const li = document.createElement("li");
  li.innerHTML = `
    <span class="add-task-subtasks-extra-task">${val}</span>
    <div class="add-task-subtasks-icons">
      <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg" onclick="/* optional edit function */">
      <div class="add-tasks-border"></div>
      <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="overlayRemoveSubtask(this)">
    </div>
  `;
  ul.prepend(li);

  input.value = "";
  document
    .getElementById("overlay-add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("overlay-add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
}
function overlayRemoveSubtask(el) {
  const li = el.closest("li");
  if (li) li.remove();
}
function overlayAddSubtasksPlus(event) {
  event.preventDefault();
  overlayAddTaskSubtasksClicked();
  const input = document.getElementById("overlay-add-task-subtasks-input");
  if (input) {
    input.focus();
    input.select();
  }
}
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

/** =============== Overlay-Kontakt-Liste & Suche =============== */

/**
 * Statt "overlayAddTaskAssignedTo()" (das alles neu setzte)
 * nutzen wir Toggling per "overlayToggleContactSelection(...)"
 */
function overlayShowContactList() {
  const container = document.getElementById("overlay-add-task-contact");
  if (!container) return;
  container.innerHTML = "";

  contactsToAssigned.forEach((contact, i) => {
    const bgColor = assignColor(contact.name);
    const checked = overlayAssignedContacts.includes(contact.name);

    container.innerHTML += `
      <li>
        <label for="overlay-person${i}">
          <span class="avatar" style="background-color:${bgColor};">
            ${getUserInitials(contact.name)}
          </span>
          <span>${contact.name}</span>
        </label>
        <input
          class="overlay-add-task-checkbox"
          type="checkbox"
          id="overlay-person${i}"
          value="${contact.name}"
          ${checked ? "checked" : ""}
          onclick="overlayToggleContactSelection('${contact.name}')"
        >
      </li>
    `;
  });
}

function overlayAddTaskAssignedToSearch() {
  const search = document
    .getElementById("overlay-find-person")
    .value.toLowerCase();
  const container = document.getElementById("overlay-add-task-contact");
  container.innerHTML = "";

  contactsToAssigned.forEach((c, i) => {
    const contactName = c.name;
    if (!contactName.toLowerCase().includes(search)) return;

    const bgColor = assignColor(contactName);
    const checked = overlayAssignedContacts.includes(contactName);

    container.innerHTML += `
      <li>
        <label for="overlay-person${i}">
          <span class="avatar" style="background-color:${bgColor};">
            ${getUserInitials(contactName)}
          </span>
          <span>${contactName}</span>
        </label>
        <input
          class="overlay-add-task-checkbox"
          type="checkbox"
          id="overlay-person${i}"
          value="${contactName}"
          ${checked ? "checked" : ""}
          onclick="overlayToggleContactSelection('${contactName}')"
        >
      </li>
    `;
  });
}

function overlayToggleContactSelection(contactName) {
  const idx = overlayAssignedContacts.indexOf(contactName);
  if (idx >= 0) {
    overlayAssignedContacts.splice(idx, 1);
  } else {
    overlayAssignedContacts.push(contactName);
  }
  overlayShowAvatars();
}

function overlayShowAvatars() {
  const avatarDiv = document.getElementById("overlay-add-task-assigned-avatar");
  if (!avatarDiv) return;

  avatarDiv.innerHTML = "";
  overlayAssignedContacts.forEach((contact) => {
    const bgColor = assignColor(contact);
    avatarDiv.innerHTML += `
      <div class="avatar" style="background-color:${bgColor};">
        ${getUserInitials(contact)}
      </div>
    `;
  });
}

/****************************************
 * editTask(taskId)
 * - Called from detail mode's "Edit" button
 * - Sets editingMode = true, re-opens overlay
 ****************************************/
function editTask(taskId) {
  editingMode = true;
  editingTaskId = taskId;
  openBoardOverlay(taskId);
}

/****************************************
 * updateTask(taskId)
 * - Called by the "Ok" button in edit mode
 * - Actually saves to Firebase
 ****************************************/
async function updateTask(taskId) {
  const taskRef = `${databaseURL}/tasks/${taskId}.json`;

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

  const assignees = editAssignedContacts.slice();

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

      editingMode = false;
      editingTaskId = null;

      openBoardOverlay(taskId);
    } else {
      console.error("Update failed with status:", response.status);
    }
  } catch (err) {
    console.error("Error updating task:", err);
  }
}

/****************************************
 * fillEditFormData(task)
 * - Called right after injecting the edit template
 ****************************************/
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

  editAssignedContacts = [...(task.assignees || [])];
  editShowAvatars();

  const ul = document.getElementById("overlay-edit-task-subtasks-list");
  ul.innerHTML = "";
  (task.subtasks || []).forEach((sub) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="add-task-subtasks-extra-task">${sub.name}</span>
      <div class="add-task-subtasks-icons">
        <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg" onclick="editSubtaskName(this)">
        <div class="add-tasks-border"></div>
        <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="editRemoveSubtask(this)">
      </div>
    `;
    ul.appendChild(li);
  });

  window.oldBoardCategory = task.boardCategory;
}

/****************************************
 * Priority handling for Edit
 ****************************************/
function editSetTaskPrio(prio, containerId, event) {
  event.preventDefault();
  editTogglePrioButton(prio, containerId);
}

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

/****************************************
 * Category in Edit
 ****************************************/
function editSetCategory(value) {
  document.getElementById("overlay-edit-task-category").value = value;
}

/****************************************
 * Subtasks in Edit: Add, Remove, Edit
 ****************************************/
function editSubtasksClicked() {
  document
    .getElementById("overlay-edit-task-subtasks-icon-plus")
    .classList.add("d-none");
  document
    .getElementById("overlay-edit-task-subtasks-icon-plus-check")
    .classList.remove("d-none");
}

function editAddSubtask(event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById("overlay-edit-task-subtasks-input");
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;

  const ul = document.getElementById("overlay-edit-task-subtasks-list");
  const li = document.createElement("li");
  li.innerHTML = `
    <span class="add-task-subtasks-extra-task">${val}</span>
    <div class="add-task-subtasks-icons">
      <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg" onclick="editSubtaskName(this)">
      <div class="add-tasks-border"></div>
      <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="editRemoveSubtask(this)">
    </div>
  `;
  ul.prepend(li);

  input.value = "";
  document
    .getElementById("overlay-edit-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("overlay-edit-task-subtasks-icon-plus-check")
    .classList.add("d-none");
}

function editSubtaskName(el) {
  const li = el.closest("li");
  if (!li) return;
  const span = li.querySelector("span");
  if (!span) return;

  const oldName = span.textContent.trim();
  const input = document.createElement("input");
  input.type = "text";
  input.value = oldName;
  input.addEventListener("keypress", (ev) => {
    if (ev.key === "Enter") {
      const newName = input.value.trim();
      span.textContent = newName;
      li.replaceChild(span, input);
    }
  });
  input.addEventListener("blur", () => {
    const newName = input.value.trim();
    span.textContent = newName;
    li.replaceChild(span, input);
  });

  li.replaceChild(input, span);
  input.focus();
}

function editRemoveSubtask(el) {
  const li = el.closest("li");
  if (li) li.remove();
}

function editSubtasksPlus(event) {
  event.preventDefault();
  editSubtasksClicked();
  const input = document.getElementById("overlay-edit-task-subtasks-input");
  if (input) {
    input.focus();
    input.select();
  }
}

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

/****************************************
 * Assigned Contacts in Edit
 * (Similar to your "Add" overlay,
 * but using editAssignedContacts)
 ****************************************/
function editShowContactList() {
  const container = document.getElementById("overlay-edit-task-contact");
  if (!container) return;
  container.innerHTML = "";

  (contactsToAssigned || []).forEach((contact, i) => {
    const bgColor = assignColor(contact.name);
    const checked = editAssignedContacts.includes(contact.name);

    container.innerHTML += `
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
  });
}

function editAssignedToSearch() {
  const search = document
    .getElementById("overlay-find-person")
    .value.toLowerCase();
  const container = document.getElementById("overlay-edit-task-contact");
  container.innerHTML = "";

  (contactsToAssigned || []).forEach((c, i) => {
    const contactName = c.name;
    if (!contactName.toLowerCase().includes(search)) return;

    const bgColor = assignColor(contactName);
    const checked = editAssignedContacts.includes(contactName);

    container.innerHTML += `
      <li>
        <label for="edit-person${i}">
          <span class="avatar" style="background-color:${bgColor};">
            ${getUserInitials(contactName)}
          </span>
          <span>${contactName}</span>
        </label>
        <input
          class="overlay-add-task-checkbox"
          type="checkbox"
          id="edit-person${i}"
          value="${contactName}"
          ${checked ? "checked" : ""}
          onclick="editToggleContactSelection('${contactName}')"
        >
      </li>
    `;
  });
}

function editToggleContactSelection(contactName) {
  const idx = editAssignedContacts.indexOf(contactName);
  if (idx >= 0) {
    editAssignedContacts.splice(idx, 1);
  } else {
    editAssignedContacts.push(contactName);
  }
  editShowAvatars();
}

function editShowAvatars() {
  const avatarDiv = document.getElementById(
    "overlay-edit-task-assigned-avatar"
  );
  if (!avatarDiv) return;
  avatarDiv.innerHTML = "";

  editAssignedContacts.forEach((contactName) => {
    const bgColor = assignColor(contactName);
    avatarDiv.innerHTML += `
      <div class="avatar" style="background:${bgColor}">
        ${getUserInitials(contactName)}
      </div>
    `;
  });
}

/* =====================================
   Restlicher Code: getTasks(), deleteTask, 
   displayTasks(), etc. kannst du unverändert lassen.
===================================== */

async function getTasks() {
  const taskRef = `${databaseURL}/tasks.json`;
  const response = await fetch(taskRef);
  const tasks = await response.json();
  if (response.ok && tasks) {
    if (Object.keys(tasks).length === 0) {
      return [];
    }
    return Object.keys(tasks).map((id) => ({ id, ...tasks[id] }));
  } else {
    console.error("No Tasks Found", tasks);
    return [];
  }
}

function deleteTaskInFirebase(taskId) {
  return fetch(`${databaseURL}/tasks/${taskId}.json`, {
    method: "DELETE",
  })
    .then(() => console.log("Task in Firebase gelöscht"))
    .catch((error) => console.error("Fehler beim Löschen in Firebase", error));
}

async function deleteTask(taskId) {
  // 1) Löschen in local tasks
  tasks = tasks.filter((task) => task.id !== taskId);
  // 2) Delete-Request an Firebase
  await deleteTaskInFirebase(taskId);
  // 3) DOM entfernen, Overlay schließen, Board neu rendern
  const taskEl = document.getElementById(taskId);
  if (taskEl) taskEl.remove();
  closeBoardOverlay();
  displayTasks();
}

async function displayTasks() {
  const tasks = await getTasks();
  window.tasks = tasks;
  const todoContainer = document
    .getElementById("todo")
    .querySelector(".task_list");
  const doingContainer = document
    .getElementById("doing")
    .querySelector(".task_list");
  const feedbackContainer = document
    .getElementById("feedback")
    .querySelector(".task_list");
  const doneContainer = document
    .getElementById("done")
    .querySelector(".task_list");

  todoContainer.innerHTML = "";
  doingContainer.innerHTML = "";
  feedbackContainer.innerHTML = "";
  doneContainer.innerHTML = "";

  tasks.forEach((task) => {
    const template = document.createElement("div");
    template.innerHTML = createTaskTemplate(task);
    const taskElement = template.firstElementChild;
    if (taskElement) {
      taskElement.draggable = true;
      taskElement.ondragstart = drag; // Falls du Drag&Drop hast
      taskElement.ondragend = dragEnd; // Falls du Drag&Drop hast
      switch (task.boardCategory) {
        case "todo":
          todoContainer.appendChild(taskElement);
          break;
        case "doing":
          doingContainer.appendChild(taskElement);
          break;
        case "feedback":
          feedbackContainer.appendChild(taskElement);
          break;
        case "done":
          doneContainer.appendChild(taskElement);
          break;
        default:
          console.error("Unbekannte Kategorie:", task.boardCategory);
      }
    }
  });
}
