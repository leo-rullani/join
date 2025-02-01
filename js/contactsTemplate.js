function contactsTemplate(contact) {
  return `
    <div class="contact" onclick="selectContact(this,'${contact.name}', '${contact.email}', '${contact.phone}')">
      <p>${contact.name}</p>
      <p>${contact.email}</p>
    </div>
  `;
}

function contactDetailsTemplate(name, email, phone) {
  return `
    <div><h3>Contact Details</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    </div>
  `;
}
