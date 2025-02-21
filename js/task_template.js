/**
 * Creates HTML for a task card on the board.
 * @param {object} t - The task object.
 * @returns {string} - The HTML string.
 */
window.createTaskTemplate = function (t) {
  if (!t.id) {
    console.error("Task ID is missing", t);
    return "";
  }

  let {
    totalSubtasks: tS,
    completedSubtasks: cS,
    subtaskHTML: sH,
  } = generateSubtaskHTML(t.subtasks, true);

  let aH = generateAssigneeHTML(t.assignees);
  let p = tS > 0 ? (cS / tS) * 100 : 0;

  return generateTaskHTML(t, sH, aH, p);
};

/**
 * Generates the HTML structure for a task card.
 * @param {object} t - Task object.
 * @param {string} s - Subtask HTML.
 * @param {string} a - Assignee HTML.
 * @param {number} p - Progress percentage.
 * @returns {string} - The task card HTML.
 */
window.generateTaskHTML = function (t, s, a, p) {
  let c = t.category === "Technical Task" ? "#20d7c1" : "#0038ff",
    i = getPriorityIcon(t.priority);

  setTimeout(() => {
    document.querySelectorAll(".progress-bar-fill").forEach((b) => {
      b.style.transition = "width 0.5s ease-in-out";
    });
  }, 10);

  return `
    <div 
      class="task" 
      onclick="console.log('${t.id}');openBoardOverlay('${t.id}')" 
      id="${t.id}"
    >
      <div class="task-label" style="background-color:${c};">
        ${t.category || "Uncategorized"}
      </div>

      <h3 class="task-title">${t.title || "No Title"}</h3>
      <p class="task-description">${t.description || ""}</p>

      <!-- Subtask HTML -->
      ${s}

      <div class="task-footer">
        <div class="task-assignees">${a}</div>
        <div class="task-priority-icon">
          <img src="${i}" alt="${t.priority}">
        </div>
      </div>
    </div>
  `;
};

/**
 * Generates HTML for subtasks in the board overlay.
 * @param {object} t - Task object.
 * @returns {string} - The subtasks HTML.
 */
window.generateBoardOverlaySubtaskHTML = function (t) {
  if (!t || !Array.isArray(t.subtasks)) return "";

  return t.subtasks
    .map((s, i) => {
      return `
        <div class="subtask-item-overlay">
          <input 
            type="checkbox" 
            id="subtask-${t.id}-${i}" 
            ${s.done ? "checked" : ""}
            onchange="updateSubtaskStatus(${i},'${t.id}',this.checked)"
          >
          <label for="subtask-${t.id}-${i}" class="text-subtask">
            ${s.name}
          </label>
        </div>
      `;
    })
    .join("");
};

/**
 * Renders a task card with subtasks.
 * @param {object} t - Task object.
 * @returns {string} - The HTML string.
 */
window.renderTaskWithSubtasks = function (t) {
  let { subtaskHTML: h } = generateSubtaskHTML(t.subtasks);

  return `
    <div 
      class="task" 
      onclick="console.log('${t.id}');openBoardOverlay('${t.id}')" 
      id="${t.id}"
    >
      <h3 class="task-title">${t.title}</h3>
      <div class="task-description">${t.description}</div>
      ${h}
    </div>
  `;
};

/**
 * Renders an alternative template for a task card with subtasks.
 * @param {object} t - Task object.
 * @returns {string} - The alternative HTML.
 */
window.renderAnotherTemplateWithSubtasks = function (t) {
  let { subtaskHTML: h } = generateSubtaskHTML(t.subtasks);

  return `
    <div class="task-card" id="${t.id}">
      <h2>${t.title}</h2>
      <div class="task-details">${t.description}</div>
      ${h}
    </div>
  `;
};

/**
 * Generates HTML for assignees in the board overlay.
 * @param {Array|object} a - Array or object of assignees.
 * @returns {string} - The HTML string.
 */
window.generateOverlayAssigneeHTML = function (a) {
  if (typeof a === "object" && !Array.isArray(a)) a = Object.values(a);
  if (!Array.isArray(a) || !a.length) return "<div>No assignees</div>";

  return a
    .map((n) => {
      let i = getInitials(n),
        c = assignColor(n);
      return `
        <div class="assignee-overlay">
          <div 
            class="assignee-circle-overlay" 
            style="background-color:${c};"
          >
            ${i}
          </div>
          <span class="assignee-name-overlay">${n}</span>
        </div>
      `;
    })
    .join("");
};

/**
 * Generates the board overlay template for a given task.
 * @param {object} t - Task object.
 * @returns {string} - The HTML overlay.
 */
window.taskBoardTemplate = function (t) {
  let a = generateOverlayAssigneeHTML(t.assignees),
    s = generateBoardOverlaySubtaskHTML(t),
    c = t.category === "Technical Task" ? "#20d7c1" : "#0038ff",
    p = getPriorityIcon(t.priority),
    d = new Date(t.date)
      .toISOString()
      .split("T")[0]
      .split("-")
      .reverse()
      .join("/");

  return `
    <div 
      id="taskLabel" 
      class="task-label board_label" 
      style="background-color:${c};"
    >
      ${t.category}
      <button class="board_overlay_close" onclick="closeBoardOverlay()">
        &times;
      </button>
    </div>

    <div class="board_overlay_details_content">
      <h2 id="taskTitle" class="h2_board-overlay">${t.title}</h2>
      <p id="taskSubtitle" class="text-regular">${t.description}</p>

      <div class="overlay-section">
        <span class="section-label text-label">Due Date:</span>
        <span id="dueDate" class="board_duedate text-regular">${d}</span>
      </div>

      <div class="overlay-section">
        <span class="section-label text-label">Priority:</span>
        <span id="priorityLabel" class="board_priority text-regular">
          ${t.priority}
          <img 
            class="prio-icon-boardoverlay" 
            src="${p}" 
            alt="${t.priority}"
          />
        </span>
      </div>

      <div class="overlay-section">
        <span class="section-label text-label">Assigned to:</span>
        <div class="assignees-column-overlay">${a}</div>
      </div>

      <div class="subtasks">
        <p class="section-label text-label">Subtasks:</p>
        ${s}
      </div>

      <div class="task-detail-footer">
        <button class="board-btn-delete" onclick="deleteTask('${t.id}')">
          <img src="/assets/icons/board-btn-delete.svg" alt="Delete"> Delete
        </button>
        <button class="board-btn-edit" onclick="editTask('${t.id}')">
          <img src="/assets/icons/board-btn-edit.svg" alt="Edit"> Edit
        </button>
      </div>
    </div>
  `;
};

/**
 * Generates the edit form template for a given task.
 * @param {object} t - Task object.
 * @returns {string} - The HTML string for the edit form.
 */
window.taskEditTemplate = function (t) {
  return `
    <button class="board_overlay_close" onclick="closeBoardOverlay()">
      &times;
    </button>

    <div class="edit-task-overlay-container">
      <!-- Title -->
      <div class="add-task-overlay-title">
        <label for="overlay-edit-task-title-input">
          Title <span class="add-task-required">*</span>
        </label>
        <input
          required
          id="overlay-edit-task-title-input"
          class="add-task-overlay-title-input"
          type="text"
          autocomplete="off"
          placeholder="Enter a title"
        />
      </div>

      <!-- Description -->
      <div class="add-task-overlay-description">
        <label for="overlay-edit-task-textarea">
          Description <span class="add-task-required">*</span>
        </label>
        <textarea
          required
          id="overlay-edit-task-textarea"
          class="add-task-overlay-textarea"
          placeholder="Enter a description"
        ></textarea>
      </div>

      <!-- Assigned to -->
      <div class="add-task-overlay-assigned-to">
        <div class="checkbox-overlay-dropdown">
          <div class="search-overlay">
            <label for="overlay-find-person">Assigned to</label>
            <input
              type="text"
              name="overlay-find-person"
              id="overlay-find-person"
              autocomplete="off"
              placeholder="Select contacts to assign"
              onclick="editShowContactList()"
              onkeyup="editAssignedToSearch()"
            />
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
        <input
          required
          type="date"
          class="add-task-overlay-due-date-input"
          id="overlay-edit-date"
          name="overlay-edit-date"
        />
      </div>

      <!-- Priority -->
      <div class="add-task-overlay-urgent-medium-low-container">
        <div>Prio</div>
        <div
          id="overlay-edit-task-urgent-medium-low-buttons"
          class="add-task-overlay-urgent-medium-low-buttons"
        >
          <button
            id="overlay-edit-task-urgent"
            class="add-task-overlay-urgent"
            data-priority="urgent"
            onclick="editSetTaskPrio('urgent','overlay-edit-task-urgent-medium-low-buttons',event)"
          >
            <div class="add-task-overlay-important">
              <div class="add-task-overlay-important-name">Urgent</div>
              <img id="overlay-prio-urgent" src="/assets/icons/urgent.svg" />
            </div>
          </button>

          <button
            id="overlay-edit-task-medium"
            class="add-task-overlay-medium add-task-clicked"
            data-priority="medium"
            onclick="editSetTaskPrio('medium','overlay-edit-task-urgent-medium-low-buttons',event)"
          >
            <div class="add-task-overlay-important">
              <div class="add-task-overlay-important-name">Medium</div>
              <img id="overlay-prio-medium" src="/assets/icons/medium.svg" />
            </div>
          </button>

          <button
            id="overlay-edit-task-low"
            class="add-task-overlay-low"
            data-priority="low"
            onclick="editSetTaskPrio('low','overlay-edit-task-urgent-medium-low-buttons',event)"
          >
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
            <input
              required
              type="text"
              id="overlay-edit-task-category"
              autocomplete="off"
              placeholder="Select task category"
            />
          </div>
          <ul>
            <li>
              <label for="edit-technical-task">
                Technical Task
                <input
                  class="add-task-radio"
                  type="radio"
                  name="overlay-category"
                  id="edit-technical-task"
                  value="Technical Task"
                  onclick="editSetCategory('technical',event)"
                />
              </label>
            </li>
            <li>
              <label for="edit-user-story">
                User Story
                <input
                  class="add-task-radio"
                  type="radio"
                  name="overlay-category"
                  id="edit-user-story"
                  value="User Story"
                  onclick="editSetCategory('user story',event)"
                />
              </label>
            </li>
          </ul>
        </div>
      </div>

      <!-- Subtasks -->
      <div class="add-task-overlay-subtasks">
        <div class="add-task-overlay-subtasks-input-container">
          <label for="overlay-edit-task-subtasks-input">Subtasks</label>
          <input
            id="overlay-edit-task-subtasks-input"
            name="overlay-edit-task-subtasks-input"
            class="add-task-overlay-subtasks-input"
            type="text"
            placeholder="Add new subtask"
            autocomplete="off"
            onclick="editSubtasksClicked()"
            onkeypress="editAddSubtask(event)"
          />

          <div
            id="overlay-edit-task-subtasks-icon-plus"
            class="add-task-overlay-subtasks-icon-plus"
          >
            <button
              id="overlay-edit-task-subtasks-input-plus"
              onclick="editSubtasksPlus(event)"
            >
              <img src="/assets/icons/add_task_subtasks_icon_plus.svg" alt="" />
            </button>
          </div>

          <div
            id="overlay-edit-task-subtasks-icon-plus-check"
            class="add-task-overlay-subtasks-icon-plus-check d-none"
          >
            <button
              id="overlay-edit-task-subtasks-input-clear"
              onclick="editClearSubtasksInput(event)"
            >
              <img src="/assets/icons/add_task_clear.svg" />
            </button>
            <div class="add-tasks-border"></div>
            <button onclick="editAddSubtask(event)">
              <svg
                width="14"
                height="14"
                viewBox="0 0 38 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.02832 15.0001L15.2571 26.0662L33.9717 3.93408"
                  stroke="black"
                  stroke-width="7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        id="overlay-edit-task-subtasks-choosen"
        class="add-task-overlay-subtasks-choosen"
      >
        <ul id="overlay-edit-task-subtasks-list" class="overlay-edit-task-subtasks-list"></ul>
      </div>
    </div>

    <div class="edit-task-bottom">
      <button
        class="add-task-bottom-create-button"
        type="button"
        onclick="updateTask('${t.id}')"
      >
        <div class="add-task-bottom-create-task">
          Ok
          <img
            class="add-task-create-task"
            src="/assets/icons/add_task_check.svg"
            alt="check"
          />
        </div>
      </button>
    </div>
  `;
};

/**
 * Returns HTML for a single subtask.
 * @param {string} name - The name of the subtask.
 * @param {number} i - The index of the subtask.
 * @returns {string} - The HTML string for the subtask.
 */
function subTaskTemplate(name, i) {
  return `
    <li>
      <span class="add-task-subtasks-extra-task">${name}</span>
      <div class="add-task-subtasks-icons">
        <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg" onclick="editTaskSubtasksList(${i}, event)">
        <div class="add-tasks-border"></div>
        <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="removeFromAddTaskSubtasksList(${i}, event)">
      </div>
    </li>
  `;
}
window.subTaskTemplate = subTaskTemplate;

/**
 * Generates HTML for a contact in the assigned to search list.
 * @param {boolean} chk - Indicates if the contact is selected.
 * @param {number} i - The index of the contact.
 * @param {string} bg - The background color for the avatar.
 * @param {object} c - The contact object.
 * @returns {string} - The HTML string for the contact.
 */
function addTaskAssignedToSearchTemplate(chk, i, bg, c) {
  return `
      <li class="${chk ? "selectedContact" : ""}">
        <label for="person${i}">
          <span class="avatar" style="background-color:${bg};">${getUserInitials(
    c.name
  )}</span>
          <span>${c.name}</span>
        </label>
        <input class="add-task-checkbox" type="checkbox" name="person[${i}]" id="person${i}"
          value="${c.name}" ${
    chk ? "checked" : ""
  } onclick="toggleContactSelection('${c.name}')">
      </li>
    `;
}
window.addTaskAssignedToSearchTemplate = addTaskAssignedToSearchTemplate;

/**
 * Creates an assigned contact template.
 * @param {boolean} chk - Indicates if the contact is selected.
 * @param {number} i - The index of the contact.
 * @param {string} bg - The background color for the avatar.
 * @param {object} c - The contact object.
 * @returns {string} - The HTML string for the assigned contact.
 */

function createAssignedToTemplate(chk, i, bg, c) {
  return `
      <li class="${chk ? "selectedContact" : ""}">
        <label for="person${i}">
          <span class="avatar" style="background-color:${bg};">${getUserInitials(
    c.name
  )}</span>
          <span>${c.name}</span>
        </label>
        <input class="add-task-checkbox" type="checkbox" name="person[${i}]" id="person${i}"
          value="${c.name}" ${
    chk ? "checked" : ""
  } onclick="toggleContactSelection('${c.name}')">
      </li>
    `;
}
window.createAssignedToTemplate = createAssignedToTemplate;

/**
 * Template for rendering an assigned contact search list item.
 *
 * @param {boolean} chk - True if the contact is selected.
 * @param {number} i - The index of the contact.
 * @param {string} bg - The background color for the avatar.
 * @param {Object} c - The contact object containing a 'name' property.
 * @returns {string} The HTML string for the assigned contact list item.
 */
function overlayAddTaskAssignedToSearchTemplate(chk, i, bg, c) {
  return `
        <li class="${chk ? "selectedContact" : ""}">
        <label for="overlay-person${i}">
          <span class="avatar" style="background-color:${bg};">${getUserInitials(
    c.name
  )}</span>
          <span>${c.name}</span>
        </label>
        <input class="overlay-add-task-checkbox" type="checkbox" id="overlay-person${i}" value="${
    c.name
  }" ${chk ? "checked" : ""} onclick="overlayToggleContactSelection('${
    c.name
  }')">
      </li>
    `;
}
window.overlayAddTaskAssignedToSearchTemplate =
  overlayAddTaskAssignedToSearchTemplate;

/**
 * Template for rendering a contact list item.
 *
 * @param {boolean} chk - True if the contact is selected.
 * @param {number} i - The index of the contact.
 * @param {string} bg - The background color for the avatar.
 * @param {Object} c - The contact object containing a 'name' property.
 * @returns {string} The HTML string for the contact list item.
 */
function overlayShowContactListTemplate(chk, i, bg, c) {
  return `
          <li class="${chk ? "selectedContact" : ""}">
        <label for="overlay-person${i}">
          <span class="avatar" style="background-color:${bg};">${getUserInitials(
    contact.name
  )}</span>
          <span>${contact.name}</span>
        </label>
        <input class="overlay-add-task-checkbox" type="checkbox" id="overlay-person${i}" value="${
    contact.name
  }" ${chk ? "checked" : ""} onclick="overlayToggleContactSelection('${
    contact.name
  }')">
      </li>
    `;
}
window.overlayShowContactListTemplate = overlayShowContactListTemplate;

/**
 * Template for rendering an editable subtask list item.
 *
 * @param {number} i - The index of the subtask in the overlaySubtasksList.
 * @returns {string} The HTML string for the editable subtask list item.
 */
function overlayEditTaskSubtasksListTemplate(i) {
  return `
        <li class="add-task-subtask-li-edit">
          <div class="add-task-subtasks-input-edit-div">
            <input class="add-task-subtasks-input-edit" id="overlay-add-task-subtasks-input-edit" type="text" value="${window.overlaySubtasksList[i]}" onkeypress="overlayConfirmEditSubtask(${i}, event)">
            <div class="add-task-subtasks-icons-edit">
              <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="overlayRemoveOverlaySubtask(${i}, event)">
              <div class="add-tasks-border"></div>
              <img class="add-task-confirm" src="/assets/icons/done_inverted.svg" onclick="overlayConfirmEditSubtask(${i}, event)">
            </div>
          </div>
        </li>
      `;
}
window.overlayEditTaskSubtasksListTemplate =
  overlayEditTaskSubtasksListTemplate;

/**
 * Returns HTML for an overlay subtask.
 * @param {string} subtaskName
 * @param {number} index
 * @returns {string}
 */
function overlaySubTaskTemplate(subtaskName, index) {
  return `
    <li>
      <span class="add-task-subtasks-extra-task">${subtaskName}</span>
      <div class="overlay-add-task-subtasks-icons">
        <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg" onclick="overlayEditTaskSubtasksList(${index}, event)">
        <div class="add-tasks-border"></div>
        <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="overlayRemoveOverlaySubtask(${index}, event)">
      </div>
    </li>
  `;
}
window.overlaySubTaskTemplate = overlaySubTaskTemplate;
