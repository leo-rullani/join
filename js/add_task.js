let databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

let globalPrio = "medium";
let globalCategory = "";
let globalSubtasks = [];
let subtasksList = [];
let assignedContacts = [];
let contactsToAssigned = [];
let selectedTask = null;

async function initAddTask() {
  await loadContacts();
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
  const valueFromDescription =
    document.getElementById("add-task-textarea").value;
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
  let selectElement = (document.getElementById("add-task-category").value =
    category);
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

  globalSubtasks.unshift(subtaskValue); // Hier wird die Subtask hinzugefügt
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

/**
 * Adds a new task to the list of tasks.
 * Retrieves current tasks, creates a new task object, adds it to the list of tasks,
 * saves the updated tasks, resets the form, and displays a confirmation message.
 */
async function addTaskCreateTask() {
  const taskId = "task_" + Date.now();
  const title = addTaskTitle();
  const description = addTaskDescription();
  const names = addTaskAssignedTo();
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
    boardCategory: "todo", // Standardwert setzen, falls nicht definiert
    subtasks: globalSubtasks.map((subtasks) => ({
      name: subtasks,
      done: false,
    })),
  };

  const taskRef = `${databaseURL}/tasks/${taskId}.json`;

  const response = await fetch(taskRef, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTask),
  });

  if (response.ok) {
    addTaskClearFormularReset();
    addTaskCreateTaskConfirmation();
    console.log("Task erfolgreich gespeichert!");
  } else {
    console.error("Fehler beim Speichern des Tasks");
  }
}

/**
 * Adds global subtasks to a specific task in the allTasks array.
 * @param {number} taskIndex The index of the task in the allTasks array to which subtasks will be added.
 * @param {string[]} subtasks An array containing the names of the subtasks to be added.
 */
function addGlobalSubtasksToTask(taskIndex, subtasks, tasks) {
  // Überprüfen, ob der Task existiert
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
  const createContactsContainer = document.getElementById("add-task-contact");
  createContactsContainer.innerHTML = "";

  contactsToAssigned.forEach((contact, i) => {
    const bgColor = assignColor(contact.name);
    createContactsContainer.innerHTML += addTaskAssignedToHtml(
      i,
      bgColor,
      contact.name
    );
  });
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
    const bgColor = assignColor(contact);

    if (contact.toLowerCase().includes(search)) {
      const assigned = assignedContacts.includes(contact);

      const listItem = document.createElement("li");
      listItem.innerHTML = addTaskAssignedToSearchHTML(
        i,
        bgColor,
        contact,
        assigned
      );
      createContactsContainer.appendChild(listItem);
    }
  }
}

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

async function deleteTask(taskId) {
  const taskRef = `${databaseURL}/tasks/${taskId}.json`;
  console.log("Deleting task at:", taskRef);
  console.log("Deleting task with ID:", taskId);
  const response = await fetch(taskRef, {
    method: "DELETE",
  });

  if (response.ok) {
    console.log("Task deleted!");
    await displayTasks();
    resetOverlay();
  } else {
    const errorDetails = await response.text();
    console.error("Error deleting task:", response.status, errorDetails);
  }
}

async function displayTasks() {
  const tasks = await getTasks();
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
      taskElement.ondragstart = drag;
      taskElement.ondragend = dragEnd;

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
