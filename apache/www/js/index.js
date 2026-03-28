const colors = {
  mythic: "#FF4500",
  legendary: "#FFD700",
  epic: "#800080",
  rare: "#0000FF",
  uncommon: "#008000",
  common: "#808080",
};

addEventListener("DOMContentLoaded", () => {
  const usernamePage = document.getElementById("username");
  const valuePage = document.getElementById("score");
  const waifusPage = document.getElementById("waifus");

  WebSocket = new WebSocket("ws://localhost:3000");

  WebSocket.onopen = () => {
    console.log("WebSocket connection established");
    const sessionId = sessionStorage.getItem("sessionId");
    WebSocket.send(JSON.stringify({ type: "getData", sessionId }));
  };

  WebSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received data:", data);

    if (data.data) {
      usernamePage.textContent = `${data.data.username}`;
      valuePage.textContent = `${data.data.value}`;

      waifusPage.textContent = "";
      data.data.waifus.forEach((waifuEntry, index) => {
        const waifuText = String(waifuEntry);
        const match = waifuText.match(/^(.*)\s*\(([^)]+)\)$/);

        const waifuName = match ? match[1].trim() : waifuText;
        const rarity = match ? match[2].trim().toLowerCase() : "common";
        const normalizedRarity = rarity === "legendry" ? "legendary" : rarity;

        const span = document.createElement("span");
        span.textContent = waifuName;
        span.style.color = colors[normalizedRarity] || colors.common;
        waifusPage.appendChild(span);

        if (index < data.data.waifus.length - 1) {
          waifusPage.appendChild(document.createTextNode(", "));
        }
      });
    }
  };

  WebSocket.onclose = () => {
    console.log("WebSocket connection closed");
  };
});
