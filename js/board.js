"use strict";
let draggedTaskId = null;

/**
 * Wird beim Laden des Bodys (onload="initBoard()") aufgerufen.
 * Lädt initial Beispiel-Tasks und konfiguriert Drag & Drop.
 */
async function initBoard() {
  await loadContacts();
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
  const target = e.target;

  if (target.classList.contains("task_list")) {
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
    insertAt(target, dragged, position);
    const newBoardCategory = target.parentElement.id;
    updateTaskBoardCategory(dragged.id, newBoardCategory);
  }
}

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
    console.log("Board category erfolgreich aktualisiert:", newBoardCategory);
  } else {
    console.error("Fehler beim Aktualisieren der boardCategory");
  }
}

function insertAt(target, dragged, position) {
  const children = target.children;
  if (position >= children.length) {
    target.appendChild(dragged);
  } else {
    target.insertBefore(dragged, children[position]);
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
