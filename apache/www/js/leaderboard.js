addEventListener("DOMContentLoaded", async () => {
  WebSocket = new WebSocket("ws://localhost:3000");

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
        entry.innerHTML = `
        <div class="card mb-3 d-flex align-items-center bg-dark text-${textColor}" style="min-width: 300px;">
          <div class="card-body text-center">
            <h5 class="card-title">${e.username}</h5>
            <p class="card-text">Score: ${e.score}</p>
          </div>
        </div>
      `;
        leaderboard.appendChild(entry);
        increment++;
      });
    } else {
      usernamePage.textContent = data.data.username;
      valuePage.textContent = data.data.value;
      waifusPage.innerHTML =
        data.data.waifus.length > 0
          ? data.data.waifus.length
          : "You have no waifus yet. Try your luck with the gacha!";
    }
  };
});
