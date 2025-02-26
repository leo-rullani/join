"use strict";

/* UI-Statusvariablen */
window.currentActiveContact = null;
window.contactToDelete = null;

/**
 * Initializes the application by fetching contacts data and rendering them.
 * @returns {void}
 */
window.init = function () {
  window.renderContactsFromData();
};

/**
 * Ruft die Daten aus contactsData.js ab und rendert die Kontakte.
 * @returns {Promise<void>}
 */
window.renderContactsFromData = async function () {
  let contactsArray = await window.fetchContactsData();
  window.renderContacts(contactsArray);
};

/**
 * Rendert ein Array von Kontakten, gruppiert nach Anfangsbuchstaben.
 * @param {Array<Object>} contactsArray - Das verarbeitete Array von Kontakten.
 * @returns {void}
 */
window.renderContacts = function (contactsArray) {
  window.clearContactsList();
  if (!contactsArray || contactsArray.length === 0) return;
  let groupedContacts = window.groupContactsByLetter(contactsArray);
  window.renderGroupedContacts(groupedContacts);
};

/**
 * Löscht alle Kontakteinträge in den Buchstaben-Sektionen.
 * @returns {void}
 */
window.clearContactsList = function () {
  for (let letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    let section = document.getElementById(letter);
    if (section) {
      let contactsDiv = section.querySelector(".contacts");
      if (contactsDiv) contactsDiv.innerHTML = "";
    }
  }
};

/**
 * Rendert gruppierte Kontakte in den jeweiligen DOM-Sektionen.
 * @param {Object} groupedContacts - Objekt mit Buchstaben als Schlüsseln und Kontaktarrays als Werten.
 * @returns {void}
 */
window.renderGroupedContacts = function (groupedContacts) {
  Object.keys(groupedContacts).forEach((letter) => {
    let section = document.getElementById(letter);
    if (section) {
      let contactsContainer = section.querySelector(".contacts");
      groupedContacts[letter].forEach((contact) => {
        contactsContainer.innerHTML += contactsTemplate(contact);
      });
    }
  });
};

/**
 * Gruppiert Kontakte anhand ihres Anfangsbuchstabens.
 * @param {Array<Object>} contacts - Array von Kontaktobjekten.
 * @returns {Object} Gruppiertes Objekt.
 */
window.groupContactsByLetter = function (contacts) {
  let grouped = {};
  contacts.forEach((contact) => {
    let firstLetter = contact.name.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) grouped[firstLetter] = [];
    grouped[firstLetter].push(contact);
  });
  return grouped;
};

/**
 * Markiert einen Kontakt im UI und zeigt dessen Details an.
 * @param {HTMLElement} contactElement - Das DOM-Element des Kontakts.
 * @param {string} contactId - Die Kontakt-ID.
 * @param {string} name - Der Name.
 * @param {string} email - Die E-Mail.
 * @param {string} phone - Die Telefonnummer.
 * @returns {void}
 */
window.selectContact = function (
  contactElement,
  contactId,
  name,
  email,
  phone
) {
  if (window.currentActiveContact !== null) {
    window.currentActiveContact.classList.remove("is-Active");
  }
  contactElement.classList.add("is-Active");
  window.currentActiveContact = contactElement;
  window.showContactDetails(contactId, name, email, phone);
};

/**
 * Zeigt die Details eines Kontakts im UI an.
 * @param {string} id - Die Kontakt-ID.
 * @param {string} name - Der Name.
 * @param {string} email - Die E-Mail.
 * @param {string} phone - Die Telefonnummer.
 * @returns {void}
 */
window.showContactDetails = function (id, name, email, phone) {
  let detailsContainer = document.getElementById("contact-info");
  detailsContainer.innerHTML = "";
  detailsContainer.innerHTML += contactDetailsTemplate(id, name, email, phone);
};

/**
 * Gibt die Initialen eines Namens zurück und aktualisiert den UI-Abschnitt.
 * @param {string} fullName - Der vollständige Name.
 * @returns {string} Die Initialen.
 */
window.getContactInitials = function (fullName) {
  let initialEdit = document.getElementById("initials-edit");
  let initials = fullName
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  let bgColor = getColorForLetter(initials.charAt(0));
  initialEdit.innerHTML = `<div class="edit-initials" style="background-color: ${bgColor};">${initials}</div>`;
  return initials;
};

/**
 * Holt die Formulardaten für einen neuen Kontakt aus dem DOM.
 * @returns {Object} Das Kontaktobjekt.
 */
window.getContactFormData = function () {
  return {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
  };
};

/**
 * Löscht die Eingaben im Kontaktformular.
 * @returns {void}
 */
window.clearContactForm = function () {
  document.getElementById("name").value =
    document.getElementById("email").value =
    document.getElementById("phone").value =
      "";
};

/**
 * Verarbeitet einen neuen Kontakt: holt die Daten, leert das Formular,
 * sendet den Kontakt an den Server und aktualisiert das UI.
 * @returns {Promise<void>}
 */
window.processContact = async function () {
  const newContact = window.getContactFormData(),
    path = window.getContactsPath();
  if (!path) return;
  window.clearContactForm();
  const data = await window.postContact(newContact, path);
  showToast("Contact successfully created!");
  window.addContactToGroup(data.name, newContact);
  window.selectNewContact(data.name, newContact);
  closeOverlay();
};

/**
 * Speichert einen neuen Kontakt über das Formular.
 * @param {Event} event - Das Form-Submit-Event.
 * @returns {Promise<void>}
 */
window.saveContactToDatabase = async function (event) {
  event.preventDefault();
  if (
    !validateContact(
      "name",
      "email",
      "phone",
      "errorName",
      "errorEmail",
      "errorPhone"
    )
  ) {
    return;
  }
  try {
    await window.processContact();
  } catch (err) {
    console.error("Error:", err);
  }
};

/**
 * Fügt einen Kontakt in die entsprechende Buchstabengruppe im UI ein.
 * @param {string} contactId - Die neu erstellte Kontakt-ID.
 * @param {Object} contact - Das Kontaktobjekt.
 * @returns {void}
 */
window.addContactToGroup = function (contactId, contact) {
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
};

/**
 * Markiert den neu erstellten Kontakt im UI.
 * @param {string} contactId - Die neue Kontakt-ID.
 * @param {Object} newContact - Das Kontaktobjekt.
 * @returns {void}
 */
window.selectNewContact = function (contactId, newContact) {
  let newContactElement = document.querySelector(
    `[data-contact-id="${contactId}"]`
  );
  if (newContactElement) {
    window.selectContact(
      newContactElement,
      contactId,
      newContact.name,
      newContact.email,
      newContact.phone
    );
  }
};

/**
 * Validiert das Kontaktformular.
 * @param {string} nameId - DOM-ID für Name.
 * @param {string} emailId - DOM-ID für E-Mail.
 * @param {string} phoneId - DOM-ID für Telefon.
 * @param {string} errorNameId - DOM-ID für Namensfehler.
 * @param {string} errorEmailId - DOM-ID für E-Mail-Fehler.
 * @param {string} errorPhoneId - DOM-ID für Telefonfehler.
 * @returns {boolean} True, wenn alle Felder gültig sind.
 */
window.validateContact = function (
  nameId,
  emailId,
  phoneId,
  errorNameId,
  errorEmailId,
  errorPhoneId
) {
  let isValid = true;
  if (!window.validateName(nameId, errorNameId)) isValid = false;
  if (!window.validateEmail(emailId, errorEmailId)) isValid = false;
  if (!window.validatePhone(phoneId, errorPhoneId)) isValid = false;
  return isValid;
};

/**
 * Validiert das Namensfeld.
 * @param {string} nameId - DOM-ID für Name.
 * @param {string} errorNameId - DOM-ID für Namensfehler.
 * @returns {boolean} True, wenn gültig.
 */
window.validateName = function (nameId, errorNameId) {
  const nameValue = document.getElementById(nameId).value.trim();
  if (/^[a-zA-ZÀ-ž\s]+$/.test(nameValue)) return true;
  document.getElementById(nameId).classList.add("error");
  const errDiv = document.getElementById(errorNameId);
  errDiv.textContent = "Name may only contain letters and spaces.";
  errDiv.style.display = "flex";
  return false;
};

/**
 * Validiert das E-Mail-Feld.
 * @param {string} emailId - DOM-ID für E-Mail.
 * @param {string} errorEmailId - DOM-ID für E-Mail-Fehler.
 * @returns {boolean} True, wenn gültig.
 */
window.validateEmail = function (emailId, errorEmailId) {
  const emailValue = document.getElementById(emailId).value.trim();
  if (/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(emailValue)) return true;
  document.getElementById(emailId).classList.add("error");
  const errDiv = document.getElementById(errorEmailId);
  errDiv.textContent = "Please enter a valid email address.";
  errDiv.style.display = "flex";
  return false;
};

/**
 * Validiert das Telefonfeld.
 * @param {string} phoneId - DOM-ID für Telefon.
 * @param {string} errorPhoneId - DOM-ID für Telefonfehler.
 * @returns {boolean} True, wenn gültig.
 */
window.validatePhone = function (phoneId, errorPhoneId) {
  const phoneValue = document.getElementById(phoneId).value.trim();
  if (/^[0-9+]+$/.test(phoneValue)) return true;
  document.getElementById(phoneId).classList.add("error");
  const errDiv = document.getElementById(errorPhoneId);
  errDiv.textContent = "Phone number may only contain digits and '+'.";
  errDiv.style.display = "flex";
  return false;
};

window.clearAddFormErrors = function () {
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("name").classList.remove("error");
  document.getElementById("email").classList.remove("error");
  document.getElementById("phone").classList.remove("error");
  document.getElementById("errorName").style.display = "none";
  document.getElementById("errorEmail").style.display = "none";
  document.getElementById("errorPhone").style.display = "none";
};

window.clearEditFormErrors = function () {
  document.getElementById("editName").classList.remove("error");
  document.getElementById("editEmail").classList.remove("error");
  document.getElementById("editPhone").classList.remove("error");
  document.getElementById("editErrorName").style.display = "none";
  document.getElementById("editErrorEmail").style.display = "none";
  document.getElementById("editErrorPhone").style.display = "none";
};

/**
 * Holt die Daten aus dem Edit-Formular.
 * @returns {Object} Das Objekt mit contactId, name, email und phone.
 */
window.getEditFormData = function () {
  const form = document.getElementById("editContactForm");
  const contactId = form.getAttribute("data-contact-id");
  const name = document.getElementById("editName").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const phone = document.getElementById("editPhone").value.trim();
  return { contactId, name, email, phone };
};

/**
 * Aktualisiert das UI nach einem Kontakt-Edit.
 * @param {string} contactId - Die Kontakt-ID.
 * @param {string} name - Der neue Name.
 * @param {string} email - Die neue E-Mail.
 * @param {string} phone - Die neue Telefonnummer.
 * @returns {Promise<void>}
 */
window.processEditUI = async function (contactId, name, email, phone) {
  closeEditOverlay();
  await window.renderContactsFromData();
  window.restoreActiveContact(contactId, name, email, phone);
};

/**
 * Behandelt das Absenden des Edit-Formulars.
 * @param {Event} event - Das Submit-Event.
 * @returns {Promise<void>}
 */
window.submitEditForm = async function (event) {
  event.preventDefault();
  if (
    !window.validateContact(
      "editName",
      "editEmail",
      "editPhone",
      "editErrorName",
      "editErrorEmail",
      "editErrorPhone"
    )
  ) {
    return;
  }
  const { contactId, name, email, phone } = window.getEditFormData();
  try {
    await window.updateContactData(contactId, name, email, phone);
    await window.processEditUI(contactId, name, email, phone);
  } catch (error) {
    console.error("Update Error:", error);
  }
};

/**
 * Stellt den aktiven Kontakt im UI wieder her und zeigt dessen Details.
 * @param {string} contactId - Die Kontakt-ID.
 * @param {string} name - Der Name.
 * @param {string} email - Die E-Mail.
 * @param {string} phone - Die Telefonnummer.
 * @returns {void}
 */
window.restoreActiveContact = function (contactId, name, email, phone) {
  let contactElement = document.getElementById(`contact-${contactId}`);
  if (contactElement) {
    contactElement.classList.add("is-Active");
    window.currentActiveContact = contactElement;
  }
  window.showContactDetails(contactId, name, email, phone);
};

/**
 * Aktualisiert das UI nach einer Kontaktlöschung.
 * @returns {Promise<void>}
 */
window.updateAfterDelete = async function () {
  document.getElementById("contact-info").innerHTML = "";
  await window.renderContactsFromData();
};

/**
 * Löscht einen Kontakt und aktualisiert das UI.
 * @param {string} contactId - Die Kontakt-ID.
 * @returns {Promise<void>}
 */
window.deleteContact = async function (contactId) {
  if (!contactId) return;
  try {
    await window.sendDeleteRequest(contactId);
    await window.updateAfterDelete();
  } catch (error) {
    console.error("Error deleting contact:", error);
  }
};
