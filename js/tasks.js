/**
 * Global color map for assignColor.
 */
window.colorCodes = {
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

/**
 * Assigns a color to a name.
 * @param {string} name - The name.
 * @returns {string} - The assigned color in hex format.
 */
window.assignColor = function (name) {
  let c = (name.trim()[0] || "Z").toUpperCase();
  return window.colorCodes[c] || "#999999";
};

/**
 * Generates subtask HTML and counts total/completed subtasks.
 * @param {Array} st - Array of subtask objects.
 * @param {boolean} ct - If true, returns progress bar HTML.
 * @returns {object} - {totalSubtasks, completedSubtasks, subtaskHTML}.
 */
window.generateSubtaskHTML = function (st, ct = false) {
  if (!Array.isArray(st) || !st.length)
    return { totalSubtasks: 0, completedSubtasks: 0, subtaskHTML: "" };
  let ts = st.length,
    cs = st.filter((s) => s.done).length,
    pp = Math.round((cs / ts) * 100);
  if (ct)
    return {
      totalSubtasks: ts,
      completedSubtasks: cs,
      subtaskHTML: `
<div class="progress-container" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
 <div class="progress-bar-bg" style="background-color:#ddd;width:58%;border-radius:10px;height:10px;">
  <div class="progress-bar-fill" style="width:${pp}%;background-color:#4689ff;border-radius:10px;height:100%;"></div>
 </div>
 <div class="subtask-info" style="font-size:12px;margin-left:10px;">${cs}/${ts} Subtasks</div>
</div>
`,
    };
  let h = "";
  st.forEach((s) => {
    h += `
<div class="subtask"><label for="subtask_${s.name}">${s.name}</label></div>
`;
  });
  return { totalSubtasks: ts, completedSubtasks: cs, subtaskHTML: h };
};

/**
 * Generates HTML for assignees.
 * @param {Array|object} a - Array or object of assignees.
 * @returns {string} - The HTML string.
 */
window.generateAssigneeHTML = function (a) {
  if (typeof a === "object" && !Array.isArray(a)) a = Object.values(a);
  if (!Array.isArray(a) || !a.length) return "<div>No assignees</div>";
  return a
    .map((n) => {
      let i = getInitials(n),
        c = assignColor(n);
      return `
 <div class="avatar-circle" style="background-color:${c};">${i}</div>
`;
    })
    .join("");
};

/**
 * Extracts initials from a full name.
 * @param {string} n - The full name.
 * @returns {string} - The initials.
 */
window.getInitials = function (n) {
  let p = n.trim().split(" "),
    f = p[0]?.[0]?.toUpperCase() || "",
    l = p[1]?.[0]?.toUpperCase() || "";
  return f + l;
};

/**
 * Reloads the current page.
 */
window.reload = function () {
  location.reload();
};

/**
 * Updates the progress bar for a given task.
 * @param {string} id - The task ID.
 */
window.updateProgressBar = function (id) {
  let t = window.tasks.find((o) => o.id === id);
  if (!t) return;
  let ts = t.subtasks.length,
    cs = t.subtasks.filter((s) => s.done).length,
    p = (cs / ts) * 100;
  let b = document.querySelector(`#${id} .progress-bar-fill`);
  if (b) b.style.width = `${p}%`;
  let i = document.querySelector(`#${id} .subtask-info`);
  if (i) i.textContent = `${cs}/${ts} Subtasks`;
};

/**
 * Updates the status of a subtask locally and in Firebase.
 * @param {number} i - Index of subtask.
 * @param {string} id - Task ID.
 * @param {boolean} c - New checked status.
 */
window.updateSubtaskStatus = function (i, id, c) {
  let t = window.tasks.find((o) => o.id === id);
  if (t && t.subtasks[i]) {
    t.subtasks[i].done = c;
    updateProgressBar(id);
    updateSubtaskInFirebase(id, i, c);
  }
};

/**
 * Firebase database URL.
 */
window.databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Updates a subtask status in Firebase.
 * @param {string} id - Task ID.
 * @param {number} i - Subtask index.
 * @param {boolean} c - New status.
 */
window.updateSubtaskInFirebase = function (id, i, c) {
  let d = { [`subtasks/${i}/done`]: c };
  return fetch(`${window.databaseURL}/tasks/${id}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d),
  })
    .then((r) => r.json())
    .then((data) =>
      console.log("Subtask-Status erfolgreich aktualisiert:", data)
    )
    .catch((e) =>
      console.error("Fehler beim Speichern der Subtask-Status:", e)
    );
};

/**
 * Displays a toast message and redirects to the board page.
 */
window.addTaskCreateTaskConfirmation = function () {
  showToast(`Task added to board <img src="/assets/icons/Icon-board.svg">`);
  setTimeout(() => {
    window.location.href = "board.html";
  }, 2000);
};

/**
 * Returns HTML for an avatar using initials.
 * @param {string} b - Background color.
 * @param {string} c - Contact name.
 * @returns {string} - The avatar HTML.
 */
window.addTaskShowAvatarsHTML = function (b, c) {
  return `
 <div class="avatar" style="background-color:${b};">
  ${getInitials(c)}
 </div>
`;
};

/**
 * Returns an HTML list item for an assigned contact.
 * @param {number} i - Contact index.
 * @param {string} b - Background color.
 * @param {string} c - Contact name.
 * @returns {string} - The HTML list item.
 */
window.addTaskAssignedToHtml = function (i, b, c) {
  return `
 <li>
  <label for="person${i}">
   <span class="avatar" style="background-color:${b};">${getInitials(c)}</span>
   <span>${c}</span>
  </label>
  <input class="add-task-checkbox" type="checkbox" name="person[${i}]" id="person${i}" value="${c}" onclick="toggleContactSelection('${c}')">
 </li>
`;
};

/**
 * Returns an HTML list item for an assigned contact with "checked" if assigned.
 * @param {number} i - Contact index.
 * @param {string} b - Background color.
 * @param {string} c - Contact name.
 * @param {boolean} a - Already assigned.
 * @returns {string} - The HTML list item.
 */
window.addTaskAssignedToSearchHTML = function (i, b, c, a) {
  return `
 <li>
  <label for="person${i}">
   <span class="avatar" style="background-color:${b};">${getInitials(c)}</span>
   <span>${c}</span>
  </label>
  <input class="add-task-checkbox" type="checkbox" name="person[${i}]" id="person${i}" value="${c}" ${
    a ? "checked" : ""
  } onclick="toggleContactSelection('${c}')">
 </li>
`;
};

/**
 * Returns an HTML list item for a subtask with edit/delete icons.
 * @param {string} e - Subtask name.
 * @param {number} i - Subtask index.
 * @returns {string} - The HTML list item.
 */
window.subTaskTemplate = function (e, i) {
  return `
 <li>
  <span class="add-task-subtasks-extra-task">${e}</span>
  <div class="add-task-subtasks-icons">
   <img class="add-task-edit" src="/assets/icons/add-subtask-edit.svg" onclick="editTaskSubtasksList(${i},event)">
   <div class="add-tasks-border"></div>
   <img class="add-task-trash" src="/assets/icons/add-subtask-delete.svg" onclick="removeFromAddTaskSubtasksList(${i},event)">
  </div>
 </li>
`;
};

/**
 * Returns the icon path for a given priority.
 * @param {string} p - Priority (urgent|medium|low).
 * @returns {string} - The icon path.
 */
window.getPriorityIcon = function (p) {
  let l = String(p || "").toLowerCase();
  switch (l) {
    case "urgent":
      return "/assets/icons/urgent.svg";
    case "medium":
      return "/assets/icons/medium.svg";
    default:
      return "/assets/icons/low.svg";
  }
};
