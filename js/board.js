"use strict";

/**
 * Wird beim Laden des Bodys (onload="initBoard()") aufgerufen.
 * Lädt initial Beispiel-Tasks und konfiguriert Drag & Drop.
 */
function initBoard() {
  loadTasks();
}

/**
 * Erstellt einige Beispiel-Tasks
 */
function loadTasks() {
  let tasks = [
    { id: "task1", text: "Task 1", column: "todo" },
    { id: "task2", text: "Task 2", column: "doing" },
  ];
  tasks.forEach((t) => {
    let el = document.createElement("div");
    el.id = t.id;
    el.className = "task";
    el.draggable = true;
    el.ondragstart = drag;
    el.innerText = t.text;
    // Klick-Event → Board-Overlay öffnen
    el.onclick = openBoardOverlay;

    // In die jeweilige Spalte einfügen
    document
      .getElementById(t.column)
      .querySelector(".task_list")
      .appendChild(el);
  });
}

/**
 * Erlaubt Drag & Drop (hier: das Ablegen)
 */
function allowDrop(e) {
  e.preventDefault();
}

/**
 * Startet den Drag-Vorgang
 */
function drag(e) {
  e.dataTransfer.setData("text", e.target.id);
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
  }
}

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
  // Klick → Board-Overlay
  el.onclick = openBoardOverlay;

  document.getElementById("todo").querySelector(".task_list").appendChild(el);

  document.getElementById("newTaskInput").value = "";
  closeAddTaskOverlay();
}

/**
 * Öffnet das Board-Overlay (animiert von rechts in die Mitte)
 */
function openBoardOverlay() {
  const overlay = document.getElementById("boardOverlay");
  overlay.classList.add("board_overlay_show");
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
      content.removeEventListener("animationend", handler);
    },
    { once: true }
  );
}

/**
 * Add New Task: Öffnet das AddTask-Overlay und merkt sich die gewählte Spalte
 */
function addNewTask(col) {
  document.getElementById("addTaskOverlay").classList.add("active");
  document.getElementById("saveTaskBtnColumn").value = col;
}

