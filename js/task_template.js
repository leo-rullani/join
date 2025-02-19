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
  showToast(`Task added to board <img src="/assets/icons/Icon-board.svg">`);
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
      <input class="add-task-checkbox" type="checkbox" name="person[${i}]" id="person${i}" value="${contact}" onclick="toggleContactSelection('${contactName}')">
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
  } onclick="toggleContactSelection('${contactName}')">
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

/****************************************
 * The DETAIL template (unchanged from your code)
 ****************************************/
function taskBoardTemplate(task) {
  const assigneeHTML = generateOverlayAssigneeHTML(task.assignees);
  const subtaskHTML = generateBoardOverlaySubtaskHTML(task);
  const labelColor = task.category === "Technical Task" ? "#20d7c1" : "#0038ff";
  const priorityIcon = getPriorityIcon(task.priority);

  return `
    

  <div id="taskLabel" class="task-label board_label" style="background-color: ${labelColor};">
      ${task.category}<button class="board_overlay_close" onclick="closeBoardOverlay()">&times;</button>
    </div> 
<div class="board_overlay_details_content"> 
    <h2 id="taskTitle" class="h2_board-overlay">${task.title}</h2>
    <p id="taskSubtitle" class="text-regular">${task.description}</p>

    <div class="overlay-section">
      <span class="section-label text-label">Due Date:</span>
      <span id="dueDate" class="board_duedate text-regular">${task.date}</span>
    </div>

    <div class="overlay-section">
      <span class="section-label text-label">Priority:</span>
      <span id="priorityLabel" class="board_priority text-regular">
        ${task.priority}
        <img class="prio-icon-boardoverlay" src="${priorityIcon}" alt="${task.priority}" />
      </span>
    </div>

    <div class="overlay-section">
      <span class="section-label text-label">Assigned to:</span>
      <div class="assignees-column-overlay">
        ${assigneeHTML}
      </div>
    </div>

    <div class="subtasks">
      <p class="section-label text-label">Subtasks:</p>
      ${subtaskHTML}
    </div>

    <div class="task-detail-footer">
      <button class="board-btn-delete" onclick="deleteTask('${task.id}')">
        <img src="/assets/icons/board-btn-delete.svg" alt="Delete"> Delete
      </button>
      <button class="board-btn-edit" onclick="editTask('${task.id}')">
        <img src="/assets/icons/board-btn-edit.svg" alt="Edit"> Edit
      </button>
    </div></div>
  `;
}

/****************************************
 * The EDIT template
 * - No "Cancel" button. Only "Ok"
 * - "X" in top right closes but keeps edit mode
 ****************************************/
function taskEditTemplate(task) {
  return `
    <button class="board_overlay_close" onclick="closeBoardOverlay()">&times;</button>

    <div class="edit-task-overlay-container">

      <!-- Title -->
      <div class="add-task-overlay-title">
        <label for="overlay-edit-task-title-input">
          Title <span class="add-task-required">*</span>
        </label>
        <input required id="overlay-edit-task-title-input"
               class="add-task-overlay-title-input"
               type="text" autocomplete="off" placeholder="Enter a title" />
      </div>

      <!-- Description -->
      <div class="add-task-overlay-description">
        <label for="overlay-edit-task-textarea">
          Description <span class="add-task-required">*</span>
        </label>
        <textarea required id="overlay-edit-task-textarea" 
                  class="add-task-overlay-textarea"
                  placeholder="Enter a description"></textarea>
      </div>

      <!-- Assigned to -->
      <div class="add-task-overlay-assigned-to">
        <div class="checkbox-overlay-dropdown">
          <div class="search-overlay">
            <label for="overlay-find-person">Assigned to</label>
            <input type="text" name="overlay-find-person"
                   id="overlay-find-person"
                   autocomplete="off" placeholder="Select contacts to assign"
                   onclick="editShowContactList()"
                   onkeyup="editAssignedToSearch()" />
          </div>
          <ul id="overlay-edit-task-contact"></ul>
        </div>
      </div>
      <div id="overlay-edit-task-assigned-avatar" class="add-task-assigned-avatar"></div>

      <!-- Due Date -->
      <div class="add-task-overlay-due-date">
        <label for="overlay-edit-date">
          Due date <span class="add-task-required">*</span>
        </label>
        <input required type="date"
               class="add-task-overlay-due-date-input"
               id="overlay-edit-date"
               name="overlay-edit-date" />
      </div>

      <!-- Priority -->
      <div class="add-task-overlay-urgent-medium-low-container">
        <div>Prio</div>
        <div id="overlay-edit-task-urgent-medium-low-buttons"
             class="add-task-overlay-urgent-medium-low-buttons">
          <button id="overlay-edit-task-urgent" 
                  class="add-task-overlay-urgent"
                  data-priority="urgent"
                  onclick="editSetTaskPrio('urgent','overlay-edit-task-urgent-medium-low-buttons',event)">
            <div class="add-task-overlay-important">
              <div class="add-task-overlay-important-name">Urgent</div>
              <img id="overlay-prio-urgent" src="/assets/icons/urgent.svg" />
            </div>
          </button>
          <button id="overlay-edit-task-medium"
                  class="add-task-overlay-medium add-task-clicked"
                  data-priority="medium"
                  onclick="editSetTaskPrio('medium','overlay-edit-task-urgent-medium-low-buttons',event)">
            <div class="add-task-overlay-important">
              <div class="add-task-overlay-important-name">Medium</div>
              <img id="overlay-prio-medium" src="/assets/icons/medium.svg" />
            </div>
          </button>
          <button id="overlay-edit-task-low"
                  class="add-task-overlay-low"
                  data-priority="low"
                  onclick="editSetTaskPrio('low','overlay-edit-task-urgent-medium-low-buttons',event)">
            <div class="add-task-overlay-important">
              <div class="add-task-overlay-important-name">Low</div>
              <img id="overlay-prio-low" src="/assets/icons/low.svg" />
            </div>
          </button>
        </div>
      </div>

      <!-- Category -->
      <div class="add-task-overlay-category">
        <div class="checkbox-overlay-dropdown">
          <div class="search-overlay">
            <label for="overlay-edit-task-category">
              Category <span class="add-task-required">*</span>
            </label>
            <input required type="text"
                   id="overlay-edit-task-category"
                   autocomplete="off"
                   placeholder="Select task category" />
          </div>
          <ul>
            <li>
              <label for="overlay-technical-task">
                Technical Task
                <input class="add-task-radio" 
                       type="radio" 
                       name="overlay-category"
                       id="overlay-technical-task"
                       value="Technical Task"
                       onclick="editSetCategory(this.value)" />
              </label>
            </li>
            <li>
              <label for="overlay-user-story">
                User Story
                <input class="add-task-radio"
                       type="radio"
                       name="overlay-category"
                       id="overlay-user-story"
                       value="User Story"
                       onclick="editSetCategory(this.value)" />
              </label>
            </li>
          </ul>
        </div>
      </div>

      <!-- Subtasks -->
      <div class="add-task-overlay-subtasks">
        <div class="add-task-overlay-subtasks-input-container">
          <label for="overlay-edit-task-subtasks-input">Subtasks</label>
          <input id="overlay-edit-task-subtasks-input"
                 name="overlay-edit-task-subtasks-input"
                 class="add-task-overlay-subtasks-input"
                 type="text"
                 placeholder="Add new subtask"
                 autocomplete="off"
                 onclick="editSubtasksClicked()"
                 onkeypress="editAddSubtask(event)" />
          <div id="overlay-edit-task-subtasks-icon-plus"
               class="add-task-overlay-subtasks-icon-plus">
            <button id="overlay-edit-task-subtasks-input-plus"
                    onclick="editSubtasksPlus(event)">
              <img src="/assets/icons/add_task_subtasks_icon_plus.svg" alt="" />
            </button>
          </div>
          <div id="overlay-edit-task-subtasks-icon-plus-check"
               class="add-task-overlay-subtasks-icon-plus-check d-none">
            <button id="overlay-edit-task-subtasks-input-clear"
                    onclick="editClearSubtasksInput(event)">
              <img src="/assets/icons/add_task_clear.svg" />
            </button>
            <div class="add-tasks-border"></div>
            <button onclick="editAddSubtask(event)">
              <svg width="14" height="14" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.02832 15.0001L15.2571 26.0662L33.9717 3.93408"
                      stroke="black" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div id="overlay-edit-task-subtasks-choosen" class="add-task-overlay-subtasks-choosen">
        <ul id="overlay-edit-task-subtasks-list" class="overlay-edit-task-subtasks-list"></ul>
      </div>
    </div>

    <!-- Footer: single "Ok" button => updateTask() -->
    <div class="edit-task-bottom">
      <button class="add-task-bottom-create-button" type="button"
              onclick="updateTask('${task.id}')">
        <div class="add-task-bottom-create-task">
          Ok
          <img class="add-task-create-task" src="/assets/icons/add_task_check.svg" alt="check" />
        </div>
      </button>
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

/*****************************************************
 * addtaskoverlay.js
 *****************************************************/
function openAddTaskOverlay() {
  const overlay = document.getElementById("addTaskOverlay");
  if (!overlay) {
    console.error("Add Task Overlay-Element nicht gefunden!");
    return;
  }
  // Overlay sichtbar machen
  overlay.classList.add("add_task_overlay_show");

  // Optionale Slide-In-Animation:
  const content = overlay.querySelector(".overlay_content");
  if (content) {
    content.classList.remove("slide-out");
    content.classList.add("slide-in");
  }
}

function closeAddTaskOverlay() {
  const overlay = document.getElementById("addTaskOverlay");
  if (!overlay) return;

  const content = overlay.querySelector(".overlay_content");
  if (content) {
    // Slide-Out
    content.classList.remove("slide-in");
    content.classList.add("slide-out");

    // Warte bis Animation vorbei ist (3s in diesem Beispiel)
    setTimeout(() => {
      overlay.classList.remove("add_task_overlay_show");
    }, 3000);
  } else {
    // Fallback ohne Animation
    overlay.classList.remove("add_task_overlay_show");
  }
}
