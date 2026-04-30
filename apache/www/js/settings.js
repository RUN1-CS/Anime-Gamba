import hostConfig from "./host_conf.json" assert { type: "json" };

addEventListener("DOMContentLoaded", async () => {
  const session = (await cookieStore.get("session")).value;
  const userId = (await cookieStore.get("userId")).value;
  if (!session) {
    window.location.href = "auth.php";
    return;
  }

  WebSocket = new WebSocket(
    `${hostConfig.protocol}://${hostConfig.host}:${hostConfig.port}`,
  );
  WebSocket.onopen = async () => {
    WebSocket.send(
      JSON.stringify({ type: "getData", session: session, userId: userId }),
    );
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
    WebSocket.send(
      JSON.stringify({
        type: "requestExport",
        session: session,
        userId: userId,
      }),
    );
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
              session: session,
              userId: userId,
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
        session: session,
        data: { username, email },
        userId: userId,
      }),
    );
  });

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
});
