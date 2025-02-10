/**
 * Adds minimum date attribute to an input field with id "date",
 * setting it to today's date.
 */
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
    // Select all checkboxes with the class "add-task-checkbox"
    const checkBoxes = document.querySelectorAll(".add-task-checkbox");

    // Loop through each checkbox
    for (let i = 0; i < checkBoxes.length; i++) {
        // If the checkbox is checked, uncheck it
        if (checkBoxes[i].checked) {
            checkBoxes[i].checked = false;
        }
    }
}

/**
 * Updates the subtasks list in the UI based on the provided index.
 * @param {number} i - Index indicating the position of the subtask in the list.
 */
function addTaskSubtasksList() {
    const lists = document.getElementById("add-task-subtasks-list");
    lists.innerHTML = "";
    for (let i = 0; i < subtasksList.length; i++) {
        const element = subtasksList[i];
        lists.innerHTML += `   
                     <li>
                   <span class="add-task-subtasks-extra-task" id="add-task-subtasks-extra-task">${element}</span> 
                   <div class="add-task-subtasks-icons">
                      <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg"  onclick="editTaskSubtasksList(${i}, event)" >
                       <div class="add-tasks-border"></div>
                      <img  class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="removeFromAddTaskSubtasksList(${i}, event)">
                   </div>
                 </li>
                   `;
    }
}

/**
 * Removes a subtask from the subtasks list based on the provided index.
 * @param {number} i - Index indicating the position of the subtask to be removed.
 */
function removeFromAddTaskSubtasksList(i, event) {
    event.stopPropagation()
    subtasksList.splice(i, 1);
    globalSubtasks.splice(i, 1);
    addTaskSubtasksList();
}

function editTaskSubtasksList(param, event) {
    event.stopPropagation()
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
            inputElement.setAttribute("onkeypress", `confirmTaskSubtasksList(${i}, event)`);

            inputElement.setAttribute("type", "text");

            let iconsDiv = document.createElement("div");
            iconsDiv.className = "add-task-subtasks-icons-edit";

            let trashIcon = document.createElement("img");
            trashIcon.className = "add-task-trash";
            trashIcon.src = "/assets/icons/add-subtask-delete.svg";
            trashIcon.setAttribute("onclick", `removeFromAddTaskSubtasksList(${i}, event)`);

            let borderDiv = document.createElement("div");
            borderDiv.className = "add-tasks-border";

            let confirmIcon = document.createElement("img");
            confirmIcon.className = "add-task-confirm";
            confirmIcon.src = "/assets/icons/add_task_check.svg";
            confirmIcon.setAttribute("onclick", `confirmTaskSubtasksList(${i}, event)`);

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
            trashIcon.setAttribute("onclick", `removeFromAddTaskSubtasksList(${i}, event)`);

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

            let ulElement = document.getElementById("add-task-subtasks-list"); // Replace 'your-ul-element-id' with the actual ID of your UL element

            ulElement.appendChild(listItem);
        }
    }
}

/**
 * Updates the subtasks list when a subtask is confirmed or edited.
 * @param {*} i - Index of the subtask to be updated in the list.
 * @param {*} event - Event triggered by the user action (keypress or other).
 * @returns void
 */
function confirmTaskSubtasksList(i, event) {
    if (event.type === "keypress" && event.key !== "Enter") return;

    event.preventDefault()
    const subtasks = document.getElementById("add-task-subtasks-input-edit");
    const subtaskValue = subtasks.value.trim();

    if (!subtaskValue) return;

    subtasksList.splice(i, 1, subtaskValue);
    addTaskSubtasksList();
}

/**
 * Function to handle adding subtasks to a task plus functionality.
 *
 * @param {*} event - prevent default
 */
function addSubtasksPlus(event) {
    event.preventDefault();
    addTaskSubtasksClicked();
    document.getElementById("add-task-subtasks-input").focus();
    document.getElementById("add-task-subtasks-input").select();
}

/**
 * Handles the click event when adding subtasks to a task.
 * Hides the "plus" icon and displays the "check" icon to indicate confirmation.
 */
function addTaskSubtasksClicked() {
    document.getElementById("add-task-subtasks-icon-plus").classList.add("d-none");
    document.getElementById("add-task-subtasks-icon-plus-check").classList.remove("d-none");
}

/**
 * Clears subtasks input field and resets icons to initial state.
 * @param {*} event - The event object triggered by the user action.
 */
function clearSubtasks(event) {
    event.preventDefault();
    document.getElementById("add-task-subtasks-icon-plus").classList.remove("d-none");
    document.getElementById("add-task-subtasks-icon-plus-check").classList.add("d-none");
    document.getElementById("add-task-subtasks-input").value = "";
}

/**
 * Resets the form used for adding a task to its initial state.
 */
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
    document.getElementById("add-task-subtasks-icon-plus").classList.remove("d-none");
    document.getElementById("add-task-subtasks-icon-plus-check").classList.add("d-none");
    addTaskPrioToggleButton((prio = "medium"), "add-task-urgent-medium-low-buttons");
}

/**
 * Clears the add task form and prevents default form submission behavior.
 * @param {*} event - The event object triggered by the user action.
 */
function addTaskClearFormular(event) {
    event.preventDefault();
    addTaskClearFormularReset();
}

/**
 * Clears the add task form and prevents default form submission behavior.
 * @param {*} event - The event object triggered by the user action.
 */
function addTaskCreateTaskConfirmation() {
    showToast(`<img src="./assets/icons/board.svg"/> Task added to board`);
    setTimeout(() => {
        window.location.href = "board.html";
    }, 2000);
}

function addTaskShowAvatarsHTML(bgColor, contact) {
    return `
    <div class="avatar" style="background-color: ${bgColor};">${getUserInitials(contact)}</div>
    `;
}

function addTaskAssignedToHtml(i, bgColor, contact) {
    return `
      <li>
        <label for="person${i}">
          <span class="avatar" style="background-color: ${bgColor};">${getUserInitials(
        contact
    )}</span>
          <span>${contact}</span>
        </label>
        <input class="add-task-checkbox" type="checkbox" name="person[${i}]" id="person${i}" value="${contact}" onclick="addTaskAssignedTo()">
      </li>
    `;
}

function addTaskAssignedToSearchHTML(i, bgColor, contact, assigned) {
    return `
    <li>
      <label for="person${i}">
        <span class="avatar" style="background-color: ${bgColor};">${getUserInitials(contact)}</span>
        <span>${contact}</span>
      </label>
      <input class="add-task-checkbox" type="checkbox" name="person[${i}]" id="person${i}" value="${contact}" ${assigned ? "checked" : ""
        } onclick="addTaskAssignedTo()">
    </li>
  `;
}