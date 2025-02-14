function assignColor(name) {
  const firstLetter = name.trim()[0]?.toUpperCase() || "Z";

  // Deine Farbzuordnung:
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

function createTaskTemplate(task) {
  if (!task.id) {
    console.error("Task ID is missing", task);
    return "";
  }

  const { totalSubtasks, completedSubtasks, subtaskHTML } = generateSubtaskHTML(
    task.subtasks,
    true // Nur Progressbar anzeigen
  );
  const assigneeHTML = generateAssigneeHTML(task.assignees);

  return generateTaskHTML(task, subtaskHTML, assigneeHTML);
}

function generateTaskHTML(task, subtaskHTML, assigneeHTML) {
  const labelColor = task.category === "Technical Task" ? "#20d7c1" : "#0038ff";
  const priorityIcon = getPriorityIcon(task.priority);

  // Setze die Transition der Progressbar nach dem Laden der Seite
  setTimeout(() => {
    const progressBars = document.querySelectorAll(".progress-bar-fill");
    progressBars.forEach((bar) => {
      bar.style.transition = "width 0.5s ease-in-out";
    });
  }, 10);

  return `
    <div class="task" onclick="openBoardOverlay(${task.id})" id="${task.id}">
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

  // Wenn es sich um das 'createTaskTemplate' handelt, dann füge nur die Progressbar hinzu
  if (isCreateTaskTemplate) {
    return {
      totalSubtasks,
      completedSubtasks,
      subtaskHTML: `
        <div class="progress-container">
          <div class="progress-bar-bg" style="background-color: #ddd; width: 100%; border-radius: 10px; height: 10px;">
            <div class="progress-bar-fill" style="width: ${progressPercent}%; background-color: #4caf50; border-radius: 10px; height: 100%;"></div>
          </div>
          <div class="subtask-info" style="text-align: center; margin-top: 5px;">
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
  console.log(task); // Hier wird überprüft, ob 'task' korrekt übergeben wird
  if (!task || !Array.isArray(task.subtasks)) {
    return "";
  }

  return task.subtasks
    .map((subtask) => {
      return `
        <div class="subtask">
<input type="checkbox" 
       ${subtask.done ? "checked" : ""} 
       onchange="updateSubtaskStatus('${task.id}', this.checked)">
          <label>${subtask.name}</label>
        </div>
      `;
    })
    .join("");
}
function updateProgressBar(taskId) {
  const task = allTasks.find((t) => t.id === taskId);
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((st) => st.done).length;

  // Berechne den Fortschritt
  const progress = (completedSubtasks / totalSubtasks) * 100;

  // Aktualisiere die Progressbar im CreateTaskTemplate
  const progressBar = document.querySelector(
    `#task-${taskId} .progress-bar-fill`
  );
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
}
function updateSubtaskStatus(taskId, subtaskId, checked) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error("Task with ID", taskId, "not found");
    return;
  }
  const subtask = task.subtasks.find((s) => s.id === subtaskId);
  if (subtask) {
    subtask.completed = checked;
  }
}

function renderTaskWithSubtasks(task) {
  const { subtaskHTML } = generateSubtaskHTML(task.subtasks);
  return `
    <div class="task" onclick="openBoardOverlay()" id="${task.id}">
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

function updateSubtaskStatus(taskId, subtaskId, isChecked) {
  // Sicherstellen, dass allTasks existiert
  if (!Array.isArray(allTasks)) {
    console.error("allTasks is not an array or is undefined");
    return;
  }

  // Finde die Task mit der ID
  const task = allTasks.find((t) => t.id === taskId);

  if (!task) {
    console.error(`Task with ID ${taskId} not found`);
    return;
  }

  // Finde den Subtask basierend auf der Subtask-ID
  const subtask = task.subtasks.find((st) => st.id === subtaskId);

  if (!subtask) {
    console.error(`Subtask with ID ${subtaskId} not found in task ${taskId}`);
    return;
  }

  // Setze den Status des Subtasks
  subtask.done = isChecked;

  // Berechne den neuen Fortschritt und aktualisiere die Progressbar
  updateProgressBar(taskId);
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
/**
 * Clears the add task form and prevents default form submission behavior.
 * @param {*} event - The event object triggered by the user action.
 */
function addTaskCreateTaskConfirmation() {
  showToast(`<img src="./assets/icons/board.svg"/> Task added to board`);
  setTimeout(() => {
    window.location.href = "board.html";
  }, 2000);
}

function addTaskShowAvatarsHTML(bgColor, contact) {
  return `
    <div class="avatar" style="background-color: ${bgColor};">${getUserInitials(
    contact
  )}</div>
    `;
}

function addTaskAssignedToHtml(i, bgColor, contact) {
  return `
      <li>
        <label for="person${i}">
          <span class="avatar" style="background-color: ${bgColor};">${getUserInitials(
    contact
  )}</span>
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
        <span class="avatar" style="background-color: ${bgColor};">${getUserInitials(
    contact
  )}</span>
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
                      <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg"  onclick="editTaskSubtasksList(${i}, event)" >
                       <div class="add-tasks-border"></div>
                      <img  class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="removeFromAddTaskSubtasksList(${i}, event)">
                   </div>
                 </li>
                   `;
}

function taskBoardTemplate(task, taskId) {
  if (!task || !task.assignees) {
    console.error("Task or assignees are missing", task);
    return ""; // Falls Assignees fehlen, nichts zurückgeben
  }

  const assigneeHTML = generateAssigneeHTML(task.assignees);
  const subtaskHTML = generateBoardOverlaySubtaskHTML(task);

  const labelColor = task.category === "Technical Task" ? "#20d7c1" : "#0038ff";
  const priorityIcon = getPriorityIcon(task.priority);

  // Progressbar und Checkboxen hinzufügen
  const { totalSubtasks, completedSubtasks } = generateSubtaskHTML(
    task.subtasks
  );
  const progressPercent = Math.round((completedSubtasks / totalSubtasks) * 100);

  return `     
    <div class="board_overlay_content">
      <!-- Schließen-Button -->
      <button class="board_overlay_close" onclick="closeBoardOverlay()">&times;</button>

      <!-- Label (technical/user story) -->
      <div id="taskLabel" class="task-label" style="background-color: ${labelColor};">${task.category}</div>

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
        <span id="priorityLabel" class="board_priority text-regular">${task.priority}<img src="${priorityIcon}" alt="${task.priority}" /></span>
      </div>

      <!-- Assigned To -->
      <div class="overlay-section">
        <span class="section-label text-label">Assigned to:</span>
        <div class="assignees-column">
          <div class="assignee">
            <div class="assignee-circle circle-blue">${assigneeHTML}</div>
            <span class="assignee-name text-regular">${task.assignees}</span>
          </div>
        </div>
      </div>

      <!-- Subtasks -->
      <div class="subtasks">
        <p class="section-label text-label">Subtasks:</p>
        <!-- Subtask List with Checkboxes -->
        <div class="subtask-item">
          ${subtaskHTML}
        </div>
      </div>

      <!-- Footer mit Icons -->
      <div class="task-footer">
        <button class="board-btn-delete">
          <img src="/assets/icons/board-btn-delete.svg" alt="Delete"> Delete
        </button>
        <button class="board-btn-edit" onclick="editTask()">
          <img src="/assets/icons/board-btn-edit.svg" alt="Edit"> Edit
        </button>
      </div>
    </div>
  `;
}
