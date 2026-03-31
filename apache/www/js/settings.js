// For now you can only export your data, sowy
// !NOTICE! - Exports will be later encrypted to prevent cheating. Thanks for understanding <3

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
});
// Importing will be added later, I need to change the db first, so I can import the data without issues.
