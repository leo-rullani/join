function assignColor(name) {
  const firstLetter = name.trim()[0]?.toUpperCase() || "Z";

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

  return colors[firstLetter] || "#999999";
}

/*******************************************
 * Erzeugt das Task-Board-Kärtchen
 *******************************************/
function createTaskTemplate(task) {
  if (!task.id) {
    console.error("Task ID is missing", task);
    return "";
  }

  const { totalSubtasks, completedSubtasks, subtaskHTML } = generateSubtaskHTML(
    task.subtasks,
    true
  );
  const assigneeHTML = generateAssigneeHTML(task.assignees);

  const progress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return generateTaskHTML(task, subtaskHTML, assigneeHTML, progress);
}

function generateTaskHTML(task, subtaskHTML, assigneeHTML, progress) {
  const labelColor = task.category === "Technical Task" ? "#20d7c1" : "#0038ff";
  const priorityIcon = getPriorityIcon(task.priority);

  // Smoother Progress-Bar
  setTimeout(() => {
    const progressBars = document.querySelectorAll(".progress-bar-fill");
    progressBars.forEach((bar) => {
      bar.style.transition = "width 0.5s ease-in-out";
    });
  }, 10);

  return `
    <div class="task" onclick="console.log('${task.id}'); openBoardOverlay('${
    task.id
  }')" id="${task.id}">
      <div class="task-label" style="background-color: ${labelColor};">
        ${task.category || "Uncategorized"}
      </div>
      <h3 class="task-title">${task.title || "No Title"}</h3>
      <p class="task-description">${task.description || ""}</p>
      ${subtaskHTML}
      <div class="task-footer">
        <div class="task-assignees">${assigneeHTML}</div>
        <div class="task-priority-icon">
          <img src="${priorityIcon}" alt="${task.priority}" />
        </div>
      </div>
    </div>
  `;
}

function getPriorityIcon(priority) {
  const priorityLower = String(priority || "").toLowerCase();
  switch (priorityLower) {
    case "urgent":
      return "/assets/icons/urgent.svg";
    case "medium":
      return "/assets/icons/medium.svg";
    default:
      return "/assets/icons/low.svg";
  }
}

function generateSubtaskHTML(subtasks, isCreateTaskTemplate = false) {
  if (!Array.isArray(subtasks) || subtasks.length === 0) {
    return { totalSubtasks: 0, completedSubtasks: 0, subtaskHTML: "" };
  }

  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((s) => s.done).length;
  const progressPercent = Math.round((completedSubtasks / totalSubtasks) * 100);

  if (isCreateTaskTemplate) {
    return {
      totalSubtasks,
      completedSubtasks,
      subtaskHTML: `
        <div class="progress-container" 
     style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
  <!-- Progress-Bar-Hintergrund, begrenzt auf 60% Breite -->
  <div class="progress-bar-bg" 
       style="background-color: #ddd; width: 58%; border-radius: 10px; height: 10px;">
    <div class="progress-bar-fill"
         style="width: ${progressPercent}%; background-color: #4689ff; border-radius: 10px; height: 100%;">
    </div>
  </div>

  <!-- Subtask-Info rechts daneben -->
  <div class="subtask-info" 
       style="font-size: 12px; margin-left: 10px;">
    ${completedSubtasks}/${totalSubtasks} Subtasks
  </div>
</div>

      `,
    };
  }

  let subtaskHTML = "";
  subtasks.forEach((subtask) => {
    subtaskHTML += `
      <div class="subtask">
        <label for="subtask_${subtask.name}">${subtask.name}</label>
      </div>
    `;
  });

  return { totalSubtasks, completedSubtasks, subtaskHTML };
}

function generateBoardOverlaySubtaskHTML(task) {
  if (!task || !Array.isArray(task.subtasks)) {
    return "";
  }

  return task.subtasks
    .map((subtask, index) => {
      return `
        <div class="subtask-item-overlay">
          <input type="checkbox" 
                 id="subtask-${task.id}-${index}"
                 ${subtask.done ? "checked" : ""}
                 onchange="updateSubtaskStatus(${index}, '${
        task.id
      }', this.checked)">
          <label for="subtask-${task.id}-${index}" class="text-subtask">
            ${subtask.name}
          </label>
        </div>
      `;
    })
    .join("");
}

function reload() {
  location.reload();
}

function updateProgressBar(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.done).length;
  const progressPercent = (completedSubtasks / totalSubtasks) * 100;

  const progressBar = document.querySelector(`#${taskId} .progress-bar-fill`);
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }
  const subtaskInfo = document.querySelector(`#${taskId} .subtask-info`);
  if (subtaskInfo) {
    subtaskInfo.textContent = `${completedSubtasks}/${totalSubtasks} Subtasks`;
  }
}

function renderTaskWithSubtasks(task) {
  const { subtaskHTML } = generateSubtaskHTML(task.subtasks);
  return `
    <div class="task" onclick="console.log('${task.id}'); openBoardOverlay('${task.id}')" id="${task.id}">
      <h3 class="task-title">${task.title}</h3>
      <div class="task-description">${task.description}</div>
      ${subtaskHTML}
    </div>
  `;
}

function renderAnotherTemplateWithSubtasks(task) {
  const { subtaskHTML } = generateSubtaskHTML(task.subtasks);
  return `
    <div class="task-card" id="${task.id}">
      <h2>${task.title}</h2>
      <div class="task-details">${task.description}</div>
      ${subtaskHTML}
    </div>
  `;
}

function updateSubtaskStatus(index, taskId, checked) {
  const task = tasks.find((t) => t.id === taskId);
  if (task && task.subtasks[index]) {
    task.subtasks[index].done = checked;
    updateProgressBar(taskId);
    updateSubtaskInFirebase(taskId, index, checked);
  }
}

function updateSubtaskInFirebase(taskId, index, checked) {
  const databaseURL =
    "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

  const updatedSubtaskData = { [`subtasks/${index}/done`]: checked };

  return fetch(`${databaseURL}/tasks/${taskId}.json`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedSubtaskData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Subtask-Status erfolgreich aktualisiert:", data);
    })
    .catch((error) => {
      console.error("Fehler beim Speichern der Subtask-Status:", error);
    });
}

function generateAssigneeHTML(assignees) {
  if (typeof assignees === "object" && !Array.isArray(assignees)) {
    assignees = Object.values(assignees);
  }

  if (!Array.isArray(assignees) || assignees.length === 0) {
    return "<div>No assignees</div>";
  }

  return assignees
    .map((name) => {
      const initials = getInitials(name);
      const bgColor = assignColor(name);
      return `
        <div class="avatar-circle" style="background-color: ${bgColor};">
          ${initials}
        </div>
      `;
    })
    .join("");
}

function getInitials(fullName) {
  let parts = fullName.trim().split(" ");
  let first = parts[0]?.[0]?.toUpperCase() || "";
  let last = parts[1]?.[0]?.toUpperCase() || "";
  return first + last;
}

function addTaskCreateTaskConfirmation() {
  showToast(`<img src="./assets/icons/board.svg"/> Task added to board`);
  setTimeout(() => {
    window.location.href = "board.html";
  }, 2000);
}

function addTaskShowAvatarsHTML(bgColor, contact) {
  return `
    <div class="avatar" style="background-color: ${bgColor};">
      ${getUserInitials(contact)}
    </div>
  `;
}

function addTaskAssignedToHtml(i, bgColor, contact) {
  return `
    <li>
      <label for="person${i}">
        <span class="avatar" style="background-color: ${bgColor};">
          ${getUserInitials(contact)}
        </span>
        <span>${contact}</span>
      </label>
      <input class="add-task-checkbox" type="checkbox" name="person[${i}]" id="person${i}" value="${contact}" onclick="addTaskAssignedTo()">
    </li>
  `;
}

function addTaskAssignedToSearchHTML(i, bgColor, contact, assigned) {
  return `
    <li>
      <label for="person${i}">
        <span class="avatar" style="background-color: ${bgColor};">
          ${getUserInitials(contact)}
        </span>
        <span>${contact}</span>
      </label>
      <input class="add-task-checkbox" type="checkbox" name="person[${i}]" id="person${i}" value="${contact}" ${
    assigned ? "checked" : ""
  } onclick="addTaskAssignedTo()">
    </li>
  `;
}

function subTaskTemplate(element, i) {
  return `   
    <li>
      <span class="add-task-subtasks-extra-task" id="add-task-subtasks-extra-task">${element}</span>
      <div class="add-task-subtasks-icons">
        <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg" onclick="editTaskSubtasksList(${i}, event)" >
        <div class="add-tasks-border"></div>
        <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="removeFromAddTaskSubtasksList(${i}, event)">
      </div>
    </li>
  `;
}

/*******************************************
 * Overlay-Template-Funktion
 *******************************************/
function taskBoardTemplate(task) {
  const assigneeHTML = generateOverlayAssigneeHTML(task.assignees);
  const subtaskHTML = generateBoardOverlaySubtaskHTML(task);

  const labelColor = task.category === "Technical Task" ? "#20d7c1" : "#0038ff";
  const priorityIcon = getPriorityIcon(task.priority);

  return `     
    <div class="board_overlay_content">
      <!-- Schließen-Button -->
      <button class="board_overlay_close" onclick="closeBoardOverlay()">&times;</button>

      <!-- Label (technical/user story) -->
      <div id="taskLabel" class="task-label" style="background-color: ${labelColor};">
        ${task.category}
      </div>

      <!-- Titel & Untertitel -->
      <h2 id="taskTitle" class="h2_board-overlay">${task.title}</h2>
      <p id="taskSubtitle" class="text-regular">${task.description}</p>

      <!-- Due Date -->
      <div class="overlay-section">
        <span class="section-label text-label">Due Date:</span>
        <span id="dueDate" class="board_duedate text-regular">${task.date}</span>
      </div>

      <!-- Priority -->
      <div class="overlay-section">
        <span class="section-label text-label">Priority:</span>
        <span id="priorityLabel" class="board_priority text-regular">
          ${task.priority}
          <img class="prio-icon-boardoverlay" src="${priorityIcon}" alt="${task.priority}" />
        </span>
      </div>

      <!-- Assigned To -->
      <div class="overlay-section">
        <span class="section-label text-label">Assigned to:</span>
        <div class="assignees-column-overlay">
          ${assigneeHTML}
        </div>
      </div>

      <!-- Subtasks -->
      <div class="subtasks">
        <p class="section-label text-label">Subtasks:</p>
        <!-- Subtask List with Checkboxes -->
        <!-- Jetzt direkt subtaskHTML, KEIN einzelnes <div> mehr -->
        ${subtaskHTML}
      </div>

      <!-- Footer mit Icons -->
      <div class="task-footer">
        <!-- Buttons mit Task-ID -->
        <button class="board-btn-delete" onclick="deleteTask('${task.id}');">
          <img src="/assets/icons/board-btn-delete.svg" alt="Delete"> Delete
        </button>
        <button class="board-btn-edit" onclick="editTask('${task.id}');">
          <img src="/assets/icons/board-btn-edit.svg" alt="Edit"> Edit
        </button>
      </div>
    </div>
  `;
}

function generateOverlayAssigneeHTML(assignees) {
  if (typeof assignees === "object" && !Array.isArray(assignees)) {
    assignees = Object.values(assignees);
  }

  if (!Array.isArray(assignees) || assignees.length === 0) {
    return "<div>No assignees</div>";
  }

  return assignees
    .map((name) => {
      const initials = getInitials(name);
      // nutze dictionary-Farben
      const bgColor = assignColor(name);
      return `
        <div class="assignee-overlay">
          <div class="assignee-circle-overlay" style="background-color:${bgColor};">
            ${initials}
          </div>
          <span class="assignee-name-overlay">${name}</span>
        </div>
      `;
    })
    .join("");
}

function deleteTaskInFirebase(taskId) {
  const databaseURL =
    "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";
  return fetch(`${databaseURL}/tasks/${taskId}.json`, {
    method: "DELETE",
  })
    .then(() => console.log("Task in Firebase gelöscht"))
    .catch((error) => console.error("Fehler beim Löschen in Firebase", error));
}

function editTask(taskId) {
  console.log("Edit Task:", taskId);
  closeBoardOverlay();
}
