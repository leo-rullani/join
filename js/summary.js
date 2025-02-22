"use strict";

/**
 * Initializes the summary page by loading task data and setting user information.
 * @returns {Promise<void>}
 */
async function initSummaryPage() {
  await getTaskSummary();
  const headerName = document.getElementById("userName"),
    greetingDiv = document.getElementById("userName"),
    userData = sessionStorage.getItem("loggedInUser");
  if (!headerName || !greetingDiv) {
    console.error("Elements not found!");
    return;
  }
  const isGuest = !userData,
    user = isGuest ? { userName: "Guest" } : JSON.parse(userData),
    userName = user.userName || "User",
    { textColor } = getProfileData(isGuest);
  headerName.style.color = textColor;
  greetingDiv.textContent = userName;
  headerName.textContent = userName;
  setGreeting();
  initOverlayCheck();
  document.body.style.visibility = "visible";
}

/**
 * Fetches task data and updates the summary.
 * @returns {Promise<void>}
 */
async function getTaskSummary() {
  try {
    const loadedTasks = await window.getTasks();
    const summary = initializeSummary();

    loadedTasks.forEach((task) => {
      updateSummary(summary, task);
    });

    displayTaskSummary(summary, loadedTasks);
  } catch (error) {
    console.error("Fehler beim Abrufen der Task-Übersicht:", error);
  }
}

/**
 * Initializes the summary object.
 * @returns {{ todo: number, doing: number, feedback: number, done: number, urgent: number, urgentDueDates: string[] }}
 */
function initializeSummary() {
  return {
    todo: 0,
    doing: 0,
    feedback: 0,
    done: 0,
    urgent: 0,
    urgentDueDates: [],
  };
}

/**
 * Updates the summary based on the provided task.
 * @param {{ todo: number, doing: number, feedback: number, done: number, urgent: number, urgentDueDates: string[] }} summary
 * @param {{ boardCategory: string, priority: string, date: string }} task
 */
function updateSummary(summary, task) {
  if (summary[task.boardCategory] !== undefined) {
    summary[task.boardCategory]++;
  }

  if (task.priority === "urgent") {
    summary.urgent++;
    addUrgentDueDate(summary, task);
  }
}

/**
 * Adds the due date of an urgent task to the summary.
 * @param {{ urgentDueDates: string[] }} summary
 * @param {{ date: string }} task
 */
function addUrgentDueDate(summary, task) {
  if (task.date) {
    summary.urgentDueDates.push(
      new Date(task.date).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    );
  }
}

/**
 * Displays the task summary on the UI.
 * @param {{ todo: number, doing: number, feedback: number, done: number, urgent: number, urgentDueDates: string[] }} summary
 * @param {Array} tasks
 */
function displayTaskSummary(summary, tasks) {
  const elTodo = document.getElementById("summary-todo");
  if (!elTodo) return;

  elTodo.textContent = summary.todo;
  document.getElementById("summary-doing").textContent = summary.doing;
  document.getElementById("summary-feedback").textContent = summary.feedback;
  document.getElementById("summary-done").textContent = summary.done;
  document.getElementById("summary-urgent").textContent = summary.urgent;
  document.getElementById("summary-complete").textContent = tasks.length;

  if (summary.urgentDueDates.length > 0) {
    document.getElementById("summary-urgent-dates").innerHTML =
      summary.urgentDueDates.join("<br>");
  } else {
    document.getElementById("summary-urgent-dates").textContent =
      "No urgent tasks";
  }
}

/**
 * Returns profile data for the user.
 * @param {boolean} isGuest - True if no user data is found
 * @returns {{ initials: string, textColor: string, userName: string }}
 */
function getProfileData(isGuest) {
  const ud = sessionStorage.getItem("loggedInUser"),
    u = isGuest ? { userName: "Guest" } : JSON.parse(ud || "{}"),
    nm = u.userName || "User",
    init = isGuest ? "G" : getInitials(nm),
    first = init.charAt(0).toUpperCase(),
    clr = getColorForLetter(first);
  return { initials: init, textColor: clr, userName: nm };
}

/**
 * Sets the greeting based on the current time of day.
 */
function setGreeting() {
  const greetingText = document.getElementById("greeting_text"),
    h = new Date().getHours();
  let g = "Good night,";
  if (h >= 5 && h < 12) g = "Good morning,";
  else if (h >= 12 && h < 18) g = "Good afternoon,";
  else if (h >= 18 && h < 22) g = "Good evening,";
  if (greetingText) greetingText.textContent = g;
}

/**
 * Checks the screen size and shows the greeting overlay if within range.
 */
function initOverlayCheck() {
  const w = window.innerWidth;
  if (w <= 910 && w >= 300) showGreetingOverlay();
}

/**
 * Displays the greeting overlay and hides it after a delay.
 */
function showGreetingOverlay() {
  const ov = document.getElementById("greetingOverlay");
  if (!ov) return;
  const ogt = document.getElementById("overlayGreetingText"),
    ogn = document.getElementById("overlayGreetingName"),
    gt = document.getElementById("greeting_text"),
    un = document.getElementById("userName");
  if (ogt && gt) ogt.textContent = gt.textContent;
  if (ogn && un) {
    ogn.textContent = un.textContent;
    ogn.style.color = un.style.color;
  }
  ov.classList.remove("hidden");
  setTimeout(() => {
    ov.classList.add("fadeOut");
    setTimeout(() => {
      ov.classList.add("hidden");
      ov.classList.remove("fadeOut");
    }, 500);
  }, 2000);
}

/**
 * Logs out the user or redirects a guest to the login page.
 */
function logout() {
  const ud = sessionStorage.getItem("loggedInUser");
  if (!ud) {
    window.location.href = "/html/login.html";
    return;
  }
  const u = JSON.parse(ud),
    n = u.userName || "User",
    ov = document.getElementById("goodNightOverlay"),
    gnt = document.getElementById("goodNightText"),
    gnn = document.getElementById("goodNightName");
  if (!ov || !gnt || !gnn) {
    window.location.href = "/html/login.html";
    return;
  }
  gnn.textContent = n;
  ov.classList.remove("hidden");
  setTimeout(() => {
    ov.classList.add("fadeOut");
    setTimeout(() => {
      ov.classList.add("hidden");
      ov.classList.remove("fadeOut");
      sessionStorage.removeItem("loggedInUser");
      window.location.href = "/html/login.html";
    }, 500);
  }, 2000);
}

/**
 * Extracts initials from a full name.
 * @param {string} name - The full name
 * @returns {string} The uppercase initials
 */
function getInitials(name) {
  if (typeof name !== "string" || !name.trim()) return "U";
  const p = name.trim().split(" ");
  let i = p[0].charAt(0).toUpperCase();
  if (p.length > 1) i += p[p.length - 1].charAt(0).toUpperCase();
  return i;
}

/**
 * Returns a color code based on the first letter.
 * @param {string} l - The first letter
 * @returns {string} The corresponding hex color
 */
function getColorForLetter(l) {
  const m = {
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
  return m[l] || "#000";
}
