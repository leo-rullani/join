/**
 * Initializes the add-task form on the main HTML page.
 * @async
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
 * Gets the category from URL parameters.
 */
function getCategoryFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("category")) {
    window.globalBoardCategory = urlParams.get("category");
  }
}
window.getCategoryFromUrl = getCategoryFromUrl;

/**
 * Retrieves the task title from the input field and clears it.
 * @returns {string} The entered task title.
 */
function addTaskTitle() {
  const valueFromTitle = document.getElementById("add-task-title-input").value;
  document.getElementById("add-task-title-input").value = "";
  return valueFromTitle;
}
window.addTaskTitle = addTaskTitle;

/**
 * Retrieves the task description from the textarea and clears it.
 * @returns {string} The entered task description.
 */
function addTaskDescription() {
  const valueFromDescription =
    document.getElementById("add-task-textarea").value;
  document.getElementById("add-task-textarea").value = "";
  return valueFromDescription;
}
window.addTaskDescription = addTaskDescription;

/**
 * Retrieves the due date from the input field and clears it.
 * @returns {string} The selected due date.
 */
function addTaskDueDate() {
  const date = document.getElementById("date").value;
  document.getElementById("date").value = "";
  return date;
}
window.addTaskDueDate = addTaskDueDate;

/**
 * Creates a new task object and saves it to Firebase.
 */
function addTaskCreateTask() {
  const taskId = "task_" + Date.now();
  const title = addTaskTitle();
  const description = addTaskDescription();
  const names = window.assignedContacts.slice();
  const date = addTaskDueDate();
  const subtasks = window.globalSubtasks || [];

  const newTask = {
    id: taskId,
    title: title,
    description: description,
    assignees: names,
    date: date,
    priority: window.globalPrio,
    category: window.globalCategory,
    boardCategory: "todo",
    subtasks: subtasks.map((sb) => ({ name: sb, done: false })),
  };

  const taskRef = `${window.databaseURL}/tasks/${taskId}.json`;
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
window.addTaskCreateTask = addTaskCreateTask;

/**
 * Chooses a category for the task.
 * @param {string} category - The category string to set.
 */
function addTaskChoseCategory(category) {
  document.getElementById("add-task-category").value = category;
  window.globalCategory = category;
}
window.addTaskChoseCategory = addTaskChoseCategory;

/**
 * Handles adding a subtask for the main form.
 * @param {Event} event - The keypress or click event.
 */
function addTaskSubtasks(event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const subtasks = document.getElementById("add-task-subtasks-input");
  const subtaskValue = subtasks.value.trim();
  if (!subtaskValue) return;

  window.globalSubtasks.unshift(subtaskValue);
  window.subtasksList.unshift(subtaskValue);
  addTaskSubtasksList();

  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  subtasks.value = "";
}
window.addTaskSubtasks = addTaskSubtasks;

/**
 * Creates the contact list for the main add-task form.
 */
function createAssignedTo() {
  const createContactsContainer = document.getElementById("add-task-contact");
  if (!createContactsContainer) return;

  createContactsContainer.innerHTML = "";
  window.contactsToAssigned.forEach((contact, i) => {
    const bgColor = assignColor(contact.name);
    const checked = window.assignedContacts.includes(contact.name);

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
window.createAssignedTo = createAssignedTo;

/**
 * Searches for contacts in the main add-task form and updates the list.
 */
function addTaskAssignedToSearch() {
  let search = document.getElementById("find-person").value.toLowerCase();
  const container = document.getElementById("add-task-contact");
  container.innerHTML = "";

  window.contactsToAssigned.forEach((c, i) => {
    let contactName = c.name;
    if (!contactName.toLowerCase().includes(search)) {
      return;
    }
    const bgColor = assignColor(contactName);
    const checked = window.assignedContacts.includes(contactName);

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
window.addTaskAssignedToSearch = addTaskAssignedToSearch;

/**
 * Toggles a contact in the assignedContacts array for the main form.
 * @param {string} contactName - The name of the contact.
 */
function toggleContactSelection(contactName) {
  const index = window.assignedContacts.indexOf(contactName);
  if (index >= 0) {
    window.assignedContacts.splice(index, 1);
  } else {
    window.assignedContacts.push(contactName);
  }
  addTaskShowAvatars();
}
window.toggleContactSelection = toggleContactSelection;

/**
 * Displays the avatars for assigned contacts in the main add-task form.
 */
function addTaskShowAvatars() {
  const avatarContainer = document.getElementById("add-task-assigned-avatar");
  if (!avatarContainer) return;

  avatarContainer.innerHTML = "";
  window.assignedContacts.forEach((contact) => {
    const color = assignColor(contact);
    avatarContainer.innerHTML += `
      <div class="avatar" style="background:${color}">
        ${getUserInitials(contact)}
      </div>
    `;
  });
}
window.addTaskShowAvatars = addTaskShowAvatars;

/**
 * Loads contacts from Firebase (contacts.json) and populates the list.
 * @async
 * @returns {Promise<void>}
 */
async function loadContacts() {
  const response = await fetch(`${window.databaseURL}/contacts.json`);
  const data = await response.json();
  window.contactsToAssigned = Object.values(data || {});
  createAssignedTo();
}
window.loadContacts = loadContacts;

/**
 * Sets the minimum date for the date input in the main add-task form.
 */
function addTaskMinimumDate() {
  let today = new Date().toISOString().split("T")[0];
  document.getElementById("date").setAttribute("min", today);
}
window.addTaskMinimumDate = addTaskMinimumDate;

/**
 * Updates the priority toggle buttons based on the provided priority value for the main form.
 * @param {string} prio - The priority value ('urgent', 'medium', or 'low').
 * @param {string} container - The DOM element ID containing the buttons.
 */
function addTaskPrioToggleButton(prio, container) {
  const buttonContainer = document.getElementById(container);
  const buttons = buttonContainer.children;

  for (const button of buttons) {
    if (button.dataset.priority == prio) {
      button.classList.add("add-task-clicked");
      button.children[0].children[1].src = `/assets/icons/${button.dataset.priority}_white.svg`;
    } else {
      button.classList.remove("add-task-clicked");
      button.children[0].children[1].src = `/assets/icons/${button.dataset.priority}.svg`;
    }
  }
}
window.addTaskPrioToggleButton = addTaskPrioToggleButton;

/**
 * Unchecks all checkboxes in the main add-task form.
 */
function addTaskAssignedToUnCheck() {
  const checkBoxes = document.querySelectorAll(".add-task-checkbox");
  for (let i = 0; i < checkBoxes.length; i++) {
    if (checkBoxes[i].checked) {
      checkBoxes[i].checked = false;
    }
  }
}
window.addTaskAssignedToUnCheck = addTaskAssignedToUnCheck;

/**
 * Renders the subtask list in the main add-task form.
 */
function addTaskSubtasksList() {
  const lists = document.getElementById("add-task-subtasks-list");
  lists.innerHTML = "";
  for (let i = 0; i < window.subtasksList.length; i++) {
    const element = window.subtasksList[i];
    lists.innerHTML += subTaskTemplate(element, i);
  }
}
window.addTaskSubtasksList = addTaskSubtasksList;

/**
 * Removes a subtask from the main form by index.
 * @param {number} i - The index of the subtask to remove.
 * @param {Event} event - The click event.
 */
function removeFromAddTaskSubtasksList(i, event) {
  event.stopPropagation();
  window.subtasksList.splice(i, 1);
  window.globalSubtasks.splice(i, 1);
  addTaskSubtasksList();
}
window.removeFromAddTaskSubtasksList = removeFromAddTaskSubtasksList;

/**
 * Edits a subtask in the main form (shows input for editing).
 * @param {number} param - The index of the subtask to edit.
 * @param {Event} event - The click event.
 */
function editTaskSubtasksList(param, event) {
  event.stopPropagation();
  const ulElement = document.getElementById("add-task-subtasks-list");
  ulElement.innerHTML = "";

  for (let i = 0; i < window.subtasksList.length; i++) {
    const lists = window.subtasksList[i];
    if (i === param) {
      let liElement = document.createElement("li");
      liElement.setAttribute("class", "add-task-subtask-li-edit");

      let inputElement = document.createElement("input");
      let inputDiv = document.createElement("div");
      inputDiv.setAttribute("class", "add-task-subtasks-input-edit-div");
      inputElement.setAttribute("class", "add-task-subtasks-input-edit");
      inputElement.setAttribute("id", "add-task-subtasks-input-edit");
      inputElement.setAttribute(
        "onkeypress",
        `confirmTaskSubtasksList(${i}, event)`
      );
      inputElement.setAttribute("type", "text");

      let iconsDiv = document.createElement("div");
      iconsDiv.className = "add-task-subtasks-icons-edit";

      let trashIcon = document.createElement("img");
      trashIcon.className = "add-task-trash";
      trashIcon.src = "/assets/icons/add-subtask-delete.svg";
      trashIcon.setAttribute(
        "onclick",
        `removeFromAddTaskSubtasksList(${i}, event)`
      );

      let borderDiv = document.createElement("div");
      borderDiv.className = "add-tasks-border";

      let confirmIcon = document.createElement("img");
      confirmIcon.className = "add-task-confirm";
      confirmIcon.src = "/assets/icons/done_inverted.svg";
      confirmIcon.setAttribute(
        "onclick",
        `confirmTaskSubtasksList(${i}, event)`
      );

      iconsDiv.appendChild(trashIcon);
      iconsDiv.appendChild(borderDiv);
      iconsDiv.appendChild(confirmIcon);

      inputDiv.appendChild(inputElement);
      inputDiv.appendChild(iconsDiv);
      liElement.appendChild(inputDiv);

      ulElement.appendChild(liElement);

      inputElement.value = lists;
    } else {
      let listItem = document.createElement("li");
      let spanElement = document.createElement("span");
      spanElement.className = "add-task-subtasks-extra-task";
      spanElement.id = "add-task-subtasks-extra-task";
      let textContent = document.createTextNode(lists);
      spanElement.appendChild(textContent);

      let iconsDiv = document.createElement("div");
      iconsDiv.className = "add-task-subtasks-icons";

      let trashIcon = document.createElement("img");
      trashIcon.className = "add-task-trash";
      trashIcon.src = "/assets/icons/add-subtask-delete.svg";
      trashIcon.setAttribute(
        "onclick",
        `removeFromAddTaskSubtasksList(${i}, event)`
      );

      let borderDiv = document.createElement("div");
      borderDiv.className = "add-tasks-border";

      let editIcon = document.createElement("img");
      editIcon.className = "add-task-edit";
      editIcon.src = "/assets/icons/add-subtask-edit.svg";
      editIcon.setAttribute("onclick", `editTaskSubtasksList(${i}, event)`);

      iconsDiv.appendChild(editIcon);
      iconsDiv.appendChild(borderDiv);
      iconsDiv.appendChild(trashIcon);

      listItem.appendChild(spanElement);
      listItem.appendChild(iconsDiv);

      ulElement.appendChild(listItem);
    }
  }
}
window.editTaskSubtasksList = editTaskSubtasksList;

/**
 * Confirms an edited subtask in the main form.
 * @param {number} i - The index of the subtask to confirm.
 * @param {Event} event - The keypress or click event.
 */
function confirmTaskSubtasksList(i, event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const subtasks = document.getElementById("add-task-subtasks-input-edit");
  const subtaskValue = subtasks.value.trim();
  if (!subtaskValue) return;
  window.subtasksList.splice(i, 1, subtaskValue);
  addTaskSubtasksList();
}
window.confirmTaskSubtasksList = confirmTaskSubtasksList;

/**
 * Shows the subtask input (plus icon) in the main form.
 * @param {Event} event - The click event.
 */
function addSubtasksPlus(event) {
  event.preventDefault();
  addTaskSubtasksClicked();
  document.getElementById("add-task-subtasks-input").focus();
  document.getElementById("add-task-subtasks-input").select();
}
window.addSubtasksPlus = addSubtasksPlus;

/**
 * Hides the plus icon and shows the check icon in the main form for subtasks.
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
 * Clears the subtask input in the main form.
 * @param {Event} event - The click event.
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
 * Resets the entire add-task form, clearing all fields and arrays.
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
 * Prevents default form submission and resets the add-task form.
 * @param {Event} event - The click or submit event.
 */
function addTaskClearFormular(event) {
  event.preventDefault();
  addTaskClearFormularReset();
}
window.addTaskClearFormular = addTaskClearFormular;

/**
 * Template for rendering a single subtask in the main form's list.
 * @param {string} name - The subtask name.
 * @param {number} i - The index of the subtask.
 * @returns {string} HTML string for the subtask.
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
