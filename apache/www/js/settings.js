addEventListener("DOMContentLoaded", () => {
  const sessionId = sessionStorage.getItem("sessionId");

  WebSocket = new WebSocket("ws://localhost:3000");
  WebSocket.onopen = () => {
    WebSocket.send(JSON.stringify({ type: "getData", sessionId }));
  };

  WebSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "export") {
      const blob = new Blob([JSON.stringify(data.data)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const settings = document.getElementById("settings-content");

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
  const exportButton = document.getElementById("export");
  exportButton.addEventListener("click", () => {
    WebSocket.send(JSON.stringify({ type: "requestExport", sessionId }));
  });
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
          const importedData = JSON.parse(e.target.result);
          WebSocket.send(
            JSON.stringify({
              type: "importData",
              sessionId,
              data: importedData,
            }),
          );
        } catch (err) {
          alert("Invalid file format. Please select a valid JSON file.");
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  });

  const updateForm = document.getElementById("update-settings");
  updateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(updateForm);
    const username = data.get("username");
    const email = data.get("email");
    WebSocket.send(
      JSON.stringify({
        type: "updateSettings",
        sessionId,
        data: { username, email },
      }),
    );
  });

  const passwordChangeButton = document.getElementById("change-password");
  passwordChangeButton.addEventListener("click", () => {
    new bootstrap.Modal(document.getElementById("passwordChangeModal")).show();
  });
  const passwordChangeForm = document.getElementById("password-change-form");
  passwordChangeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(passwordChangeForm);
    const currentPassword = data.get("current-password");
    const newPassword = data.get("new-password");
    WebSocket.send(
      JSON.stringify({
        type: "changePassword",
        sessionId,
        data: { currentPassword, newPassword },
      }),
    );
  });
});
