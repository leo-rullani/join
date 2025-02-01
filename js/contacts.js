let databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

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
  let contentRef = document.getElementById("contacts");
  contentRef.innerHTML = "";

  if (!contactsArray || contactsArray.length === 0) {
    contentRef.innerHTML = "No Contacts";
    return;
  }

  console.log("Rendering contacts:", contactsArray);

  contactsArray.forEach((contact) => {
    contentRef.innerHTML += contactsTemplate(contact);
  });
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
