"use strict";
let draggedTaskId = null;
let dragCounter = 0;

/**
 * Initializes the board by loading contacts and displaying tasks.
 * @returns {Promise<void>}
 */
async function initBoard() {
  await loadContacts();
  displayTasks();
}

/**
 * Handles the drag enter event on a container.
 * @param {Event} e - The drag event.
 */
function dragEnter(e) {
  e.preventDefault();
  dragCounter++;
  if (dragCounter === 1) {
    e.currentTarget.classList.add("drag-over");
  }
}

/**
 * Handles the drag leave event on a container.
 * @param {Event} e - The drag event.
 */
function dragLeave(e) {
  e.preventDefault();
  dragCounter--;
  if (dragCounter === 0) {
    e.currentTarget.classList.remove("drag-over");
  }
}

/**
 * Finds the task list container element starting from the given element.
 * @param {HTMLElement} element - The starting element.
 * @returns {HTMLElement|null} The task list container element, or null if not found.
 */
function getTaskListContainer(element) {
  while (element && !element.classList?.contains("task_list")) {
    element = element.parentElement;
  }
  return element;
}

/**
 * Allows dropping by preventing default behavior and handling scrolling.
 * @param {Event} e - The drag event.
 */
function allowDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  scrollContainer(e);
}

/**
 * Scrolls the tasks container based on the mouse position during a drag event.
 * @param {Event} e - The drag event.
 */
function scrollContainer(e) {
  const container = document.getElementById("tasks-container");
  const rect = container.getBoundingClientRect();
  if (e.clientY < rect.top + 50) {
    container.scrollTop -= 10;
  } else if (e.clientY > rect.bottom - 50) {
    container.scrollTop += 10;
  }
}

/**
 * Initiates the drag operation for a task element.
 * @param {Event} e - The drag event.
 */
function drag(e) {
  e.dataTransfer.setData("text", e.target.id);
  e.target.classList.add("dragging");
}

/**
 * Ends the drag operation for a task element.
 * @param {Event} e - The drag event.
 */
function dragEnd(e) {
  e.target.classList.remove("dragging");
}

/**
 * Processes the drop event by inserting the dragged task into its new position.
 * @param {Event} e - The drop event.
 */
function drop(e) {
  e.preventDefault();
  const container = getTaskListContainer(e.target);
  if (!container) return;
  container.classList.remove("drag-over");
  const data = e.dataTransfer.getData("text");
  const dragged = document.getElementById(data);
  const position = calculateDropPosition(e, container);
  insertAt(container, dragged, position);
  const newBoardCategory = container.parentElement.id;
  updateTaskBoardCategory(dragged.id, newBoardCategory);
  dragCounter = 0;
  e.currentTarget.classList.remove("drag-over");
}

/**
 * Calculates the index position for dropping a task within the target container.
 * @param {Event} e - The drop event.
 * @param {HTMLElement} target - The target container element.
 * @returns {number} The index position to insert the dragged task.
 */
function calculateDropPosition(e, target) {
  const rect = target.getBoundingClientRect();
  const offsetY = e.clientY - rect.top;
  const children = target.children;
  let position = 0;
  for (let i = 0; i < children.length; i++) {
    const childRect = children[i].getBoundingClientRect();
    if (offsetY < childRect.top - rect.top) {
      break;
    }
    position++;
  }
  return position;
}

/**
 * Updates the board category of a task in the database.
 * @param {string} taskId - The ID of the task.
 * @param {string} newBoardCategory - The new board category.
 * @returns {Promise<void>}
 */
async function updateTaskBoardCategory(taskId, newBoardCategory) {
  const taskRef = `${databaseURL}/tasks/${taskId}.json`;
  const response = await fetch(taskRef, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ boardCategory: newBoardCategory }),
  });
  if (!response.ok) {
    console.error("Error updating boardCategory");
  }
}

/**
 * Inserts the dragged task element into the target container at the specified position.
 * @param {HTMLElement} target - The target container element.
 * @param {HTMLElement} dragged - The dragged task element.
 * @param {number} position - The index position at which to insert the element.
 */
function insertAt(target, dragged, position) {
  const children = target.children;
  if (position >= children.length) {
    target.appendChild(dragged);
  } else {
    target.insertBefore(dragged, children[position]);
  }
}

/**
 * Filters tasks based on the search query.
 * @param {Event} e - The input event.
 */
function handleSearch(e) {
  const q = e.target.value.toLowerCase();
  const all = document.querySelectorAll(".task");
  all.forEach((task) => {
    const txt = task.innerText.toLowerCase();
    task.style.display = txt.includes(q) ? "" : "none";
  });
}

let currentTaskId = null;

/**
 * Opens the mobile menu for a specific task.
 * @param {string} taskId - The ID of the task.
 */
function openMobileMenu(taskId) {
  currentTaskId = taskId;
  document.getElementById("mobile-drag-menu").style.display = "block";
}

/**
 * Closes the mobile menu.
 */
function closeMobileMenu() {
  document.getElementById("mobile-drag-menu").style.display = "none";
  currentTaskId = null;
}
