/********************************
 * Datei: add_task.js
 * Enthält:
 * 1) Deine alten Funktionen für add_task.html (Hauptformular)
 * 2) Neue, separate Overlay-Funktionen (prefix "overlay...")
 ********************************/

// ===== Globale Variablen =====
let databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";
let globalPrio = "medium";
let globalCategory = "";
let globalSubtasks = [];
let subtasksList = [];
// ### Haupt-Formular: Array mit gewählten Personen
let assignedContacts = [];
// ### "globale" Kontaktliste
let contactsToAssigned = [];
let selectedTask = null;
let editingTaskId = null;
let editingMode = false;

// ===== 1) Init-Funktion fürs Hauptformular =====
async function initAddTask() {
  await loadContacts(); // Holt alle Kontakte (contactsToAssigned)
  createAssignedTo(); // Erzeugt direkt die Kontakt-Liste ohne Filter
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
  const names = assignedContacts.slice(); // Kopie aller aktuell gewählten
  const date = addTaskDueDate();
  const subtasks = globalSubtasks || [];

  const newTask = {
    id: taskId,
    title: title,
    description: description,
    assignees: names, // WICHTIG: unsere assignedContacts
    date: date,
    priority: globalPrio,
    category: globalCategory,
    boardCategory: "todo", // Standard
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
    // Checken, ob dieser Kontakt schon gewählt ist
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
      // passt nicht => überspringen
      return;
    }
    const bgColor = assignColor(contactName);
    // Schon ausgewählt?
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
    // already selected => entfernen
    assignedContacts.splice(index, 1);
  } else {
    // noch nicht drin => hinzufügen
    assignedContacts.push(contactName);
  }
  // Avatare aktualisieren
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
    // Nur Initialen, kein "x"
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
loadTasks(); // Lädt direkt beim Skriptstart

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

  // Titel + Beschreibung
  const title = document
    .getElementById("overlay-add-task-title-input")
    .value.trim();
  const description = document
    .getElementById("overlay-add-task-textarea")
    .value.trim();

  // Kontakte
  const names = overlayAssignedContacts.slice(); // Kopie der aktuellen Auswahl

  // Datum
  const date = document.getElementById("overlay-date").value;
  // Priority
  const priority = overlayGetPriority();
  // Kategorie
  const category = document
    .getElementById("overlay-add-task-category")
    .value.trim();

  // Subtasks
  const spans = document.querySelectorAll(
    "#overlay-add-task-subtasks-list li span"
  );
  let overlaySubtasks = [];
  spans.forEach((s) => overlaySubtasks.push(s.textContent.trim()));

  // Neues Task-Objekt
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
      showToast("Task created from overlay!");

      // Formular + Overlay reset
      overlayClearForm();
      document.getElementById("addTaskOverlay").style.display = "none";

      // Board neu laden
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

/** Overlay-Priority **/
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
  // aktivieren
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

/** Overlay-Category **/
function overlayAddTaskChoseCategory(value) {
  document.getElementById("overlay-add-task-category").value = value;
}

/** Overlay-Subtasks (unverändert) **/
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

  // Zeige ALLE Kontakte
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

/** Toggle-Funktion fürs Overlay */
function overlayToggleContactSelection(contactName) {
  const idx = overlayAssignedContacts.indexOf(contactName);
  if (idx >= 0) {
    // schon drin => entfernen
    overlayAssignedContacts.splice(idx, 1);
  } else {
    // hinzufügen
    overlayAssignedContacts.push(contactName);
  }
  overlayShowAvatars();
}

/** Avatare im Overlay */
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

/*edit*/
function editTask(taskId) {
  console.log("Edit Task:", taskId);

  // 1) Finde Task in globalen tasks
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error("Task not found to edit:", taskId);
    return;
  }
  window.oldBoardCategory = task.boardCategory;
  // 2) Speichere die ID in editingTaskId
  editingTaskId = taskId;
  editingMode = true;

  // 3) Blende das Board-Overlay aus
  closeBoardOverlay();

  // 4) Öffne das "Add Task Overlay" (oder ein spezielles Edit-Overlay),
  //    Fülle es mit den Task-Daten:
  openAddTaskOverlayForEdit(task);
}

function openAddTaskOverlayForEdit(task) {
  // 1) Wechsle das Overlay auf "block" o. Ä.
  const overlay = document.getElementById("addTaskOverlay");
  overlay.classList.add("active");

  // 2) Titel & Beschreibung
  document.getElementById("overlay-add-task-title-input").value = task.title;
  document.getElementById("overlay-add-task-textarea").value = task.description;

  // 3) Datum
  document.getElementById("overlay-date").value = task.date || "";

  // 4) Kategorie
  document.getElementById("overlay-add-task-category").value =
    task.category || "";

  // 5) Priority (Prio-Buttons)
  overlayAddTaskPrioToggleButton(
    task.priority || "medium",
    "overlay-add-task-urgent-medium-low-buttons"
  );

  // 6) Assignees (overlayAssignedContacts füllen)
  overlayAssignedContacts = [...(task.assignees || [])];
  overlayShowAvatars();

  // 7) Subtasks
  //    Leere erst die Liste und fülle neu
  document.getElementById("overlay-add-task-subtasks-list").innerHTML = "";
  (task.subtasks || []).forEach((sub) => {
    createOverlaySubtaskLi(sub.name, sub.done);
  });

  // 8) Button / Form-Submit auf "overlayUpdateTask()" statt "overlayAddTaskCreateTask()"
  const form = document.getElementById("overlay-add-task-form");
  form.onsubmit = (event) => {
    event.preventDefault();
    overlayUpdateTask(); // Siehe nächste Funktion
  };

  // Optional: Ändere den Button-Text „Create Task“ → „Save Task“
  const createBtn = document.querySelector(".add-task-bottom-create-button");
  if (createBtn) {
    createBtn.innerHTML = `
      <div class="add-task-bottom-create-task">
        Save Changes
        <img class="add-task-create-task" src="/assets/icons/add_task_check.svg" alt="check" />
      </div>
    `;
  }
}

async function overlayUpdateTask() {
  if (!editingTaskId) {
    console.error("No editingTaskId set. Cannot update task!");
    return;
  }

  // 1) Gleiche Logik wie beim Erstellen, aber wir überschreiben das Objekt in Firebase
  const title = document
    .getElementById("overlay-add-task-title-input")
    .value.trim();
  const description = document
    .getElementById("overlay-add-task-textarea")
    .value.trim();
  const date = document.getElementById("overlay-date").value;
  const priority = overlayGetPriority();
  const category = document
    .getElementById("overlay-add-task-category")
    .value.trim();

  // Subtasks einsammeln
  const spans = document.querySelectorAll(
    "#overlay-add-task-subtasks-list li span"
  );
  let overlaySubtasks = [];
  spans.forEach((s) => overlaySubtasks.push(s.textContent.trim()));

  // Assigned Contacts
  const assignees = overlayAssignedContacts.slice();

  // 2) Erstelle das aktualisierte Task-Objekt
  const updatedTask = {
    id: editingTaskId,
    title,
    description,
    assignees,
    date,
    priority,
    category,
    boardCategory: window.oldBoardCategory || "todo",
    subtasks: overlaySubtasks.map((st) => ({ name: st, done: false })),
  };

  // 3) PUT/PATCH in Firebase
  const taskRef = `${databaseURL}/tasks/${editingTaskId}.json`;
  try {
    const response = await fetch(taskRef, {
      method: "PUT", // oder PATCH
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });
    if (response.ok) {
      console.log("Overlay-Task erfolgreich aktualisiert:", updatedTask);
      showToast("Task updated!");

      // 4) Reset + Overlay schließen
      overlayClearForm(); // setzt overlayAssignedContacts = [];
      document.getElementById("addTaskOverlay").style.display = "none";
      editingMode = false;
      editingTaskId = null;

      // 5) Board neu laden
      await displayTasks();
    } else {
      console.error("Fehler beim Updaten (Overlay)", response.status);
    }
  } catch (err) {
    console.error("Fehler (Overlay):", err);
  }
}

function createOverlaySubtaskLi(name, done) {
  const ul = document.getElementById("overlay-add-task-subtasks-list");
  // done ignorieren wir hier, weil wir in deinem Code
  // noch kein "Haken" für Subtasks hast. Falls du den Status
  // in der Edit-Ansicht willst, kannst du einen <input type="checkbox"> hinzufügen.
  const li = document.createElement("li");
  li.innerHTML = `
    <span class="add-task-subtasks-extra-task">${name}</span>
    <div class="add-task-subtasks-icons">
      <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg" onclick="/* optional */">
      <div class="add-tasks-border"></div>
      <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="overlayRemoveSubtask(this)">
    </div>
  `;
  ul.appendChild(li);
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

async function loadContacts() {
  const response = await fetch(`${databaseURL}/contacts.json`);
  const data = await response.json();
  contactsToAssigned = data;
  contactsToAssigned = Object.values(contactsToAssigned);
  createAssignedTo();
}

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
  let firstLetter = name.trim().charAt(0).toUpperCase();
  return colors[firstLetter] || "#999999";
}
