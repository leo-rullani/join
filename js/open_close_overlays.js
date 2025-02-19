/*Contacts Overlays */

function openEditOverlay(contactId, name, email, phone) {
  document.getElementById("editOverlay").style.display = "flex";

  document.getElementById("editName").value = name;
  document.getElementById("editEmail").value = email;
  document.getElementById("editPhone").value = phone;

  document
    .getElementById("editContactForm")
    .setAttribute("data-contact-id", contactId);
}

function closeEditOverlay() {
  document.getElementById("editOverlay").style.display = "none";
}

function openOverlay() {
  let overlay = document.getElementById("overlay");
  overlay.classList.add("active");
  overlay.classList.remove("closing");
}

function closeOverlay() {
  let overlay = document.getElementById("overlay");
  overlay.classList.add("closing");

  setTimeout(() => {
    overlay.classList.remove("active");
    overlay.classList.remove("closing");
  }, 500);
}

function openEditOverlay(contactId, name, email, phone) {
  let overlay = document.getElementById("editOverlay");
  overlay.classList.add("active");
  overlay.classList.remove("closing");

  document.getElementById("editName").value = name;
  document.getElementById("editEmail").value = email;
  document.getElementById("editPhone").value = phone;

  document.getElementById("editContactForm").dataset.contactId = contactId;
}

function closeEditOverlay() {
  let overlay = document.getElementById("editOverlay");
  overlay.classList.add("closing");

  setTimeout(() => {
    overlay.classList.remove("active");
    overlay.classList.remove("closing");
  }, 500);
}

function openContactDetails() {
  let contactDetails = document.getElementById("contact-details");
  contactDetails.style.display = "block";
}

function closeContactDetails() {
  let contactDetails = document.getElementById("contact-details");
  contactDetails.style.display = "none";
}

function openSeeMore() {
  let contactLinks = document.getElementById("seeMoreLinks");

  if (contactLinks.style.display === "flex") {
    contactLinks.style.display = "none";
  } else {
    contactLinks.style.display = "flex";
  }
}

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

/*Board Overlays */

function openBoardOverlay(taskId) {
  console.log("Opening overlay for Task ID:", taskId);

  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error("Task not found!");
    return;
  }
  selectedTask = task;

  const overlay = document.getElementById("boardOverlay");

  const wasHidden =
    overlay.style.display === "" || overlay.style.display === "none";

  overlay.classList.add("board_overlay_show");
  overlay.style.display = "flex";

  overlay.innerHTML = "";

  const contentDiv = document.createElement("div");
  contentDiv.className = "board_overlay_content";

  if (wasHidden) {
    contentDiv.style.animationName = "slideInFromRight";
  } else {
    contentDiv.style.animationName = "";
  }

  if (editingMode && editingTaskId === taskId) {
    contentDiv.innerHTML = taskEditTemplate(task);
    overlay.appendChild(contentDiv);
    fillEditFormData(task);
  } else {
    contentDiv.innerHTML = taskBoardTemplate(task);
    overlay.appendChild(contentDiv);
  }
}

/* To close all overlays with a click on desktop*/

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

const addTaskOverlay = document.getElementById("addTaskOverlay");
if (addTaskOverlay) {
  addTaskOverlay.addEventListener("click", function (e) {
    if (e.target === addTaskOverlay) {
      closeAddTaskOverlay();
    }
  });
}

const boardOverlay = document.getElementById("boardOverlay");
if (boardOverlay) {
  boardOverlay.addEventListener("click", (e) => {
    if (e.target === boardOverlay) {
      closeBoardOverlay();
    }
  });
}

const contactOverlay = document.getElementById("overlay");
if (contactOverlay) {
  contactOverlay.addEventListener("click", (e) => {
    if (e.target === contactOverlay) {
      closeOverlay();
    }
  });
}

const contactEditOverlay = document.getElementById("editOverlay");
if (contactEditOverlay) {
  contactEditOverlay.addEventListener("click", (e) => {
    if (e.target === contactEditOverlay) {
      closeEditOverlay();
    }
  });
}
