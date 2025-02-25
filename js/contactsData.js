"use strict";

/** The base URL for the Firebase Realtime Database. */
window.databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Checks if the current user is a guest.
 * @returns {boolean} True if the user is a guest, otherwise false.
 */
window.isGuest = function () {
  return sessionStorage.getItem("guestSession") !== null;
};

/**
 * Determines the path to the contacts resource based on whether the user is a guest.
 * @returns {string|null} The contacts path URL, or null if no user is found.
 */
window.getContactsPath = function () {
  if (window.isGuest()) {
    return `${window.databaseURL}/contacts`;
  }
  let user = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!user) {
    console.error("No logged-in user found.");
    return null;
  }
  return `${window.databaseURL}/contacts`;
};

/**
 * Retrieves guest contacts from the server.
 * @returns {Promise<Object>} The raw contacts data from the server.
 */
window.getGuestContactsFromServer = async function () {
  const response = await fetch(`${window.databaseURL}/contacts.json`);
  return await response.json();
};

/**
 * Fetches contacts for a specific logged-in user from the server.
 * @param {string} userId - The ID des eingeloggten Benutzers.
 * @returns {Promise<Object>} The raw contacts data.
 * @throws {Error} If the fetch operation fails.
 */
window.getContactsFromServer = async function (userId) {
  let response = await fetch(
    `${window.databaseURL}/users/${userId}/contacts.json`
  );
  if (!response.ok) {
    throw new Error("Data can not be found");
  }
  return await response.json();
};

/**
 * Processes the raw contacts data into a sorted array.
 * @param {Object} contactsData - The raw contacts data object from Firebase.
 * @returns {Array<Object>} An array of contact objects.
 */
window.processContactsData = function (contactsData) {
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
};

/**
 * Fetches contacts data from the database and returns a processed array.
 * @returns {Promise<Array<Object>>} The array of contacts.
 */
window.fetchContactsData = async function () {
  try {
    let contactsPath = window.getContactsPath();
    if (!contactsPath) return [];
    let response = await fetch(`${contactsPath}.json`);
    let contactsData = await response.json();
    return window.processContactsData(contactsData);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
};

/**
 * Fetches guest contacts data and returns a processed array.
 * @returns {Promise<Array<Object>>} The array of guest contacts.
 */
window.fetchGuestContactsData = async function () {
  try {
    let guestId = sessionStorage.getItem("guestSession");
    if (!guestId) {
      console.error("No guest session found.");
      return [];
    }
    const contactsData = await window.getGuestContactsFromServer();
    return window.processContactsData(contactsData);
  } catch (error) {
    console.error("Error fetching guest contacts", error);
    return [];
  }
};

/**
 * Posts a new contact to the server.
 * @param {Object} contact - The contact data.
 * @param {string} path - The API path to post the contact.
 * @returns {Promise<Object>} The response data.
 * @throws {Error} If the request fails.
 */
window.postContact = async function (contact, path) {
  let res = await fetch(path + ".json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact),
  });
  if (!res.ok) throw new Error("Failed to save contact.");
  return await res.json();
};

/**
 * Saves a contact to the server for a specific user.
 * @param {Object} contact - The contact data.
 * @param {string} userId - The user's ID.
 * @returns {Promise<string>} The Firebase-generated ID for the new contact.
 * @throws {Error} If saving fails.
 */
window.saveContactToServer = async function (contact, userId) {
  let response = await fetch(
    `${window.databaseURL}/users/${userId}/contacts.json`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    }
  );
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to save contact: ${errorData}`);
  }
  let data = await response.json();
  return data.name;
};

/**
 * Sends the updated contact data to the server.
 * @param {string} contactId - The ID of the contact to update.
 * @param {Object} updatedContact - The updated contact data.
 * @returns {Promise<Response|undefined>} The response.
 * @throws {Error} If the update fails.
 */
window.putContact = async function (contactId, updatedContact) {
  const contactsPath = window.getContactsPath();
  if (!contactsPath) return;
  const response = await fetch(`${contactsPath}/${contactId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedContact),
  });
  if (!response.ok) throw new Error("Update Contact Failed.");
  return response;
};

/**
 * Updates a contact on the server.
 * @param {string} contactId - The contact ID.
 * @param {string} name - The updated name.
 * @param {string} email - The updated email.
 * @param {string} phone - The updated phone.
 * @returns {Promise<void>}
 */
window.updateContactData = async function (contactId, name, email, phone) {
  const updatedContact = { name, email, phone };
  await window.putContact(contactId, updatedContact);
};

/**
 * Sends a DELETE request for a contact.
 * @param {string} contactId - The contact ID.
 * @returns {Promise<Response|undefined>} The response.
 * @throws {Error} If deletion fails.
 */
window.sendDeleteRequest = async function (contactId) {
  const contactsPath = window.getContactsPath();
  if (!contactsPath) return;
  const response = await fetch(`${contactsPath}/${contactId}.json`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete contact: ${response.statusText}`);
  }
  return response;
};

/**
 * Deletes a guest contact from the global contacts path.
 * @param {string} contactId - The contact ID.
 * @returns {Promise<void>}
 * @throws {Error} If deletion fails.
 */
window.deleteGuestContacts = async function (contactId) {
  const response = await fetch(
    `${window.databaseURL}/contacts/${contactId}.json`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to delete contact with ID ${contactId}: ${response.statusText}`
    );
  }
};

/**
 * Deletes a contact for a specific user.
 * @param {string} userId - The user ID.
 * @param {string} contactId - The contact ID.
 * @returns {Promise<void>}
 * @throws {Error} If deletion fails.
 */
window.deleteContactFromServer = async function (userId, contactId) {
  const response = await fetch(
    `${window.databaseURL}/users/${userId}/contacts/${contactId}.json`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to delete contact with ID ${contactId}: ${response.statusText}`
    );
  }
};

/**
 * Retrieves the logged-in user's ID from sessionStorage.
 * @returns {string|undefined} The user ID, or undefined if not found.
 */
window.getUserId = function () {
  let userId = JSON.parse(sessionStorage.getItem("loggedInUser"))?.id;
  if (!userId) {
    console.error("User ID not found in sessionStorage.");
  }
  return userId;
};
