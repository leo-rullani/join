function contactsTemplate(contact) {
  return `
    <div class="contact">
      <p>${contact.name}</p>
      <p>${contact.email}</p>
    </div>
  `;
}
