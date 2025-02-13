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
  const labelColor = task.category === "Technical Task" ? "#20d7c1" : "#0038ff";
  const priorityLower = String(task.priority || "").toLowerCase();
  let priorityIcon = "/assets/icons/low.svg";
  if (priorityLower === "urgent") {
    priorityIcon = "/assets/icons/urgent.svg";
  } else if (priorityLower === "medium") {
    priorityIcon = "/assets/icons/medium.svg";
  }

  let totalSubtasks = 0;
  let completedSubtasks = 0;
  if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
    totalSubtasks = task.subtasks.length;
    if (
      typeof task.subtasks[0] === "object" &&
      task.subtasks[0].hasOwnProperty("done")
    ) {
      completedSubtasks = task.subtasks.filter((s) => s.done).length;
    }
  }

  let subtaskHTML = "";
  if (totalSubtasks > 0) {
    const progressPercent = Math.round(
      (completedSubtasks / totalSubtasks) * 100
    );
    subtaskHTML = `
      <div class="progress-container">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div class="subtask-info">
          ${completedSubtasks}/${totalSubtasks} Subtasks
        </div>
      </div>
    `;
  }

  let assigneeHTML = "";
  if (Array.isArray(task.assignees)) {
    assigneeHTML = task.assignees
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

  return `
    <div class="task" id="task_${task.id}">
      <div class="task-label" style="background-color: ${labelColor};">
        ${task.category || "Uncategorized"}
      </div>
      <h3 class="task-title">
        ${task.title || "No Title"}
      </h3>
      <p class="task-description">
        ${task.description || ""}
      </p>
      ${subtaskHTML}
      <div class="task-footer">
        <div class="task-assignees">
          ${assigneeHTML}
        </div>
        <div class="task-priority-icon">
          <img src="${priorityIcon}" alt="${task.priority}" />
        </div>
      </div>
    </div>
  `;
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