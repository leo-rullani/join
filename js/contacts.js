"use strict";

/** The base URL for the Firebase Realtime Database. */
let databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

/** Stores the currently active contact DOM element. */
let currentActiveContact = null;
/** Stores the contact ID to be deleted. */
let contactToDelete = null;

/**
 * Initializes the application by fetching contacts from the database.
 * @returns {void}
 */
function init() {
  fetchContactsFromDatabase();
}

/**
 * Determines the path to the contacts resource based on whether the user is a guest.
 * @returns {string|null} The contacts path URL, or null if no user is found.
 */
function getContactsPath() {
  if (isGuest()) {
    return `${databaseURL}/contacts`;
  }
  let user = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!user) {
    console.error("No logged-in user found.");
    return null;
  }
  return `${databaseURL}/contacts`;
}

/**
 * Fetches contacts from the database, processes them, and renders them.
 * @returns {Promise<void>}
 */
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

/**
 * Fetches contacts for a guest user and renders them.
 * @returns {Promise<void>}
 */
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

/**
 * Retrieves guest contacts from the server (Firebase).
 * @returns {Promise<Object>} The raw contacts data from the server.
 */
async function getGuestContactsFromServer() {
  const response = await fetch(`${databaseURL}/contacts.json`);
  return await response.json();
}

/**
 * Checks if the current user is a guest.
 * @returns {boolean} True if the user is a guest, otherwise false.
 */
function isGuest() {
  return sessionStorage.getItem("guestSession") !== null;
}

/**
 * Fetches contacts for a specific logged-in user from the server.
 * @param {string} userId - The ID of the logged-in user.
 * @returns {Promise<Object>} The raw contacts data for the given user.
 * @throws {Error} If the fetch operation fails.
 */
async function getContactsFromServer(userId) {
  let response = await fetch(`${databaseURL}/users/${userId}/contacts.json`);
  if (!response.ok) {
    throw new Error("Data can not be found");
  }
  return await response.json();
}

/**
 * Processes the raw contacts data into an array, filtering and sorting by name.
 * @param {Object} contactsData - The raw contacts data object from Firebase.
 * @returns {Array<Object>} An array of contact objects.
 */
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

/**
 * Renders an array of contacts by grouping them and inserting into the DOM.
 * @param {Array<Object>} contactsArray - The processed array of contacts.
 * @returns {Promise<void>}
 */
async function renderContacts(contactsArray) {
  clearContactsList();

  if (!contactsArray || contactsArray.length === 0) {
    return;
  }

  let groupedContacts = groupContactsByLetter(contactsArray);
  renderGroupedContacts(groupedContacts);
}

/**
 * Clears the contact list in the DOM for each letter section.
 * @returns {void}
 */
function clearContactsList() {
  for (let letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    let section = document.getElementById(letter);
    if (section) {
      section.querySelector(".contacts").innerHTML = "";
    }
  }
}

/**
 * Renders grouped contacts into their respective letter sections in the DOM.
 * @param {Object} groupedContacts - An object where each key is a letter and its value is an array of contacts.
 * @returns {void}
 */
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

/**
 * Groups contacts by their first letter.
 * @param {Array<Object>} contacts - The array of contact objects.
 * @returns {Object} An object with letters as keys and arrays of contacts as values.
 */
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

/**
 * Selects a contact and highlights it in the UI, then displays its details.
 * @param {HTMLElement} contactElement - The DOM element representing the contact.
 * @param {string} contactId - The ID of the contact.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} phone - The phone number of the contact.
 * @returns {void}
 */
function selectContact(contactElement, contactId, name, email, phone) {
  if (currentActiveContact !== null) {
    currentActiveContact.classList.remove("is-Active");
  }

  contactElement.classList.add("is-Active");
  currentActiveContact = contactElement;
  showContactDetails(contactId, name, email, phone);
}

/**
 * Displays the contact details in the designated UI section.
 * @param {string} id - The contact ID.
 * @param {string} name - The contact name.
 * @param {string} email - The contact email.
 * @param {string} phone - The contact phone number.
 * @returns {void}
 */
function showContactDetails(id, name, email, phone) {
  let detailsContainer = document.getElementById("contact-info");
  detailsContainer.innerHTML = "";
  detailsContainer.innerHTML += contactDetailsTemplate(id, name, email, phone);
}

/**
 * Returns the initials for a given full name and sets the background color.
 * @param {string} fullName - The full name of the contact.
 * @returns {string} The initials derived from the full name.
 */
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

/**
 * Saves a new contact to the database based on the form data.
 * @param {Event} event - The form submission event.
 * @returns {boolean} False to prevent default form submission.
 */
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

/**
 * Retrieves the logged-in user's ID from sessionStorage.
 * @returns {string|undefined} The user ID, or undefined if not found.
 */
function getUserId() {
  let userId = JSON.parse(sessionStorage.getItem("loggedInUser"))?.id;
  if (!userId) {
    console.error("User ID not found in sessionStorage.");
  }
  return userId;
}

/**
 * Adds a contact to the UI group section, creating the section if needed.
 * @param {string} contactId - The ID of the newly created contact.
 * @param {Object} contact - The contact data object.
 * @returns {void}
 */
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

/**
 * Selects the newly created contact in the UI.
 * @param {string} contactId - The ID of the newly created contact.
 * @param {Object} newContact - The new contact data object.
 * @returns {void}
 */
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

/**
 * Retrieves the contact form data (name, email, phone) from the DOM.
 * @returns {Object} The contact form data object.
 */
function getContactFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
  };
}

/**
 * Clears the contact form inputs.
 * @returns {void}
 */
function clearContactForm() {
  document.getElementById("name").value =
    document.getElementById("email").value =
    document.getElementById("phone").value =
      "";
}

/**
 * Saves a contact to the server for a specific user.
 * @param {Object} contact - The contact data.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string>} The Firebase-generated ID for the new contact.
 * @throws {Error} If the contact could not be saved.
 */
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

/**
 * Updates an existing contact in the database.
 * @param {string} contactId - The ID of the contact to update.
 * @param {string} name - The updated name.
 * @param {string} email - The updated email.
 * @param {string} phone - The updated phone number.
 * @returns {Promise<void>}
 */
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

    await fetchContactsFromDatabase();
  } catch (error) {
    console.error("Update Error:", error);
  }
}

/**
 * Handles the edit contact form submission.
 * @param {Event} event - The form submission event.
 * @returns {Promise<void>}
 */
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

/**
 * Restores the active contact style and re-displays its details after editing.
 * @param {string} contactId - The ID of the contact.
 * @param {string} name - The contact's name.
 * @param {string} email - The contact's email.
 * @param {string} phone - The contact's phone number.
 * @returns {void}
 */
function restoreActiveContact(contactId, name, email, phone) {
  let contactElement = document.getElementById(`contact-${contactId}`);
  if (contactElement) {
    contactElement.classList.add("is-Active");
    currentActiveContact = contactElement;
  }
  showContactDetails(contactId, name, email, phone);
}

/**
 * Deletes a contact from the database.
 * @param {string} contactId - The ID of the contact to be deleted.
 * @returns {Promise<void>}
 */
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

/**
 * Deletes a guest contact from the global contacts path in Firebase.
 * @param {string} contactId - The ID of the contact to delete.
 * @returns {Promise<void>}
 * @throws {Error} If the contact cannot be deleted.
 */
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

/**
 * Deletes a contact from the server for a specific user.
 * @param {string} userId - The user's ID.
 * @param {string} contactId - The contact's ID to delete.
 * @returns {Promise<void>}
 * @throws {Error} If the contact cannot be deleted.
 */
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
