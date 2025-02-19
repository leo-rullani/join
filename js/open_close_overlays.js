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
  // ========== 1) Mobile-Menu / "seeMoreLinks" ==========
  const contactLinks = document.getElementById("seeMoreLinks");
  const button = document.getElementById("seeMoreButton");

  // Prüfe zuerst, ob die Elemente existieren:
  if (contactLinks && button) {
    // Nur wenn das Menü überhaupt offen ist (z.B. display === "flex")
    // und der Klick außerhalb von contactLinks + Button passiert, schließen.
    if (
      contactLinks.style.display === "flex" &&
      !contactLinks.contains(event.target) &&
      !button.contains(event.target)
    ) {
      contactLinks.style.display = "none";
    }
  }

  // ========== 2) Alle Overlays schließen, wenn man außerhalb klickt ==========
  // Voraussetzung: Alle Overlays haben eine gemeinsame Klasse, z.B. "overlay"
  // und man verwendet z.B. overlay.style.display = "block" / "none" zum Anzeigen.
  const allOverlays = document.querySelectorAll(".closeTheOverlay");
  allOverlays.forEach((overlay) => {
    // Nur wenn Overlay sichtbar ist:
    if (
      overlay.style.display !== "none" &&
      overlay.style.display !== "" &&
      !overlay.contains(event.target)
    ) {
      overlay.style.display = "none";
    }
  });
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

  // The main overlay div
  const overlay = document.getElementById("boardOverlay");

  // Detect if overlay is hidden => then we do "slideInFromRight"
  const wasHidden =
    overlay.style.display === "" || overlay.style.display === "none";

  overlay.classList.add("board_overlay_show");
  overlay.style.display = "flex";

  // Clear any old content
  overlay.innerHTML = "";

  // Create a new content .board_overlay_content
  const contentDiv = document.createElement("div");
  contentDiv.className = "board_overlay_content";

  if (wasHidden) {
    // Only animate if we are actually opening from hidden
    contentDiv.style.animationName = "slideInFromRight";
  } else {
    // No animation if we are just switching detail <-> edit
    contentDiv.style.animationName = "";
  }

  // If in edit mode (and for the same task), show edit form
  if (editingMode && editingTaskId === taskId) {
    contentDiv.innerHTML = taskEditTemplate(task);
    overlay.appendChild(contentDiv);
    fillEditFormData(task);
  } else {
    // Otherwise, show detail
    contentDiv.innerHTML = taskBoardTemplate(task);
    overlay.appendChild(contentDiv);
  }
}
/****************************************
 * closeBoardOverlay()
 * - Closes with animation
 * - DOES NOT reset editingMode so that
 *   next time we open the same task,
 *   it remains in edit mode if we left it so.
 ****************************************/
function closeBoardOverlay() {
  const overlay = document.getElementById("boardOverlay");
  const content = overlay.querySelector(".board_overlay_content");
  if (!content) {
    overlay.style.display = "none";
    return;
  }

  // Animate closing
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
