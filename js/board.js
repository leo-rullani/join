"use strict";
let draggedTaskId = null;

/**
 * Wird beim Laden des Bodys (onload="initBoard()") aufgerufen.
 * Lädt initial Beispiel-Tasks und konfiguriert Drag & Drop.
 */
function initBoard() {
  displayTasks();
}

/**
 * Erlaubt Drag & Drop (hier: das Ablegen)
 */
function allowDrop(e) {
  e.preventDefault();

  const container = document.getElementById("tasks-container");
  const containerRect = container.getBoundingClientRect();

  if (e.clientY < containerRect.top + 50) {
    container.scrollTop -= 10;
  } else if (e.clientY > containerRect.bottom - 50) {
    container.scrollTop += 10;
  }
}
/**
 * Startet den Drag-Vorgang
 */
// Mouse-Events
function drag(e) {
  e.dataTransfer.setData("text", e.target.id);
  e.target.classList.add("dragging");
}

function dragEnd(e) {
  e.target.classList.remove("dragging");
}
/**
 * Verarbeitet den Drop-Vorgang
 */
function drop(e) {
  e.preventDefault();
  let data = e.dataTransfer.getData("text");
  let dragged = document.getElementById(data);

  if (e.target.classList.contains("task_list")) {
    e.target.appendChild(dragged);
  } else {
    console.log("Invalid drop target:", e.target);
  }
}

let draggedElement = null;

document.querySelectorAll(".task_list").forEach((container) => {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  container.addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggedElement) {
      container.appendChild(draggedElement);
      draggedElement.classList.remove("dragging");
      draggedElement = null;
    }
  });
});

document.querySelectorAll(".task").forEach((task) => {
  task.addEventListener("dragstart", (e) => {
    draggedElement = task;
    draggedElement.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  task.addEventListener("dragend", () => {
    draggedElement.classList.remove("dragging");
    draggedElement = null;
  });
});
/**
 * Suchfunktion für Tasks
 */
function handleSearch(e) {
  let q = e.target.value.toLowerCase();
  let all = document.querySelectorAll(".task");
  all.forEach((task) => {
    let txt = task.innerText.toLowerCase();
    task.style.display = txt.includes(q) ? "" : "none";
  });
}

/**
 * Öffnet das "Add Task"-Overlay (alte Logik mit .active-Klasse)
 */
function openAddTask() {
  document.getElementById("addTaskOverlay").classList.add("active");
}

/**
 * Schließt das "Add Task"-Overlay
 */
function closeAddTaskOverlay() {
  document.getElementById("addTaskOverlay").classList.remove("active");
}

/**
 * Speichert neuen Task und legt ihn in "To Do" an
 */
function saveNewTask() {
  let val = document.getElementById("newTaskInput").value.trim();
  if (!val) return;

  let el = document.createElement("div");
  el.id = "task_" + Date.now();
  el.className = "task";
  el.draggable = true;
  el.ondragstart = drag;
  el.innerText = val;
  el.onclick = () => openBoardOverlay(el.id);

  document.getElementById("todo").querySelector(".task_list").appendChild(el);

  document.getElementById("newTaskInput").value = "";
  closeAddTaskOverlay();
}
/**
 * Öffnet das Board-Overlay (animiert von rechts in die Mitte)
 */
function openBoardOverlay(taskId) {
  console.log("Opening overlay for Task ID:", taskId);
  console.log("Available tasks:", tasks);

  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error("Task not found!");
    return;
  }

  selectedTask = task;
  const overlay = document.getElementById("boardOverlay");
  overlay.innerHTML = taskBoardTemplate(task);
  overlay.classList.add("board_overlay_show");
  overlay.style.display = "flex";

  overlay.querySelector(".board_overlay_content").style.animationName =
    "slideInFromRight";
}
function closeBoardOverlay() {
  const overlay = document.getElementById("boardOverlay");
  const content = overlay.querySelector(".board_overlay_content");

  content.style.animationName = "slideOutToRight";

  content.addEventListener(
    "animationend",
    function handler() {
      overlay.classList.remove("board_overlay_show");
      overlay.style.display = "none";
      content.removeEventListener("animationend", handler);
    },
    { once: true }
  );
}

function resetOverlay() {
  const overlay = document.getElementById("boardOverlay");

  overlay.classList.remove("board_overlay_show");
  overlay.style.display = "none";
  overlay.style.pointerEvents = "none";
}

/**
 * Add New Task: Öffnet das AddTask-Overlay und merkt sich die gewählte Spalte
 */
function addNewTask(col) {
  document.getElementById("addTaskOverlay").classList.add("active");
  document.getElementById("saveTaskBtnColumn").value = col;
}

/** */
