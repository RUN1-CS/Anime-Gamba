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

  WebSocket.onopen = async () => {
    const session = (await cookieStore.get("session")).value;
    const userId = (await cookieStore.get("userId")).value;
    WebSocket.send(
      JSON.stringify({ type: "getData", session: session, userId: userId }),
    );
  };

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
    location.href = "auth.php";
  });
});
