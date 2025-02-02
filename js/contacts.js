let databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

let currentActiveContact = null;
let contactToDelete = null;

function init() {
  fetchContactsFromDatabase();
}

async function fetchContactsFromDatabase() {
  try {
    let response = await fetch(`${databaseURL}/contacts.json`);
    if (!response.ok) {
      throw new Error("Data can not be found");
    }
    let contactsData = await response.json();
    console.log("Fetched contacts data:", contactsData);

    if (!contactsData || typeof contactsData !== "object") {
      renderContacts([]);
    }

    let contactsArray = Object.entries(contactsData).map(([id, data]) => ({
      id,
      ...data,
    }));

    console.log("Converted contacts array:", contactsArray);
    contactsArray.sort((a, b) => a.name.localeCompare(b.name));

    renderContacts(contactsArray);
  } catch (error) {
    console.error("Error: Contacts can not be found", error);
  }
}

async function renderContacts(contactsArray) {
  let contentRef = document.getElementById("phonebook");

  for (let letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    let section = document.getElementById(letter);
    if (section) {
      section.querySelector(".contacts").innerHTML = "";
    }
  }

  if (!contactsArray || contactsArray.length === 0) {
    contentRef.innerHTML = "No Contacts";
    return;
  }

  console.log("Rendering contacts:", contactsArray);

  let groupedContacts = groupContactsByLetter(contactsArray);
  Object.keys(groupedContacts).forEach((letter) => {
    let section = document.getElementById(letter);
    if (section) {
      let contactsContainer = section.querySelector(".contacts");
      groupedContacts[letter].forEach((contact) => {
        contactsContainer.innerHTML += contactsTemplate(contact);
      });
    }
  });
}

function groupContactsByLetter(contacts) {
  let grouped = {};

  contacts.forEach((contact) => {
    let firstLetter = contact.name.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(contact);
  });

  return grouped;
}

function selectContact(contactElement, contactId, name, email, phone) {
  if (currentActiveContact !== null) {
    currentActiveContact.classList.remove("is-Active");
  }

  contactElement.classList.add("is-Active");

  showContactDetails(contactId, name, email, phone);

  currentActiveContact = contactElement;
}

function showContactDetails(id, name, email, phone) {
  let detailsContainer = document.getElementById("contact-info");
  detailsContainer.innerHTML = "";

  detailsContainer.innerHTML += contactDetailsTemplate(id, name, email, phone);
}

function getInitials(fullName) {
  let names = fullName.trim().split(" ");
  let initials = names.map((name) => name.charAt(0).toUpperCase()).join("");
  let bgColor = getColorForLetter(initials.charAt(0));
  document.getElementById(
    "initials"
  ).innerHTML = `<div class="contact-initials big-initials" style="background-color: ${bgColor};">${initials}</div>`;
  return initials;
}

function getColorForLetter(letter) {
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

  let upperLetter = letter.toUpperCase();
  return colors[upperLetter] || "#999999";
}

async function saveContactToDatabase(event) {
  event.preventDefault();
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let phone = document.getElementById("phone").value.trim();
  document.getElementById("name").value =
    document.getElementById("email").value =
    document.getElementById("phone").value =
      "";

  let newContact = { name, email, phone };

  try {
    let response = await fetch(`${databaseURL}/contacts.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newContact),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to save contact: ${errorData}`);
    }

    console.log("Contact saved successfully!");
    fetchContactsFromDatabase();
    closeOverlay();
  } catch (error) {
    console.error("Error saving contact:", error);
  }
  return false;
}

async function updateContact(contactId, name, email, phone) {
  let updatedContact = { name, email, phone };

  try {
    let response = await fetch(`${databaseURL}/contacts/${contactId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedContact),
    });

    if (!response.ok) {
      throw new Error("Fehler beim Aktualisieren des Kontakts.");
    }

    console.log("Kontakt erfolgreich aktualisiert!");
    fetchContactsFromDatabase();
  } catch (error) {
    console.error("Fehler beim Aktualisieren:", error);
  }
}

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

function submitEditForm(event) {
  event.preventDefault();

  let form = document.getElementById("editContactForm");
  let contactId = form.getAttribute("data-contact-id");
  let name = document.getElementById("editName").value.trim();
  let email = document.getElementById("editEmail").value.trim();
  let phone = document.getElementById("editPhone").value.trim();

  updateContact(contactId, name, email, phone);
  closeEditOverlay();
}

async function deleteContact(contactId) {
  if (contactId) {
    try {
      console.log(`Deleting contact with ID: ${contactId}`);

      const response = await fetch(
        `${databaseURL}/contacts/${contactId}.json`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete contact with ID ${contactId}: ${response.statusText}`
        );
      }

      console.log("Contact successfully deleted!");

      fetchContactsFromDatabase();
    } catch (error) {
      console.error("Error during deletion:", error);
      alert(
        "There was a problem deleting the contact. Please try again later."
      );
    }
  }
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
