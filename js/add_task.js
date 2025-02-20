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
    container.innerHTML += `
      <li class="${chk ? "selectedContact" : ""}">
        <label for="person${i}">
          <span class="avatar" style="background-color:${bg};">${getUserInitials(
      c.name
    )}</span>
          <span>${c.name}</span>
        </label>
        <input class="add-task-checkbox" type="checkbox" name="person[${i}]" id="person${i}"
          value="${c.name}" ${
      chk ? "checked" : ""
    } onclick="toggleContactSelection('${c.name}')">
      </li>
    `;
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
    container.innerHTML += `
      <li class="${chk ? "selectedContact" : ""}">
        <label for="person${i}">
          <span class="avatar" style="background-color:${bg};">${getUserInitials(
      c.name
    )}</span>
          <span>${c.name}</span>
        </label>
        <input class="add-task-checkbox" type="checkbox" name="person[${i}]" id="person${i}"
          value="${c.name}" ${
      chk ? "checked" : ""
    } onclick="toggleContactSelection('${c.name}')">
      </li>
    `;
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
 * Displays assigned contact avatars.
 * @returns {void}
 */
function addTaskShowAvatars() {
  const container = document.getElementById("add-task-assigned-avatar");
  if (!container) return;
  container.innerHTML = "";
  window.assignedContacts.forEach((c) => {
    const col = assignColor(c);
    container.innerHTML += `<div class="avatar" style="background:${col}">${getUserInitials(
      c
    )}</div>`;
  });
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
    if (i === param) {
      let li = document.createElement("li");
      li.className = "add-task-subtask-li-edit";
      let input = document.createElement("input");
      input.className = "add-task-subtasks-input-edit";
      input.id = "add-task-subtasks-input-edit";
      input.setAttribute("onkeypress", `confirmTaskSubtasksList(${i}, event)`);
      input.type = "text";
      let div = document.createElement("div");
      div.className = "add-task-subtasks-icons-edit";
      let trash = document.createElement("img");
      trash.className = "add-task-trash";
      trash.src = "/assets/icons/add-subtask-delete.svg";
      trash.setAttribute(
        "onclick",
        `removeFromAddTaskSubtasksList(${i}, event)`
      );
      let border = document.createElement("div");
      border.className = "add-tasks-border";
      let confirm = document.createElement("img");
      confirm.className = "add-task-confirm";
      confirm.src = "/assets/icons/done_inverted.svg";
      confirm.setAttribute("onclick", `confirmTaskSubtasksList(${i}, event)`);
      div.appendChild(trash);
      div.appendChild(border);
      div.appendChild(confirm);
      let inputDiv = document.createElement("div");
      inputDiv.className = "add-task-subtasks-input-edit-div";
      inputDiv.appendChild(input);
      inputDiv.appendChild(div);
      li.appendChild(inputDiv);
      ul.appendChild(li);
      input.value = window.subtasksList[i];
    } else {
      let li = document.createElement("li");
      let span = document.createElement("span");
      span.className = "add-task-subtasks-extra-task";
      span.id = "add-task-subtasks-extra-task";
      span.textContent = window.subtasksList[i];
      let div = document.createElement("div");
      div.className = "add-task-subtasks-icons";
      let edit = document.createElement("img");
      edit.className = "add-task-edit";
      edit.src = "/assets/icons/add-subtask-edit.svg";
      edit.setAttribute("onclick", `editTaskSubtasksList(${i}, event)`);
      let border = document.createElement("div");
      border.className = "add-tasks-border";
      let trash = document.createElement("img");
      trash.className = "add-task-trash";
      trash.src = "/assets/icons/add-subtask-delete.svg";
      trash.setAttribute(
        "onclick",
        `removeFromAddTaskSubtasksList(${i}, event)`
      );
      div.appendChild(edit);
      div.appendChild(border);
      div.appendChild(trash);
      li.appendChild(span);
      li.appendChild(div);
      ul.appendChild(li);
    }
  }
}
window.editTaskSubtasksList = editTaskSubtasksList;

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
  if (!val) return;
  window.subtasksList.splice(i, 1, val);
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
 * Toggles subtask plus/check icons.
 * @returns {void}
 */
function addTaskSubtasksClicked() {
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.add("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.remove("d-none");
}
window.addTaskSubtasksClicked = addTaskSubtasksClicked;

/**
 * Clears the subtask input.
 * @param {Event} event
 * @returns {void}
 */
function clearSubtasks(event) {
  event.preventDefault();
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  document.getElementById("add-task-subtasks-input").value = "";
}
window.clearSubtasks = clearSubtasks;

/**
 * Resets the add-task form.
 * @returns {void}
 */
function addTaskClearFormularReset() {
  window.globalSubtasks = [];
  window.subtasksList = [];
  document.getElementById("add-task-title-input").value = "";
  document.getElementById("add-task-textarea").value = "";
  addTaskAssignedToUnCheck();
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
 * Returns HTML for a single subtask.
 * @param {string} name
 * @param {number} i
 * @returns {string}
 */
function subTaskTemplate(name, i) {
  return `
    <li>
      <span class="add-task-subtasks-extra-task">${name}</span>
      <div class="add-task-subtasks-icons">
        <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg" onclick="editTaskSubtasksList(${i}, event)">
        <div class="add-tasks-border"></div>
        <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="removeFromAddTaskSubtasksList(${i}, event)">
      </div>
    </li>
  `;
}
window.subTaskTemplate = subTaskTemplate;
