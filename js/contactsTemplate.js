function contactsTemplate(contact) {
  let initials = getContactInitials(contact.name);
  let bgColor = getColorForLetter(initials.charAt(0));

  return `
    <div class="contact" data-contact-id="${contact.id}" id="contact-${contact.id}" onclick="openContactDetails(); selectContact(this, '${contact.id}', '${contact.name}', '${contact.email}', '${contact.phone}')">
      <div class="contact-initials" style="background-color: ${bgColor};">${initials}</div>
      <div class="contact-infos">
        <p class="contact_name">${contact.name}</p>
        <p class="contact_email">${contact.email}</p>
      </div>
    </div>
  `;
}

function contactDetailsTemplate(id, name, email, phone) {
  let initials = getContactInitials(name);
  let bgColor = getColorForLetter(initials.charAt(0));
  return `
    <div class="contact-details" >
         <div class="initial_name_content">
         <div class=" big-initials" style="background-color: ${bgColor};">${initials}</div>
            <div class="contact_name"><h1 class="contact-name-h1">${name}</h1>
                <div id="seeMoreLinks" class="contact_links">
                <a href="#" onclick="openEditOverlay('${id}', '${name}', '${email}', '${phone}')"><i class="fa-solid fa-pen"></i>Edit</a>
                    <a href="#" onclick="deleteContact('${id}')" ><i class="fa-solid fa-trash"> </i>Delete</a>
            </div></div>
        </div>

   <h3>Contact Information </h3>
   <br>
   <strong>Email</strong> <br>
    <p style="font-size: 14px; color:#29abe2ff">${email}</p>
    <strong>Phone</strong><br><br>
    ${phone}
    </div>
  `;
}
