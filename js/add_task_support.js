/********************************
 * Datei: add_task_support.js
 * Enthält deine Hilfsfunktionen (Subtasks etc.)
 ********************************/

// Beispielsweise:
function addTaskMinimumDate() {
  // Get today's date in ISO format (YYYY-MM-DD)
  let today = new Date().toISOString().split("T")[0];
  // Set the minimum date attribute of the input field with id "date"
  document.getElementById("date").setAttribute("min", today);
}

/**
 * Updates the priority toggle buttons based on the provided priority value.
 * @param {string} prio - The priority value ('urgent', 'medium', or 'low').
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

/**
 * Unchecks all checkboxes with the class "add-task-checkbox".
 */
function addTaskAssignedToUnCheck() {
  const checkBoxes = document.querySelectorAll(".add-task-checkbox");
  for (let i = 0; i < checkBoxes.length; i++) {
    if (checkBoxes[i].checked) {
      checkBoxes[i].checked = false;
    }
  }
}

/**
 * Updates the subtasks list in the UI based on the provided index.
 */
function addTaskSubtasksList() {
  const lists = document.getElementById("add-task-subtasks-list");
  lists.innerHTML = "";
  for (let i = 0; i < subtasksList.length; i++) {
    const element = subtasksList[i];
    lists.innerHTML += subTaskTemplate(element, i);
  }
}

/**
 * Removes a subtask from the subtasks list based on the provided index.
 */
function removeFromAddTaskSubtasksList(i, event) {
  event.stopPropagation();
  subtasksList.splice(i, 1);
  globalSubtasks.splice(i, 1);
  addTaskSubtasksList();
}

function editTaskSubtasksList(param, event) {
  event.stopPropagation();
  const ulElement = document.getElementById("add-task-subtasks-list");
  ulElement.innerHTML = "";

  for (let i = 0; i < subtasksList.length; i++) {
    const lists = subtasksList[i];
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
      editIcon.setAttribute("onclick", `editTaskSubtasksList(${i})`);

      iconsDiv.appendChild(editIcon);
      iconsDiv.appendChild(borderDiv);
      iconsDiv.appendChild(trashIcon);

      listItem.appendChild(spanElement);
      listItem.appendChild(iconsDiv);

      ulElement.appendChild(listItem);
    }
  }
}

function confirmTaskSubtasksList(i, event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const subtasks = document.getElementById("add-task-subtasks-input-edit");
  const subtaskValue = subtasks.value.trim();
  if (!subtaskValue) return;
  subtasksList.splice(i, 1, subtaskValue);
  addTaskSubtasksList();
}

function addSubtasksPlus(event) {
  event.preventDefault();
  addTaskSubtasksClicked();
  document.getElementById("add-task-subtasks-input").focus();
  document.getElementById("add-task-subtasks-input").select();
}

function addTaskSubtasksClicked() {
  document
    .getElementById("add-task-subtasks-icon-plus")
    .classList.add("d-none");
  document
    .getElementById("add-task-subtasks-icon-plus-check")
    .classList.remove("d-none");
}

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

function addTaskClearFormularReset() {
  globalSubtasks = [];
  subtasksList = [];
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

function addTaskClearFormular(event) {
  event.preventDefault();
  addTaskClearFormularReset();
}

function showToast(message) {
  const notification = document.getElementById("add_notification");
  if (!notification) return;
  notification.innerHTML = message;
  notification.classList.add("show");
  notification.style.right = "-50px";
  notification.style.bottom = "150px";
  notification.offsetHeight;
  notification.style.transition = "right 0.3s ease-in-out";
  notification.style.right = "150px";
  setTimeout(() => {
    notification.style.transition = "right 0.3s ease-in-out";
    notification.style.right = "-500px";
  }, 3000);
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3300);
}
