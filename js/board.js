"use strict";
function initBoard() {
  loadTasks();
}
function allowDrop(e) {
  e.preventDefault();
}
function drag(e) {
  e.dataTransfer.setData("text", e.target.id);
}
function drop(e) {
  e.preventDefault();
  let data = e.dataTransfer.getData("text");
  let dragged = document.getElementById(data);
  if (e.target.classList.contains("task_list")) {
    e.target.appendChild(dragged);
  }
}
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
    document
      .getElementById(t.column)
      .querySelector(".task_list")
      .appendChild(el);
  });
}
function handleSearch(e) {
  let q = e.target.value.toLowerCase();
  let all = document.querySelectorAll(".task");
  all.forEach((task) => {
    task.style.display = task.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}
function openAddTask() {
  document.getElementById("addTaskOverlay").classList.add("active");
}
function closeAddTaskOverlay() {
  document.getElementById("addTaskOverlay").classList.remove("active");
}
function saveNewTask() {
  let val = document.getElementById("newTaskInput").value.trim();
  if (!val) return;
  let el = document.createElement("div");
  el.id = "task_" + Date.now();
  el.className = "task";
  el.draggable = true;
  el.ondragstart = drag;
  el.innerText = val;
  document.getElementById("todo").querySelector(".task_list").appendChild(el);
  document.getElementById("newTaskInput").value = "";
  closeAddTaskOverlay();
}
function addNewTask(col) {
  document.getElementById("addTaskOverlay").classList.add("active");
  document.getElementById("saveTaskBtnColumn").value = col;
}
