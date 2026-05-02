import { rarity, getColorByRarity, createConnection } from "./module.js";

/**
 * Main JavaScript file for the gacha page. Handles WebSocket connection and updates the UI with gacha results.
 * Most of it is on the server hehehe.
 */

addEventListener("DOMContentLoaded", async () => {
  WebSocket = await createConnection();

  // When the WebSocket connection is opened, send a request to get the user data using the session and userId from cookies.
  WebSocket.onopen = async () => {
    const session = (await cookieStore.get("session")).value;
    const userId = (await cookieStore.get("userId")).value;
    WebSocket.send(
      JSON.stringify({ type: "getData", session: session, userId: userId }),
    );
  };

  const button = document.getElementById("gacha-button");
  button.addEventListener("click", async () => {
    button.disabled = true;
    const session = (await cookieStore.get("session")).value;
    const userId = (await cookieStore.get("userId")).value;
    WebSocket.send(
      JSON.stringify({ type: "addWaifu", session: session, userId: userId }),
    );
    setTimeout(() => {
      button.disabled = false;
    }, 3000);
  });

  WebSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received data:", data);
    //const div = document.getElementById("gacha-result");
    const msg = document.getElementById("gacha-message");
    if (data.waifu) {
      if (data.success) {
        msg.textContent = `You got ${data.waifu} - ${data.favourites}!`;
        msg.style.color = getColorByRarity(rarity(data.favourites));
        document.getElementById("waifu-image").src = data.image.large;
      } else {
        msg.textContent = `Gacha failed: ${data.message}`;
      }
    }
  };
});
