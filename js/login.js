const users = [];

document.addEventListener("DOMContentLoaded", () => {
  const logo = document.querySelector(".logo-container");
  const form = document.querySelector(".form-container");
  const guestLoginButton = document.querySelector(".guest-btn");

  setTimeout(() => {
    logo.classList.add("move-logo");
  }, 500);

  logo.addEventListener("transitionend", () => {
    form.classList.remove("hidden");
    form.classList.add("visible");
  });

  // Guest Login Button Funktionalität
  guestLoginButton.addEventListener("click", () => {
    window.location.href = "summary.html";
  });
});

function login(event) {
  event.preventDefault();

  // Eingaben holen
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Dummy-Benutzer zur Demonstration
  const users = [{ email: "test@user.com", password: "test123" }];

  // Benutzer validieren
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    alert("Login successful!");
    window.location.href = "summary.html";
  } else {
    alert("Invalid email or password!");
  }
}
