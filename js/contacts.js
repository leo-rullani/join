let databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

let currentActiveContact = null;

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

function selectContact(contactElement, name, email, phone) {
  if (currentActiveContact !== null) {
    currentActiveContact.classList.remove("is-Active");
  }

  contactElement.classList.add("is-Active");
  showContactDetails(name, email, phone);
  currentActiveContact = contactElement;
}

function showContactDetails(name, email, phone) {
  let detailsContainer = document.getElementById("contact-info");
  detailsContainer.innerHTML = "";

  detailsContainer.innerHTML += contactDetailsTemplate(name, email, phone);
}

function getInitials(fullName) {
  let names = fullName.trim().split(" ");
  let initials = names.map((name) => name.charAt(0).toUpperCase()).join("");
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

async function updateContact(id, name, email, phone) {
  let updatedContact = { name, email, phone };

  try {
    let response = await fetch(`${databaseURL}/contacts/${id}.json`, {
      method: "PATCH",
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

async function deleteContact(id) {
  try {
    let response = await fetch(`${databaseURL}/contacts/${id}.json`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Fehler beim Löschen des Kontakts.");
    }

    console.log("Kontakt erfolgreich gelöscht!");
    fetchContactsFromDatabase();
  } catch (error) {
    console.error("Fehler beim Löschen:", error);
  }
}

function openOverlay() {
  document.getElementById("overlay").style.display = "flex";
}

function closeOverlay() {
  document.getElementById("overlay").style.display = "none";
}
