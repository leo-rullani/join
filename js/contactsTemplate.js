function contactsTemplate(contact) {
  let initials = getInitials(contact.name);
  let bgColor = getColorForLetter(initials.charAt(0));

  return `
    <div class="contact" onclick="selectContact(this, '${contact.name}', '${contact.email}', '${contact.phone}')">
      <div class="contact-initials" style="background-color: ${bgColor};">${initials}</div>
      <div class="contact-infos">
        <p style="font-size: 17px">${contact.name}</p>
        <p style="font-size: 14px; color:#29abe2ff">${contact.email}</p>
      </div>
    </div>
  `;
}

function contactDetailsTemplate(name, email, phone) {
  let initials = getInitials(name);
  let bgColor = getColorForLetter(initials.charAt(0));
  return `
    <div >
         <div class="initial_name_content"> <div class="contact-initials" style="background-color: ${bgColor};">${initials}</div>
            <div><p>${name}</p>
                <a href=""><i class="fa-solid fa-pen"></i>Edit</a>
                    <a href=""><i class="fa-solid fa-trash"></i>Delete</a>
            </div>
        </div>

   <h3>Contact Information </h3>
   <br>
   <strong>Email</strong> <br>
    <p style="font-size: 14px; color:#29abe2ff">${email}</p>
    <strong>Phone</strong><br>
    <p>${phone}</p>
    </div>
  `;
}
