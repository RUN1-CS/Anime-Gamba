import { createConnection } from "./module.js";

/**
 * This file handles the authentication logic for the web application.
 * It establishes a WebSocket connection to the server,
 * listens for form submissions for login and registration,
 * and manages user sessions using cookies.
 *
 * Upon successful login or registration, it redirects the user to the main page.
 * It also handles logout functionality by clearing the session cookies and redirecting to the authentication page.
 *
 * Trust, it's not that deep.
 */

addEventListener("DOMContentLoaded", async () => {
  let WebSocket = await createConnection();

  let data = null;

  WebSocket.onopen = () => {};

  WebSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.success) {
      if (data.session) {
        cookieStore.set("session", data.session, { path: "/" });
        cookieStore.set("userId", data.userId, { path: "/" });
      }
      window.location.href = "index.php";
    } else if (data.data) {
      data = data.data;
    } else alert("Login failed: " + data.message);
  };

  WebSocket.onclose = () => {
    setTimeout(() => {
      location.reload();
    }, 3000);
  };

  WebSocket.onerror = (error) => {
    setTimeout(() => {
      location.reload();
    }, 3000);
  };

  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (WebSocket.readyState !== WebSocket.OPEN) return;

      if (form.login) {
        const username = form.username.value;
        const password = form.password.value;

        WebSocket.send(
          JSON.stringify({
            type: "login",
            Username: username,
            Passwd: password,
          }),
        );
      } else if (form.register) {
        const username = form.username.value;
        const password = form.password.value;
        const rep = form.rep_password.value;

        if (password !== rep) {
          alert("Passwords do not match");
          return;
        }

        WebSocket.send(
          JSON.stringify({
            type: "register",
            Username: username,
            Passwd: password,
          }),
        );
      }
    });
  });
  const logoutButton = document.getElementById("logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      await cookieStore.delete("session");
      await cookieStore.delete("userId");
      window.location.href = "auth.php";
    });
  }
});
