/**
 * Sets the database URL for Firebase.
 * @type {string}
 */
window.databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Global priority (default is 'medium').
 * @type {string}
 */
window.globalPrio = "medium";

/**
 * Global category for tasks.
 * @type {string}
 */
window.globalCategory = "";

/**
 * Global subtasks for the main add-task form.
 * @type {string[]}
 */
window.globalSubtasks = [];

/**
 * Holds the subtasks for the main add-task form (display array).
 * @type {string[]}
 */
window.subtasksList = [];

/**
 * Holds assigned contacts for the main add-task form.
 * @type {string[]}
 */
window.assignedContacts = [];

/**
 * Holds assigned contacts for editing a task.
 * @type {string[]}
 */
window.editAssignedContacts = [];

/**
 * Holds all contacts loaded from Firebase, used to populate assignment lists.
 * @type {Object[]}
 */
window.contactsToAssigned = [];

/**
 * Holds the assigned contacts for the overlay add-task form.
 * @type {string[]}
 */
window.overlayAssignedContacts = [];

/**
 * Holds subtasks in the overlay form.
 * @type {string[]}
 */
window.overlaySubtasksList = [];

/**
 * Holds subtasks in the edit overlay form.
 * @type {string[]}
 */
window.editOverlaySubtasksList = [];

/**
 * Reference to the currently selected task (if any).
 * @type {null|Object}
 */
window.selectedTask = null;

/**
 * Holds the ID of the task being edited.
 * @type {null|string}
 */
window.editingTaskId = null;

/**
 * Indicates whether the user is in editing mode.
 * @type {boolean}
 */
window.editingMode = false;

/**
 * Fetches all tasks from Firebase.
 * @async
 * @returns {Promise<Object[]>} Returns an array of task objects.
 */
function getTasks() {
  const taskRef = `${window.databaseURL}/tasks.json`;
  return fetch(taskRef)
    .then((response) =>
      response.json().then((tasks) => ({ ok: response.ok, tasks }))
    )
    .then(({ ok, tasks }) => {
      if (ok && tasks) {
        if (Object.keys(tasks).length === 0) {
          return [];
        }
        return Object.keys(tasks).map((id) => ({ id, ...tasks[id] }));
      } else {
        console.error("No Tasks Found", tasks);
        return [];
      }
    });
}
window.getTasks = getTasks;

/**
 * Deletes a task from Firebase by its task ID.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<void>} A promise that resolves once deletion is complete.
 */
function deleteTaskInFirebase(taskId) {
  return fetch(`${window.databaseURL}/tasks/${taskId}.json`, {
    method: "DELETE",
  })
    .then(() => console.log("Task in Firebase gelöscht"))
    .catch((error) => console.error("Fehler beim Löschen in Firebase", error));
}
window.deleteTaskInFirebase = deleteTaskInFirebase;

/**
 * Deletes a task locally and on Firebase, then updates the board.
 * @async
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
  window.tasks = window.tasks.filter((task) => task.id !== taskId);
  await deleteTaskInFirebase(taskId);
  const taskEl = document.getElementById(taskId);
  if (taskEl) taskEl.remove();
  closeBoardOverlay();
  displayTasks();
}
window.deleteTask = deleteTask;

/**
 * Displays all tasks on the board by fetching them from Firebase.
 * @async
 * @returns {Promise<void>}
 */
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
window.displayTasks = displayTasks;

/**
 * Loads tasks from Firebase and stores them in window.tasks.
 * @returns {Promise<void>}
 */
function loadTasks() {
  getTasks().then((loadedTasks) => {
    window.tasks = loadedTasks;
    console.log("Tasks gespeichert in window.tasks:", window.tasks);
  });
}
window.loadTasks = loadTasks;
loadTasks();

/**
 * Assigns a color to a user based on their name's first letter.
 * @param {string} name - The contact name.
 * @returns {string} A hex color code.
 */
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
window.assignColor = assignColor;

/**
 * Returns the initials of a contact (e.g., "John Doe" -> "JD").
 * @param {string} contact - The contact's full name.
 * @returns {string} The uppercase initials of the contact.
 */
function getUserInitials(contact) {
  let parts = contact.trim().split(" ");
  let first = parts[0]?.[0]?.toUpperCase() || "";
  let last = parts[1]?.[0]?.toUpperCase() || "";
  return first + last;
}
window.getUserInitials = getUserInitials;

/**
 * Adds new subtasks to a task's subtasks array.
 * @param {number} taskIndex - The index of the task in the array.
 * @param {string[]} subtasks - Array of subtask strings to add.
 * @param {Object[]} tasks - The full tasks array.
 */
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
window.addGlobalSubtasksToTask = addGlobalSubtasksToTask;

/**
 * Shows a toast notification.
 * @param {string} message - The message to display in the toast.
 */
function showToast(message) {
  const notification = document.getElementById("add_notification");
  if (!notification) return;
  notification.innerHTML = message;
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}
window.showToast = showToast;
