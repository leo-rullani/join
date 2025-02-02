"use strict";

const databaseURL =
  "https://join-5d739-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * Holt alle Kontakte aus der Firebase Realtime Database
 */
async function fetchContacts() {
  try {
    let response = await fetch(`${databaseURL}/contacts.json`);
    if (!response.ok) throw new Error("Data not found");

    let contactsData = await response.json();
    return contactsData
      ? Object.entries(contactsData).map(([id, data]) => ({ id, ...data }))
      : [];
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
}

/**
 * Fügt einen neuen Kontakt in die Firebase Realtime Database hinzu
 */
async function addContact(name, email, phone) {
  let newContact = { name, email, phone };

  try {
    let response = await fetch(`${databaseURL}/contacts.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });

    if (!response.ok) throw new Error("Error adding new contact");
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

/**
 * Aktualisiert einen bestehenden Kontakt in Firebase
 */
async function updateContact(contactId, name, email, phone) {
  let updatedContact = { name, email, phone };

  try {
    let response = await fetch(`${databaseURL}/contacts/${contactId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedContact),
    });

    if (!response.ok) throw new Error("Error updating contact");
    return true;
  } catch (error) {
    console.error("Error updating contact:", error);
    return false;
  }
}

/**
 * Löscht einen Kontakt aus Firebase
 */
async function deleteContact(contactId) {
  if (!contactId) return false;

  try {
    let response = await fetch(`${databaseURL}/contacts/${contactId}.json`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Error deleting contact");
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}