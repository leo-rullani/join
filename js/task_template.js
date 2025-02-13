/***********************************************
 * Deine Farbzuweisungs-Funktion
 ***********************************************/
function assignColor(name) {
  // Holen wir uns den **ersten** Buchstaben in Großbuchstaben
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

  // Fallback-Farbe, falls Buchstabe nicht im Objekt ist
  return colors[firstLetter] || "#999999";
}

/***********************************************
 * Task-Template mit Subtask-Logik, Avataren, usw.
 ***********************************************/
function createTaskTemplate(task) {
  // === 1) Kategorie-Label-Farbe (Technical vs. User Story) ===
  const labelColor = task.category === "Technical Task" ? "#20d7c1" : "#0038ff";

  // === 2) Priority-Icon ===
  const priorityLower = String(task.priority || "").toLowerCase();
  let priorityIcon = "/assets/icons/low.svg"; // Default Low
  if (priorityLower === "urgent") {
    priorityIcon = "/assets/icons/urgent.svg";
  } else if (priorityLower === "medium") {
    priorityIcon = "/assets/icons/medium.svg";
  }
  // (Falls "low", bleibt es beim Default.)

  // === 3) Subtasks-Logik ===
  // Wir gehen davon aus, dass "task.subtasks" entweder:
  //   - NICHT existiert oder
  //   - ein Array von Strings ["Subtask 1", "Subtask 2"] oder
  //   - ein Array von Objekten [{ title: "...", done: true }, ...]
  let totalSubtasks = 0;
  let completedSubtasks = 0;

  if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
    totalSubtasks = task.subtasks.length;

    // Prüfen, ob es ein Array von Objekten mit "done" ist:
    // (z.B. { title: "...", done: true })
    if (
      typeof task.subtasks[0] === "object" &&
      task.subtasks[0].hasOwnProperty("done")
    ) {
      completedSubtasks = task.subtasks.filter((s) => s.done).length;
    }
    // Falls nur ein Array von Strings, "done" existiert nicht => completedSubtasks bleibt 0
  }

  let subtaskHTML = "";
  if (totalSubtasks > 0) {
    // Nur wenn Subtasks vorliegen, Balken & Text einblenden
    const progressPercent = Math.round(
      (completedSubtasks / totalSubtasks) * 100
    );
    subtaskHTML = `
      <div class="progress-container" style="margin-bottom: 8px;">
        <div class="progress-bar-bg" style="
          background-color: #e0e0e0; 
          height: 6px; 
          border-radius: 3px;
          position: relative;
        ">
          <div class="progress-bar-fill" style="
            background-color: #398df7; 
            width: ${progressPercent}%;
            height: 100%; 
            border-radius: 3px;
          "></div>
        </div>
        <div class="subtask-info" style="text-align: right; font-size: 14px; color: #2b3647; margin-top: 4px;">
          ${completedSubtasks}/${totalSubtasks} Subtasks
        </div>
      </div>
    `;
  }

  // === 4) Assigned Avatare mit eigener Farbe je Name ===
  let assigneeHTML = "";
  if (Array.isArray(task.assignees)) {
    assigneeHTML = task.assignees
      .map((name) => {
        // Initialen ermitteln
        const initials = getInitials(name);
        // Farbe über die assignColor-Funktion (auf den Anfangsbuchstaben)
        const bgColor = assignColor(name);
        return `
        <div 
          class="avatar-circle" 
          style="
            width: 30px; height: 30px; border-radius: 50%; 
            background-color: ${bgColor};
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-size: 14px; font-weight: bold;
            border: 2px solid #fff; margin-left: 0;
          "
        >
          ${initials}
        </div>
      `;
      })
      .join("");
  }

  // Hilfsfunktion: "Sofia Müller" => "SM"
  function getInitials(fullName) {
    let parts = fullName.trim().split(" ");
    let first = parts[0]?.[0]?.toUpperCase() || "";
    let last = parts[1]?.[0]?.toUpperCase() || "";
    return first + last;
  }

  // === 5) Komplettes Template zusammenbauen ===
  return `
    <div class="task" id="task_${task.id}" style="
      background: #fff;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      width: 240px;
      margin-bottom: 20px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
    ">

      <!-- Label oben -->
      <div 
        class="task-label" 
        style="
          background-color: ${labelColor}; 
          color: #fff;
          padding: 6px 12px; 
          border-radius: 8px; 
          display: inline-block;
          margin-bottom: 8px;
          font-size: 14px;
        "
      >
        ${task.category || "Uncategorized"}
      </div>

      <!-- Titel -->
      <h3 style="
        margin: 8px 0 4px; 
        font-size: 18px; 
        font-weight: 600;
      ">
        ${task.title || "No Title"}
      </h3>

      <!-- Beschreibung in Grau -->
      <p style="
        color: #6b6b6b; 
        margin-bottom: 12px; 
        font-size: 14px;
        line-height: 1.4;
      ">
        ${task.description || ""}
      </p>

      <!-- Subtask-Balken -->
      ${subtaskHTML}

      <!-- Footer: Avatare (links) + Priority (rechts) -->
      <div class="task-footer" style="
           display: flex; 
           align-items: center; 
           justify-content: space-between;
           margin-top: 12px;
      ">
        <!-- Avatare links -->
        <div class="task-assignees" style="
             display: flex; 
             gap: 4px;
        ">
          ${assigneeHTML}
        </div>

        <!-- Priority-Icon rechts -->
        <div class="task-priority-icon">
          <img 
            src="${priorityIcon}" 
            alt="${task.priority}" 
            style="width: 24px; height: 24px;" 
          />
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
