WebSocket = new WebSocket("ws://localhost:3000");

let data = null;

WebSocket.onopen = () => {
  console.log("WebSocket connection established");
};

WebSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.success) {
    if (data.sessionId) {
      sessionStorage.setItem("sessionId", String(data.sessionId));
    }
    window.location.href = "index.php";
  } else if (data.data) {
    data = data.data;
    console.log("Received data:", data);
  } else alert("Login failed: " + data.message);
};

WebSocket.onclose = () => {
  console.log("WebSocket connection closed");
  setTimeout(() => {
    WebSocket = new WebSocket("ws://localhost:3000");
  }, 3000);
};

WebSocket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      console.log("Form submitted");
      event.preventDefault();
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
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("sessionId");
    window.location.href = "auth.php";
  });
});
