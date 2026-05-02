import { createConnection } from "./module.js";

/**
 * Main JavaScript file for the index page. Handles WebSocket connection and updates the UI with user data.
 * Also defines the color scheme for different waifu rarities.
 */

const colors = {
  mythic: "#FF4500",
  legendary: "#FFD700",
  epic: "#800080",
  rare: "#0000FF",
  uncommon: "#008000",
  common: "#808080",
};

// DOM, yes, again
addEventListener("DOMContentLoaded", async () => {
  const usernamePage = document.getElementById("username");
  const valuePage = document.getElementById("score");
  const waifusPage = document.getElementById("waifus");

  WebSocket = await createConnection();

  // When the WebSocket connection is opened, send a request to get the user data using the session and userId from cookies.
  WebSocket.onopen = async () => {
    const session = (await cookieStore.get("session")).value;
    const userId = (await cookieStore.get("userId")).value;
    WebSocket.send(
      JSON.stringify({ type: "getData", session: session, userId: userId }),
    );
  };

  // Play gacha... if you don't have any waifus, that is.
  // Otherwise, update the UI with the received user data.
  WebSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (!data.success) return;
    usernamePage.textContent = data.data.username;
    valuePage.textContent = data.data.value;
    waifusPage.innerHTML =
      data.data.waifus.length > 0
        ? data.data.waifus.length
        : "You have no waifus yet. Try your luck with the gacha!";
  };

  // Basic stuff.... commenting the code is boring.
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
  document.getElementById("logout").addEventListener("click", () => {
    cookieStore.delete("session");
    cookieStore.delete("userId");
    location.href = "auth.php";
  });
});
