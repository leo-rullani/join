"use strict";

/**
 * Initializes the summary page by loading task data and setting user information.
 * @returns {Promise<void>}
 */
async function initSummaryPage() {
  await getTaskSummary();
  const elements = getUserElements();
  if (!elements.headerName || !elements.greetingDiv) {
    console.error("Elements not found!");
    return;
  }
  const userInfo = getUserInfo();
  updateUserElements(elements, userInfo);
  finalizeInitialization();
}

/**
 * Retrieves the DOM elements required for the summary page.
 * @returns {Object} An object containing headerName and greetingDiv elements.
 */
function getUserElements() {
  const headerName = document.getElementById("userName"),
    greetingDiv = document.getElementById("userName");
  return { headerName, greetingDiv };
}

/**
 * Retrieves and parses user information from session storage.
 * @returns {Object} An object containing userName and textColor.
 */
function getUserInfo() {
  const userData = sessionStorage.getItem("loggedInUser"),
    isGuest = !userData,
    user = isGuest ? { userName: "Guest" } : JSON.parse(userData),
    userName = user.userName || "User",
    { textColor } = getProfileData(isGuest);
  return { userName, textColor };
}

/**
 * Updates the header and greeting elements with the user information.
 * @param {Object} elements - Contains headerName and greetingDiv.
 * @param {Object} userInfo - Contains userName and textColor.
 */
function updateUserElements(
  { headerName, greetingDiv },
  { userName, textColor }
) {
  headerName.style.color = textColor;
  greetingDiv.textContent = userName;
  headerName.textContent = userName;
}

/**
 * Finalizes the page initialization by setting the greeting,
 * initializing overlay checks, and making the body visible.
 */
function finalizeInitialization() {
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
 * Retrieves the greeting overlay and related elements from the DOM.
 * @returns {Object|null} Object containing overlay and text elements, or null if the overlay is not found.
 */
function getGreetingElements() {
  const ov = document.getElementById("greetingOverlay");
  if (!ov) return null;
  const ogt = document.getElementById("overlayGreetingText"),
    ogn = document.getElementById("overlayGreetingName"),
    gt = document.getElementById("greeting_text"),
    un = document.getElementById("userName");
  return { ov, ogt, ogn, gt, un };
}

/**
 * Updates the greeting overlay content based on the main page elements.
 * @param {Object} elems - The object containing overlay text elements.
 */
function updateGreetingContent({ ogt, ogn, gt, un }) {
  if (ogt && gt) {
    ogt.textContent = gt.textContent;
  }
  if (ogn && un) {
    ogn.textContent = un.textContent;
    ogn.style.color = un.style.color;
  }
}

/**
 * Animates the greeting overlay with a fade out effect.
 * @param {HTMLElement} ov - The greeting overlay element.
 */
function animateGreetingOverlay(ov) {
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
 * Displays the greeting overlay by updating its content and triggering the fade-out animation.
 */
function showGreetingOverlay() {
  const elems = getGreetingElements();
  if (!elems) return;
  updateGreetingContent(elems);
  animateGreetingOverlay(elems.ov);
}

/**
 * Retrieves the logged in user from session storage.
 * @returns {Object|null} The user object, or null if not logged in.
 */
function getLoggedInUser() {
  const ud = sessionStorage.getItem("loggedInUser");
  if (!ud) return null;
  return JSON.parse(ud);
}

/**
 * Retrieves logout overlay elements from the DOM.
 * @returns {Object|null} Object containing overlay, text, and name elements, or null if any are missing.
 */
function getLogoutElements() {
  const ov = document.getElementById("goodNightOverlay"),
    gnt = document.getElementById("goodNightText"),
    gnn = document.getElementById("goodNightName");
  if (!ov || !gnt || !gnn) return null;
  return { ov, gnt, gnn };
}

/**
 * Animates the logout overlay and completes the logout process.
 * @param {Object} elements - Contains overlay (ov) and name element (gnn).
 * @param {string} userName - The user's name to display.
 */
function animateLogoutOverlay({ ov, gnn }, userName) {
  gnn.textContent = userName;
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
 * Logs out the current user by animating the overlay and redirecting to the login page.
 */
function logout() {
  const user = getLoggedInUser();
  if (!user) {
    window.location.href = "/html/login.html";
    return;
  }
  const userName = user.userName || "User";
  const elements = getLogoutElements();
  if (!elements) {
    window.location.href = "/html/login.html";
    return;
  }
  animateLogoutOverlay(elements, userName);
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
