import { createConnection } from "./module.js";

/**
 * This file is responsible for handling the leaderboard page.
 * It connects to the WebSocket server, retrieves the top players and the current user's data,
 * and updates the page accordingly.
 */

addEventListener("DOMContentLoaded", async () => {
  WebSocket = await createConnection();

  const userId = (await cookieStore.get("userId")).value;
  const session = (await cookieStore.get("session")).value;

  const usernamePage = document.getElementById("username");
  const valuePage = document.getElementById("score");
  const waifusPage = document.getElementById("waifus");

  const leaderboard = document.getElementById("leaderboard");

  WebSocket.onopen = async () => {
    WebSocket.send(JSON.stringify({ type: "getTop" }));
    WebSocket.send(
      JSON.stringify({ type: "getData", session: session, userId: userId }),
    );
  };

  // Once we receive a message from the server,
  // we check if it's successful and if it contains the top players data.
  // If it does, we create a new entry for each player and append it to the leaderboard.
  WebSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (!data.success) return;
    if (data.top) {
      let increment = 1;
      data.top.forEach((e) => {
        let textColor = "white";
        if (increment === 1) textColor = "gold";
        else if (increment === 2) textColor = "silver";
        else if (increment === 3) textColor = "bronze";
        const entry = document.createElement("div");
        entry.classList.add("entry");
        // Cool card design, right? I know, I'm a genius.
        entry.innerHTML = `
        <div class="card mb-3 d-flex align-items-center bg-dark text-${textColor}" style="min-width: 300px;">
          <div class="card-body text-center">
            <h5 class="card-title">${increment}. ${e.username}</h5>
            <p class="card-text">Score: ${e.score}</p>
          </div>
        </div>
      `;
        leaderboard.appendChild(entry);
        // Little trolling, instead of i I used increment, because I am built different.
        increment++;
      });
    } else {
      // No this ain't gambling propaganda, nuh uh
      // Just maybe...
      usernamePage.textContent = data.data.username;
      valuePage.textContent = data.data.value;
      waifusPage.innerHTML =
        data.data.waifus.length > 0
          ? data.data.waifus.length
          : "You have no waifus yet. Try your luck with the gacha!";
    }
  };
});
