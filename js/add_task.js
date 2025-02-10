let allTasks = [];

let globalPrio = "medium";
let globalCategory = "";
let globalSubtasks = [];
let subtasksList = [];
let assignedContacts = [];
let contactsToAssigned = [];
let globalBoardCategory = "to-do";

async function initAddTask() {
  authGuard();
  await init();
  setNavActive("add-task");
  allTasks = await getTasks();
  contactsToAssigned = await getContacts();
  createAssignedTo();
  getCategoryFromUrl();
}

/**
 * Retrieves the category parameter from the URL query string and assigns it to the globalBoardCategory variable if it exists.
 */
function getCategoryFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("category")) {
    globalBoardCategory = urlParams.get("category");
  }
}

/**
 * This function retrieves the value from the input field with the id 'add-task-title-input'.
 * It then clears the input field and returns the retrieved value.
 * @returns {string} valueFromTitle - The value retrieved from the input field.
 */
function addTaskTitle() {
  const valueFromTitle = document.getElementById("add-task-title-input").value;
  document.getElementById("add-task-title-input").value = "";
  return valueFromTitle;
}

/**
 * This function retrieves the value from the textarea with the id 'add-task-textarea'.
 * It then clears the textarea and returns the retrieved value.
 * @returns {string} valueFromDescription - The value retrieved from the textarea.
 */
function addTaskDescription() {
  const valueFromDescription = document.getElementById("add-task-textarea").value;
  document.getElementById("add-task-textarea").value = "";
  return valueFromDescription;
}

/**
 * Retrieves the list of contacts assigned to a task based on checked checkboxes.
 * Iterates through all checkboxes with the class "add-task-checkbox" and
 * collects the values of the checked ones into an array.
 * After collecting the assigned contacts, it triggers a function to display the avatars
 * of the assigned contacts.
 * @returns {Array} An array containing the values of the checked checkboxes,
 * representing the contacts assigned to the task.
 */
function addTaskAssignedTo() {
  const checkBoxes = document.querySelectorAll(".add-task-checkbox");
  assignedContacts = [];

  for (let i = 0; i < checkBoxes.length; i++) {
    if (checkBoxes[i].checked) {
      const value = checkBoxes[i].value;
      assignedContacts.push(value);
    }
  }
  addTaskShowAvatars();
  return assignedContacts;
}

/**
 * Retrieves the due date of a task from an input field and clears the input field after retrieval.
 * @returns {string} The due date of the task as a string.
 */
function addTaskDueDate() {
  const date = document.getElementById("date").value;
  document.getElementById("date").value = "";
  return date;
}

/**
 * Sets the global priority for tasks and adds a toggle button to the specified element.
 *
 * @param {string} prio The priority value to be set globally.
 * @param {Event} event The event object to prevent default behavior.
 */
function addTaskPrio(prio, container, event) {
  event.preventDefault();
  globalPrio = prio;
  addTaskPrioToggleButton(prio, container);
}

/**
 * Updates the selected task category based on the parameter provided.
 *
 * @param {string} category - The ID of the element containing the selected category text.
 */
function addTaskChoseCategory(category) {
  let selectElement = (document.getElementById("add-task-category").value = category);
  globalCategory = selectElement;
}

/**
 * Handles adding subtasks to the task.
 * @param {*} event - The event object triggered by the user action.
 * @returns void
 */
function addTaskSubtasks(event) {
  if (event.type === "keypress" && event.key !== "Enter") return;

  event.preventDefault();
  const subtasks = document.getElementById("add-task-subtasks-input");
  const subtaskValue = subtasks.value.trim();

  if (!subtaskValue) return;

  globalSubtasks.unshift(subtaskValue);
  subtasksList.unshift(subtaskValue);
  addTaskSubtasksList(); //Create the element from Subtasks input
  document.getElementById("add-task-subtasks-icon-plus").classList.remove("d-none");
  document.getElementById("add-task-subtasks-icon-plus-check").classList.add("d-none");
  subtasks.value = "";
}

/**
 * Adds a new task to the list of tasks.
 * Retrieves current tasks, creates a new task object, adds it to the list of tasks,
 * saves the updated tasks, resets the form, and displays a confirmation message.
 */
async function addTaskCreateTask() {
  let tasks = await getTasks();

  const title = addTaskTitle();
  const description = addTaskDescription();
  const names = addTaskAssignedTo();
  const date = addTaskDueDate();

  const newTask = {
    boardCategory: globalBoardCategory,
    title: title,
    description: description,
    assignees: names,
    date: date,
    priority: globalPrio,
    category: globalCategory,
    subtasks: [],
  };

  tasks.push(newTask);

  addGlobalSubtasksToTask(tasks.length - 1, globalSubtasks, tasks);

  await saveTasks(tasks);
  addTaskClearFormularReset();
  addTaskCreateTaskConfirmation();
}

/**
 * Adds global subtasks to a specific task in the allTasks array.
 * @param {number} taskIndex The index of the task in the allTasks array to which subtasks will be added.
 * @param {string[]} subtasks An array containing the names of the subtasks to be added.
 */
function addGlobalSubtasksToTask(taskIndex, subtasks, tasks) {
  if (subtasks.length > 0) {
    for (let i = 0; i < subtasks.length; i++) {
      const subtaskName = subtasks[i];
      tasks[taskIndex].subtasks.push({ name: subtaskName, completed: false });
    }
  }
}

/**
 * Compares two objects by their 'name' property in a case-insensitive manner.
 * @param {*} a - The first object to compare.
 * @param {*} b - The second object to compare.
 * @returns {number} - Negative if 'a' should appear before 'b', positive if 'a' should appear after 'b', 0 if they are equal.
 */
function compareByName(a, b) {
  let nameA = a.name.toUpperCase();
  let nameB = b.name.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}

contactsToAssigned.sort(compareByName);

/**
 * Creates HTML elements for displaying assigned contacts.
 * Iterates through the list of contacts to be assigned and generates HTML for each contact.
 */
function createAssignedTo() {
  for (let i = 0; i < contactsToAssigned.length; i++) {
    const contact = contactsToAssigned[i].name;
    const createContactsContainer = document.getElementById("add-task-contact");
    const bgColor = assignColor(contact);

    createContactsContainer.innerHTML += addTaskAssignedToHtml(i, bgColor, contact);
  }
}

/**
 * Displays avatars for assigned contacts in the add task form.
 * Retrieves the avatar container element, clears any existing avatars,
 * loops through assigned contacts, determines background color for each contact,
 * and generates HTML elements for displaying avatars.
 */
function addTaskShowAvatars() {
  const avatarContainer = document.getElementById("add-task-assigned-avatar");
  avatarContainer.innerHTML = "";

  for (let i = 0; i < assignedContacts.length; i++) {
    const contact = assignedContacts[i];
    const bgColor = assignColor(contact);
    avatarContainer.innerHTML += addTaskShowAvatarsHTML(bgColor, contact);
  }
}

/**
 * Searches for contacts to assign to a task based on the search input.
 * Retrieves the search input value, clears the container for contacts,
 * loops through available contacts, filters contacts based on the search input,
 * and generates HTML elements for displaying filtered contacts.
 */
function addTaskAssignedToSearch() {
  let search = document.getElementById("find-person").value.toLowerCase();
  const createContactsContainer = document.getElementById("add-task-contact");
  createContactsContainer.innerHTML = "";

  for (let i = 0; i < contactsToAssigned.length; i++) {
    const contact = contactsToAssigned[i].name;
    const bgColor = assignColor(contact); // Assuming assignColor function is defined elsewhere

    if (contact.toLowerCase().includes(search)) {
      const assigned = assignedContacts.includes(contact); // Check if contact is already assigned
      createContactsContainer.innerHTML += addTaskAssignedToSearchHTML(
        i,
        bgColor,
        contact,
        assigned
      );
    }
  }
}