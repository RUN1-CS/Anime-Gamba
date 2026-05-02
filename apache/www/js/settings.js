import { createConnection } from "./module.js";

/**
 * Settings page script. Handles user settings, data export/import, and password changes.
 * It's pretty straightforward, just a bunch of event listeners and WebSocket communication.
 */

// When the DOM is loaded, we set up our WebSocket connection and event listeners for the settings page.
addEventListener("DOMContentLoaded", async () => {
  // First, we check if the user is logged in by looking for the session cookie. If it's not there, we redirect to the login page.
  const session = (await cookieStore.get("session")).value;
  const userId = (await cookieStore.get("userId")).value;
  if (!session) {
    window.location.href = "auth.php";
    return;
  }

  // We create a WebSocket connection to the server to handle settings updates and data export/import.
  WebSocket = await createConnection();
  WebSocket.onopen = async () => {
    WebSocket.send(
      JSON.stringify({ type: "getData", session: session, userId: userId }),
    );
  };

  WebSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // If the server sends us data for export,
    // we create a downloadable JSON file for the user.
    // Otherwise, we just update the username display.
    if (data.type === "export") {
      const blob = new Blob([JSON.stringify(data.data)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const settings = document.getElementById("settings-content");

      // We create a temporary anchor element to trigger the download of the exported data.
      const a = document.createElement("a");
      a.href = url;
      a.download = "anime_gamba_export.json";
      settings.appendChild(a);
      a.click();
      settings.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (data.success) {
      const username = data.data.username;
      const usernameElement = document.getElementById("username");
      if (usernameElement) {
        usernameElement.textContent = username;
      }
    }
  };

  // Export button event listener. When clicked, it sends a request to the server to export the user's data.
  const exportButton = document.getElementById("export");
  exportButton.addEventListener("click", () => {
    WebSocket.send(
      JSON.stringify({
        type: "requestExport",
        session: session,
        userId: userId,
      }),
    );
  });
  // Import button event listener.
  // When clicked, it opens a file dialog for the user to select a JSON file to import,
  // and then sends the data to the server for processing.
  const importButton = document.getElementById("import");
  importButton.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // We parse the selected file as JSON and send it to the server for import.
          const importedData = JSON.parse(e.target.result);
          WebSocket.send(
            JSON.stringify({
              type: "importData",
              session: session,
              userId: userId,
              data: importedData,
            }),
          );
        } catch (err) {
          // If the file is not a valid JSON, we alert the user about the invalid format.
          alert("Invalid file format. Please select a valid JSON file.");
        }
      };
      // We read the selected file as text, which will trigger the onload event when done.
      reader.readAsText(file);
    };
    // We programmatically click the file input to open the file dialog for the user.
    fileInput.click();
  });

  // Update settings form event listener.
  // When the form is submitted, it sends the new username and email to the server to update the user's settings.
  const updateForm = document.getElementById("update-settings");
  updateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(updateForm);
    const username = data.get("username");
    const email = data.get("email");
    WebSocket.send(
      JSON.stringify({
        type: "updateSettings",
        session: session,
        data: { username, email },
        userId: userId,
      }),
    );
  });

  // Change password button event listener. When clicked, it opens a modal for the user to change their password.
  const passwordChangeButton = document.getElementById("change-password");
  passwordChangeButton.addEventListener("click", () => {
    new bootstrap.Modal(document.getElementById("passwordChangeModal")).show();
  });
  const passwordChangeForm = document.getElementById("password-change-form");
  passwordChangeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(passwordChangeForm);
    const currentPassword = data.get("current-password");
    const newPassword = data.get("new-password");
    const userId = (await cookieStore.get("userId")).value;
    WebSocket.send(
      JSON.stringify({
        type: "changePassword",
        session: session,
        userId: userId,
        data: { currentPassword, newPassword },
      }),
    );
  });

  // Logout button event listener. When clicked, it clears the session cookies and redirects to the login page.
  document.getElementById("logout").addEventListener("click", () => {
    cookieStore.delete("session");
    cookieStore.delete("userId");
    location.href = "auth.php";
  });
});
