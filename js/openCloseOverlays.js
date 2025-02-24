/**
 * Opens the edit overlay for a specific contact.
 * @param {string} contactId - The ID of the contact.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} phone - The phone number of the contact.
 */
function openEditOverlay(contactId, name, email, phone) {
  document.getElementById("editOverlay").style.display = "flex";
  document.getElementById("editName").value = name;
  document.getElementById("editEmail").value = email;
  document.getElementById("editPhone").value = phone;
  document
    .getElementById("editContactForm")
    .setAttribute("data-contact-id", contactId);
}

/**
 * Opens the main overlay.
 */
function openOverlay() {
  let overlay = document.getElementById("overlay");
  overlay.classList.add("active");
  overlay.classList.remove("closing");
}

/**
 * Closes the main overlay with animation.
 */
function closeOverlay() {
  clearAddFormErrors();
  let overlay = document.getElementById("overlay");
  overlay.classList.add("closing");
  setTimeout(() => {
    overlay.classList.remove("active");
    overlay.classList.remove("closing");
  }, 500);
}

/**
 * Opens the edit overlay for a specific contact with delete functionality.
 * @param {string} contactId - The ID of the contact.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} phone - The phone number of the contact.
 */
function openEditOverlay(contactId, name, email, phone) {
  let overlay = document.getElementById("editOverlay");
  let deleteBtn = document.getElementById("contactDeleteButton");
  overlay.classList.add("active");
  overlay.classList.remove("closing");

  document.getElementById("editName").value = name;
  document.getElementById("editEmail").value = email;
  document.getElementById("editPhone").value = phone;

  document.getElementById("editContactForm").dataset.contactId = contactId;

  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      try {
        await deleteContact(contactId);
      } catch (err) {
        console.error("Delete failed:", err);
      }
      closeEditOverlay();
    };
  }
}

/**
 * Closes the edit overlay with animation.
 */
function closeEditOverlay() {
  clearEditFormErrors();
  let overlay = document.getElementById("editOverlay");
  overlay.classList.add("closing");
  setTimeout(() => {
    overlay.classList.remove("active");
    overlay.classList.remove("closing");
  }, 500);
}

/**
 * Opens the contact details section.
 */
function openContactDetails() {
  let contactDetails = document.getElementById("contact-details");
  contactDetails.style.display = "block";
}

/**
 * Closes the contact details section.
 */
function closeContactDetails() {
  let contactDetails = document.getElementById("contact-details");
  contactDetails.style.display = "none";
}

/**
 * Toggles the visibility of the "see more" links.
 */
function openSeeMore() {
  let contactLinks = document.getElementById("seeMoreLinks");
  contactLinks.style.display =
    contactLinks.style.display === "flex" ? "none" : "flex";
}

/**
 * Hides the "see more" links when clicking outside of them.
 * @param {Event} event - The click event.
 */
document.addEventListener("click", function (event) {
  const contactLinks = document.getElementById("seeMoreLinks");
  const button = document.getElementById("seeMoreButton");

  if (contactLinks && button) {
    if (
      contactLinks.style.display === "flex" &&
      !contactLinks.contains(event.target) &&
      !button.contains(event.target)
    ) {
      contactLinks.style.display = "none";
    }
  }
});

/**
 * Opens the board overlay for a specific task.
 * @param {string} taskId - The ID of the task to display.
 */
function openBoardOverlay(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;

  selectedTask = task;
  const overlay = document.getElementById("boardOverlay");
  const wasHidden = isOverlayHidden(overlay);

  overlay.classList.add("board_overlay_show");
  overlay.style.display = "flex";
  overlay.innerHTML = "";

  const contentDiv = createContentDiv(wasHidden);

  if (editingMode && editingTaskId === taskId) {
    setupEditMode(contentDiv, task);
  } else {
    contentDiv.innerHTML = taskBoardTemplate(task);
    overlay.appendChild(contentDiv);
  }
}

/**
 * Finds a task by its ID.
 * @param {string} taskId - The ID of the task.
 * @returns {Object|null} The found task or null if not found.
 */
function findTaskById(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error("Task not found!");
  }
  return task;
}

/**
 * Checks if the overlay is currently hidden.
 * @param {HTMLElement} overlay - The overlay element.
 * @returns {boolean} True if the overlay is hidden, false otherwise.
 */
function isOverlayHidden(overlay) {
  return overlay.style.display === "" || overlay.style.display === "none";
}

/**
 * Creates the content div for the overlay.
 * @param {boolean} wasHidden - Indicates if the overlay was hidden before.
 * @returns {HTMLElement} The created content div.
 */
function createContentDiv(wasHidden) {
  const contentDiv = document.createElement("div");
  contentDiv.className = "board_overlay_content";
  contentDiv.style.animationName = wasHidden ? "slideInFromRight" : "";
  return contentDiv;
}

/**
 * Sets up the edit mode in the overlay.
 * @param {HTMLElement} contentDiv - The content div for the overlay.
 * @param {Object} task - The task object to edit.
 */
function setupEditMode(contentDiv, task) {
  contentDiv.innerHTML = taskEditTemplate(task);
  document.getElementById("boardOverlay").appendChild(contentDiv);
  fillEditFormData(task);
}

/**
 * Closes the board overlay with animation.
 */
function closeBoardOverlay() {
  const overlay = document.getElementById("boardOverlay");
  const content = overlay.querySelector(".board_overlay_content");
  if (!content) {
    overlay.style.display = "none";
    return;
  }

  content.style.animationName = "slideOutToRight";
  content.addEventListener(
    "animationend",
    function handler() {
      overlay.classList.remove("board_overlay_show");
      overlay.style.display = "none";
      content.removeEventListener("animationend", handler);
      overlay.innerHTML = "";
    },
    { once: true }
  );
}

/**
 * Opens the add task overlay.
 */
function openAddTaskOverlay() {
  const overlay = document.getElementById("addTaskOverlay");
  if (!overlay) return;

  if (window.innerWidth <= 650) {
    window.location.href = "/html/addtask.html";
    return;
  }

  overlay.classList.add("active");
  const content = overlay.querySelector(".overlay_content");
  if (content) {
    content.classList.remove("slide-out");
    content.classList.add("slide-in");
  }
}

/**
 * Closes the add task overlay with animation.
 */
function closeAddTaskOverlay() {
  const overlay = document.getElementById("addTaskOverlay");
  if (!overlay) return;

  const content = overlay.querySelector(".overlay_content");
  if (!content) {
    overlay.classList.remove("active");
    return;
  }

  content.classList.remove("slide-in");
  content.classList.add("slide-out");

  content.addEventListener(
    "animationend",
    function handler() {
      overlay.classList.remove("active");
      content.classList.remove("slide-out");
      content.removeEventListener("animationend", handler);
    },
    { once: true }
  );
}

/**
 * Closes the add task overlay on click outside.
 */
const addTaskOverlay = document.getElementById("addTaskOverlay");
if (addTaskOverlay) {
  addTaskOverlay.addEventListener("click", function (e) {
    if (e.target === addTaskOverlay) {
      closeAddTaskOverlay();
    }
  });
}

/**
 * Closes the board overlay on click outside.
 */
const boardOverlay = document.getElementById("boardOverlay");
if (boardOverlay) {
  boardOverlay.addEventListener("click", (e) => {
    if (e.target === boardOverlay) {
      closeBoardOverlay();
    }
  });
}

/**
 * Closes the contact overlay on click outside.
 */
const contactOverlay = document.getElementById("overlay");
if (contactOverlay) {
  contactOverlay.addEventListener("click", (e) => {
    if (e.target === contactOverlay) {
      closeOverlay();
    }
  });
}

/**
 * Closes the edit overlay on click outside.
 */
const contactEditOverlay = document.getElementById("editOverlay");
if (contactEditOverlay) {
  contactEditOverlay.addEventListener("click", (e) => {
    if (e.target === contactEditOverlay) {
      closeEditOverlay();
    }
  });
}
