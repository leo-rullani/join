function createTaskTemplate(task) {
  let assignees = Array.isArray(task.assignees)
    ? task.assignees.join(", ")
    : "No assignees";
  return `
    <div class="task">
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Due Date:</strong> ${task.date}</p>
      <p><strong>Assigned To:</strong>${assignees}</p>
      <p><strong>Category:</strong> ${task.category}</p>
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
