"use strict";
let draggedTaskId = null;
let dragCounter = 0;
/**
 * Initializes the board on load.
 */
async function initBoard() {
  await loadContacts();
  displayTasks();
}

/**
 * Wird auf dem Container aufgerufen, wenn etwas in ihn gezogen wird.
 */
function dragEnter(e) {
  e.preventDefault();
  dragCounter++;
  if (dragCounter === 1) {
    e.currentTarget.classList.add("drag-over");
  }
}
/**
 * Wird auf dem Container aufgerufen, wenn etwas das Element verlässt.
 */
function dragLeave(e) {
  e.preventDefault();
  dragCounter--;
  if (dragCounter === 0) {
    e.currentTarget.classList.remove("drag-over");
  }
}

function getTaskListContainer(element) {
  while (element && !element.classList?.contains("task_list")) {
    element = element.parentElement;
  }
  return element;
}

/**
 * Allows drag-and-drop functionality.
 * @param {Event} e - The drag event.
 */
function allowDrop(e) {
  e.preventDefault();
  scrollContainer(e);
}

/**
 * Scrolls the tasks container based on mouse position.
 * @param {Event} e - The drag event.
 */
function scrollContainer(e) {
  const container = document.getElementById("tasks-container");
  const containerRect = container.getBoundingClientRect();

  const y = e.clientY;
  if (y < containerRect.top + 50) {
    container.scrollTop -= 10;
  } else if (y > containerRect.bottom - 50) {
    container.scrollTop += 10;
  }
}

/**
 * Starts the drag operation.
 * @param {Event} e - The drag event.
 */
function drag(e) {
  e.dataTransfer.setData("text", e.target.id);
  e.target.classList.add("dragging");
}

/**
 * Ends the drag operation.
 * @param {Event} e - The drag event.
 */
function dragEnd(e) {
  e.target.classList.remove("dragging");
}

/**
 * Processes the drop operation.
 * @param {Event} e - The drop event.
 */
function drop(e) {
  e.preventDefault();
  // Container ermitteln
  const container = getTaskListContainer(e.target);
  if (!container) return;
  // Visuelle Hervorhebung wieder entfernen
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
 * Calculates the drop position in the target container.
 * @param {Event} e - The drop event.
 * @param {HTMLElement} target - The target container.
 * @returns {number} The position index to insert the dragged task.
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
 * Updates the board category of the dragged task.
 * @param {string} taskId - The ID of the task.
 * @param {string} newBoardCategory - The new category for the task.
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

  if (response.ok) {
  } else {
    console.error("Error updating boardCategory");
  }
}

/**
 * Inserts the dragged task at the specified position.
 * @param {HTMLElement} target - The target container.
 * @param {HTMLElement} dragged - The dragged task element.
 * @param {number} position - The position index to insert at.
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
 * Handles the search functionality for tasks.
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

function openMobileMenu(taskId) {
  currentTaskId = taskId;
  document.getElementById("mobile-drag-menu").style.display = "block";
}

function closeMobileMenu() {
  document.getElementById("mobile-drag-menu").style.display = "none";
  currentTaskId = null;
}
