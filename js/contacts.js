let databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

let currentActiveContact = null;
let contactToDelete = null;

function init() {
  fetchContactsFromDatabase();
}

function getContactsPath() {
  if (isGuest()) {
    return `${databaseURL}/contacts`;
  }

  let user = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!user) {
    console.error("No logged-in user found.");
    return null;
  }
  return `${databaseURL}/users/${user.id}/contacts`;
}

async function fetchContactsFromDatabase() {
  try {
    let contactsPath = getContactsPath();
    if (!contactsPath) return;

    let response = await fetch(`${contactsPath}.json`);
    let contactsData = await response.json();

    let contactsArray = processContactsData(contactsData);
    renderContacts(contactsArray);
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
}

async function fetchGuestContacts() {
  try {
    let guestId = sessionStorage.getItem("guestSession");
    if (!guestId) {
      console.error("No guest session found.");
      return;
    }
    const contactsData = await getGuestContactsFromServer();

    let contactsArray = processContactsData(contactsData);
    renderContacts(contactsArray);
  } catch (error) {
    console.error("Error fetching guest contacts", error);
  }
}

async function getGuestContactsFromServer() {
  const response = await fetch(`${databaseURL}/contacts.json`);
  return await response.json();
}

function isGuest() {
  return sessionStorage.getItem("guestSession") !== null;
}

async function getContactsFromServer(userId) {
  let response = await fetch(`${databaseURL}/users/${userId}/contacts.json`);
  if (!response.ok) {
    throw new Error("Data can not be found");
  }
  return await response.json();
}

function processContactsData(contactsData) {
  if (!contactsData || typeof contactsData !== "object") {
    return [];
  }

  let contactsArray = Object.entries(contactsData).map(([id, data]) => ({
    id,
    ...data,
  }));

  contactsArray = contactsArray.filter((contact) => contact.name);
  contactsArray.sort((a, b) => a.name.localeCompare(b.name));

  return contactsArray;
}

async function renderContacts(contactsArray) {
  clearContactsList();

  if (!contactsArray || contactsArray.length === 0) {
    return;
  }

  let groupedContacts = groupContactsByLetter(contactsArray);
  renderGroupedContacts(groupedContacts);
}

function clearContactsList() {
  for (let letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    let section = document.getElementById(letter);
    if (section) {
      section.querySelector(".contacts").innerHTML = "";
    }
  }
}

function renderGroupedContacts(groupedContacts) {
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

  currentActiveContact = contactElement;

  showContactDetails(contactId, name, email, phone);
}

function showContactDetails(id, name, email, phone) {
  let detailsContainer = document.getElementById("contact-info");
  detailsContainer.innerHTML = "";

  detailsContainer.innerHTML += contactDetailsTemplate(id, name, email, phone);
}

function getContactInitials(fullName) {
  let initialEdit = document.getElementById("initials-edit");

  let initials = fullName
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  let bgColor = getColorForLetter(initials.charAt(0));
  initialEdit.innerHTML = `
    <div class="edit-initials" style="background-color: ${bgColor};">${initials}</div>
  `;

  return initials;
}

async function saveContactToDatabase(event) {
  event.preventDefault();

  let newContact = getContactFormData();
  clearContactForm();

  try {
    let contactsPath = getContactsPath();
    if (!contactsPath) return;

    let response = await fetch(`${contactsPath}.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newContact),
    });

    if (!response.ok) {
      throw new Error("Failed to save contact.");
    }

    let data = await response.json();
    showToast("Contact successfully created!");
    addContactToGroup(data.name, newContact);
    selectNewContact(data.name, newContact);
    closeOverlay();
  } catch (error) {
    console.error("Error saving contact:", error);
  }

  return false;
}

function getUserId() {
  let userId = JSON.parse(sessionStorage.getItem("loggedInUser"))?.id;
  if (!userId) {
    console.error("User ID not found in sessionStorage.");
  }
  return userId;
}

function addContactToGroup(contactId, contact) {
  let firstLetter = contact.name.charAt(0).toUpperCase();
  let section = document.getElementById(firstLetter);

  if (section) {
    section.querySelector(".contacts").innerHTML += contactsTemplate({
      id: contactId,
      ...contact,
    });
  } else {
    createNewGroup(firstLetter, contactId, contact);
  }
}

function selectNewContact(contactId, newContact) {
  let newContactElement = document.querySelector(
    `[data-contact-id="${contactId}"]`
  );
  if (newContactElement) {
    selectContact(
      newContactElement,
      contactId,
      newContact.name,
      newContact.email,
      newContact.phone
    );
  }
}

function getContactFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
  };
}

function clearContactForm() {
  document.getElementById("name").value =
    document.getElementById("email").value =
    document.getElementById("phone").value =
      "";
}

async function saveContactToServer(contact, userId) {
  let response = await fetch(`${databaseURL}/users/${userId}/contacts.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to save contact: ${errorData}`);
  }
  let data = await response.json();
  return data.name;
}

async function updateContact(contactId, name, email, phone) {
  let updatedContact = { name, email, phone };
  const contactsPath = getContactsPath();
  if (!contactsPath) return;

  try {
    const response = await fetch(`${contactsPath}/${contactId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedContact),
    });

    if (!response.ok) {
      throw new Error("Update Contact Failed.");
    }

    await fetchContactsFromDatabase(); // UI aktualisieren
  } catch (error) {
    console.error("Update Error:", error);
  }
}

async function submitEditForm(event) {
  event.preventDefault();

  let form = document.getElementById("editContactForm");
  let contactId = form.getAttribute("data-contact-id");
  let name = document.getElementById("editName").value.trim();
  let email = document.getElementById("editEmail").value.trim();
  let phone = document.getElementById("editPhone").value.trim();

  await updateContact(contactId, name, email, phone);

  closeEditOverlay();
  await fetchContactsFromDatabase();
  restoreActiveContact(contactId, name, email, phone);
}

function restoreActiveContact(contactId, name, email, phone) {
  let contactElement = document.getElementById(`contact-${contactId}`);

  if (contactElement) {
    contactElement.classList.add("is-Active");
    currentActiveContact = contactElement;
  }

  showContactDetails(contactId, name, email, phone);
}

async function deleteContact(contactId) {
  if (!contactId) return;

  try {
    const contactsPath = getContactsPath();
    if (!contactsPath) return;

    const response = await fetch(`${contactsPath}/${contactId}.json`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete contact: ${response.statusText}`);
    }

    document.getElementById("contact-info").innerHTML = "";
    await fetchContactsFromDatabase();
  } catch (error) {
    console.error("Error deleting contact:", error);
  }
}

async function deleteGuestContacts(contactId) {
  const response = await fetch(`${databaseURL}/contacts/${contactId}.json`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to delete contact with ID ${contactId}: ${response.statusText}`
    );
  }
}

async function deleteContactFromServer(userId, contactId) {
  const response = await fetch(
    `${databaseURL}/users/${userId}/contacts/${contactId}.json`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to delete contact with ID ${contactId}: ${response.statusText}`
    );
  }
}

function toggleRespMenu() {
  let menu = document.getElementById("resp_menu");
  menu.classList.toggle("resp_menu_closed");
  menu.classList.toggle("resp_menu_open");
}

function showToast(message) {
  const notification = document.getElementById("add_notification");
  notification.textContent = message;
  notification.classList.add("show");
  notification.style.right = "-50px";
  notification.style.bottom = "150px";
  notification.offsetHeight;
  notification.style.transition = "right 0.3s ease-in-out";
  notification.style.right = "150px";
  setTimeout(() => {
    notification.style.transition = "right 0.3s ease-in-out";
    notification.style.right = "-500px";
  }, 3000);
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3300);
}
