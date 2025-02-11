"use strict"; // Falls gewünscht, um strengere Fehlerprüfung zu aktivieren

function initBoard() {
  console.log("Board initialized");
  loadTasks();
}

function allowDrop(event) {
  event.preventDefault(); // Verhindert Standardverhalten
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData("text");
  const draggedTask = document.getElementById(data);
  event.target.appendChild(draggedTask);
}

/**
 * Lädt Demo-Tasks.
 */
function loadTasks() {
  const tasks = [
    { id: "task1", text: "Task 1", column: "todo" },
    { id: "task2", text: "Task 2", column: "doing" },
  ];
  tasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.id = task.id;
    taskElement.className = "task";
    taskElement.draggable = true;
    taskElement.ondragstart = drag;
    taskElement.innerText = task.text;
    document
      .getElementById(task.column)
      .querySelector(".task_list")
      .appendChild(taskElement);
  });
}

/**
 * Öffnet ein Prompt, um eine neue Task für die "todo"-Spalte hinzuzufügen.
 */
function openAddTask() {
  const text = prompt("Enter new task");
  if (text === null || text.trim() === "") return;
  createTask(text.trim(), "todo");
}

/**
 * Fügt über Prompt eine neue Task in der angegebenen Spalte (columnId) hinzu.
 */
function addNewTask(columnId) {
  const text = prompt("Enter new task");
  if (text === null || text.trim() === "") return;
  createTask(text.trim(), columnId);
}

/**
 * Erzeugt ein neues Task-Element und hängt es an die jeweilige Spalte an.
 */
function createTask(text, columnId) {
  const newId = "task_" + Date.now();
  const newTask = document.createElement("div");
  newTask.id = newId;
  newTask.className = "task";
  newTask.draggable = true;
  newTask.ondragstart = drag;
  newTask.innerText = text;
  document
    .getElementById(columnId)
    .querySelector(".task_list")
    .appendChild(newTask);
}

/**
 * Suchfunktion: Versteckt Tasks, deren Text nicht zum Suchbegriff passt.
 */
function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  const allTasks = document.querySelectorAll(".task");
  allTasks.forEach((task) => {
    const isVisible = task.innerText.toLowerCase().includes(query);
    task.style.display = isVisible ? "" : "none";
  });
}
