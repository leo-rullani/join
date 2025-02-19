/**
 * Creates a new task from the overlay form and saves it to Firebase.
 * @async
 * @returns {Promise<void>}
 */
async function overlayAddTaskCreateTask() {
  const taskId = "task_" + Date.now();
  const title = document
    .getElementById("overlay-add-task-title-input")
    .value.trim();
  const description = document
    .getElementById("overlay-add-task-textarea")
    .value.trim();
  const names = window.overlayAssignedContacts.slice();
  const date = document.getElementById("overlay-date").value;
  const priority = overlayGetPriority();
  const category = document
    .getElementById("overlay-add-task-category")
    .value.trim();

  const newTask = {
    id: taskId,
    title,
    description,
    assignees: names,
    date,
    priority,
    category,
    boardCategory: "todo",
    subtasks: window.overlaySubtasksList.map((st) => ({
      name: st,
      done: false,
    })),
  };

  const taskRef = `${window.databaseURL}/tasks/${taskId}.json`;
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
window.overlayAddTaskCreateTask = overlayAddTaskCreateTask;

/**
 * Clears the overlay form fields.
 */
function overlayClearForm() {
  document.getElementById("overlay-add-task-title-input").value = "";
  document.getElementById("overlay-add-task-textarea").value = "";
  document.getElementById("overlay-date").value = "";
  document.getElementById("overlay-add-task-category").value = "";
  document.getElementById("overlay-add-task-assigned-avatar").innerHTML = "";
  window.overlayAssignedContacts = [];
  document.getElementById("overlay-add-task-subtasks-list").innerHTML = "";
  overlayAddTaskPrioToggleButton(
    "medium",
    "overlay-add-task-urgent-medium-low-buttons"
  );
  const container = document.getElementById("overlay-add-task-contact");
  if (container) container.innerHTML = "";
}
window.overlayClearForm = overlayClearForm;

/**
 * Sets/toggles the priority buttons in the overlay form.
 * @param {string} prio - The priority ('urgent', 'medium', or 'low').
 * @param {string} containerId - The ID of the button container.
 * @param {Event} event - The click event.
 */
function overlayAddTaskPrio(prio, containerId, event) {
  event.preventDefault();
  overlayAddTaskPrioToggleButton(prio, containerId);
}
window.overlayAddTaskPrio = overlayAddTaskPrio;

/**
 * Toggles the priority buttons in the overlay form, updating icons.
 * @param {string} prio - The priority to set.
 * @param {string} containerId - The container ID holding the priority buttons.
 */
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
window.overlayAddTaskPrioToggleButton = overlayAddTaskPrioToggleButton;

/**
 * Retrieves the priority from the overlay form's clicked button.
 * @returns {string} The current priority ('urgent', 'medium', or 'low').
 */
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
window.overlayGetPriority = overlayGetPriority;

/**
 * Chooses a category in the overlay form.
 * @param {string} value - The category value to set.
 */
function overlayAddTaskChoseCategory(value) {
  document.getElementById("overlay-add-task-category").value = value;
}
window.overlayAddTaskChoseCategory = overlayAddTaskChoseCategory;

/**
 * Switches plus/check icons for adding a subtask in overlay form.
 */
function overlayAddTaskSubtasksClicked() {
  document
    .getElementById("overlay-add-task-subtasks-icon-plus")
    .classList.add("d-none");
  document
    .getElementById("overlay-add-task-subtasks-icon-plus-check")
    .classList.remove("d-none");
}
window.overlayAddTaskSubtasksClicked = overlayAddTaskSubtasksClicked;

/**
 * Adds a subtask to the overlay form.
 * @param {Event} event - The keypress or click event.
 */
function overlayAddTaskSubtasks(event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById("overlay-add-task-subtasks-input");
  const val = input.value.trim();
  if (!val) return;
  window.overlaySubtasksList.unshift(val);
  input.value = "";
  document
    .getElementById("overlay-add-task-subtasks-icon-plus")
    .classList.remove("d-none");
  document
    .getElementById("overlay-add-task-subtasks-icon-plus-check")
    .classList.add("d-none");
  overlayAddTaskSubtasksList();
}
window.overlayAddTaskSubtasks = overlayAddTaskSubtasks;

/**
 * Renders the entire subtask list for the overlay form.
 */
function overlayAddTaskSubtasksList() {
  const ul = document.getElementById("overlay-add-task-subtasks-list");
  ul.innerHTML = "";
  for (let i = 0; i < window.overlaySubtasksList.length; i++) {
    const subtask = window.overlaySubtasksList[i];
    ul.innerHTML += overlaySubTaskTemplate(subtask, i);
  }
}
window.overlayAddTaskSubtasksList = overlayAddTaskSubtasksList;

/**
 * Returns the default <li> HTML for a single overlay subtask.
 * @param {string} subtaskName - The subtask name.
 * @param {number} index - The index of the subtask in the array.
 * @returns {string} The HTML string for the subtask.
 */
function overlaySubTaskTemplate(subtaskName, index) {
  return `
    <li>
      <span class="add-task-subtasks-extra-task">${subtaskName}</span>
      <div class="overlay-add-task-subtasks-icons">
        <img class="add-task-edit"
             src="/assets/icons/add-subtask-edit.svg"
             onclick="overlayEditTaskSubtasksList(${index}, event)">
        <div class="add-tasks-border"></div>
        <img class="add-task-trash"
             src="/assets/icons/add-subtask-delete.svg"
             onclick="overlayRemoveOverlaySubtask(${index}, event)">
      </div>
    </li>
  `;
}
window.overlaySubTaskTemplate = overlaySubTaskTemplate;

/**
 * Allows editing a subtask in the overlay form (shows input field).
 * @param {number} index - The index of the subtask to edit.
 * @param {Event} event - The click event.
 */
function overlayEditTaskSubtasksList(index, event) {
  event.stopPropagation();
  const ul = document.getElementById("overlay-add-task-subtasks-list");
  ul.innerHTML = "";

  for (let i = 0; i < window.overlaySubtasksList.length; i++) {
    const subtask = window.overlaySubtasksList[i];
    if (i === index) {
      ul.innerHTML += `
        <li class="add-task-subtask-li-edit">
          <div class="add-task-subtasks-input-edit-div">
            <input class="add-task-subtasks-input-edit"
                   id="overlay-add-task-subtasks-input-edit"
                   type="text"
                   value="${subtask}"
                   onkeypress="overlayConfirmEditSubtask(${i}, event)">
            <div class="add-task-subtasks-icons-edit">
              <img class="add-task-trash"
                   src="/assets/icons/add-subtask-delete.svg"
                   onclick="overlayRemoveOverlaySubtask(${i}, event)">
              <div class="add-tasks-border"></div>
              <img class="add-task-confirm"
                   src="/assets/icons/done_inverted.svg"
                   onclick="overlayConfirmEditSubtask(${i}, event)">
            </div>
          </div>
        </li>
      `;
    } else {
      ul.innerHTML += overlaySubTaskTemplate(subtask, i);
    }
  }
}
window.overlayEditTaskSubtasksList = overlayEditTaskSubtasksList;

/**
 * Confirms an edited subtask in the overlay form.
 * @param {number} index - The index of the subtask being edited.
 * @param {Event} event - The keypress or click event.
 */
function overlayConfirmEditSubtask(index, event) {
  if (event.type === "keypress" && event.key !== "Enter") return;
  event.preventDefault();
  const input = document.getElementById("overlay-add-task-subtasks-input-edit");
  const newVal = input.value.trim();
  if (!newVal) return;
  window.overlaySubtasksList[index] = newVal;
  overlayAddTaskSubtasksList();
}
window.overlayConfirmEditSubtask = overlayConfirmEditSubtask;

/**
 * Removes a subtask by index from the overlaySubtasksList array.
 * @param {number} index - The index of the subtask to remove.
 * @param {Event} event - The click event.
 */
function overlayRemoveOverlaySubtask(index, event) {
  event.stopPropagation();
  window.overlaySubtasksList.splice(index, 1);
  overlayAddTaskSubtasksList();
}
window.overlayRemoveOverlaySubtask = overlayRemoveOverlaySubtask;

/**
 * Removes a subtask <li> from the overlay form (old method).
 * @param {HTMLElement} el - The element that triggered removal.
 */
function overlayRemoveSubtask(el) {
  const li = el.closest("li");
  if (li) li.remove();
}
window.overlayRemoveSubtask = overlayRemoveSubtask;

/**
 * Handles the click on the plus icon to show subtask input in overlay form.
 * @param {Event} event - The click event.
 */
function overlayAddSubtasksPlus(event) {
  event.preventDefault();
  overlayAddTaskSubtasksClicked();
  const input = document.getElementById("overlay-add-task-subtasks-input");
  if (input) {
    input.focus();
    input.select();
  }
}
window.overlayAddSubtasksPlus = overlayAddSubtasksPlus;

/**
 * Clears the overlay subtask input field and resets icons.
 * @param {Event} event - The click event.
 */
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
window.overlayClearSubtasks = overlayClearSubtasks;

/**
 * Shows the contact list for the overlay form.
 */
function overlayShowContactList() {
  const container = document.getElementById("overlay-add-task-contact");
  if (!container) return;
  container.innerHTML = "";

  window.contactsToAssigned.forEach((contact, i) => {
    const bgColor = assignColor(contact.name);
    const checked = window.overlayAssignedContacts.includes(contact.name);

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
window.overlayShowContactList = overlayShowContactList;

/**
 * Searches contacts for the overlay form and filters the list.
 */
function overlayAddTaskAssignedToSearch() {
  const search = document
    .getElementById("overlay-find-person")
    .value.toLowerCase();
  const container = document.getElementById("overlay-add-task-contact");
  container.innerHTML = "";

  window.contactsToAssigned.forEach((c, i) => {
    const contactName = c.name;
    if (!contactName.toLowerCase().includes(search)) return;
    const bgColor = assignColor(contactName);
    const checked = window.overlayAssignedContacts.includes(contactName);

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
window.overlayAddTaskAssignedToSearch = overlayAddTaskAssignedToSearch;

/**
 * Toggles a contact in the overlayAssignedContacts array.
 * @param {string} contactName - The contact's name to toggle.
 */
function overlayToggleContactSelection(contactName) {
  const idx = window.overlayAssignedContacts.indexOf(contactName);
  if (idx >= 0) {
    window.overlayAssignedContacts.splice(idx, 1);
  } else {
    window.overlayAssignedContacts.push(contactName);
  }
  overlayShowAvatars();
}
window.overlayToggleContactSelection = overlayToggleContactSelection;

/**
 * Displays assigned contact avatars in the overlay form.
 */
function overlayShowAvatars() {
  const avatarDiv = document.getElementById("overlay-add-task-assigned-avatar");
  if (!avatarDiv) return;
  avatarDiv.innerHTML = "";
  window.overlayAssignedContacts.forEach((contact) => {
    const bgColor = assignColor(contact);
    avatarDiv.innerHTML += `
      <div class="avatar" style="background-color:${bgColor};">
        ${getUserInitials(contact)}
      </div>
    `;
  });
}
window.overlayShowAvatars = overlayShowAvatars;
