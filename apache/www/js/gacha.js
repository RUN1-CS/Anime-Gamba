import { rarity, getColorByRarity } from "./module.js";

addEventListener("DOMContentLoaded", () => {
  WebSocket = new WebSocket("ws://localhost:3000");

  WebSocket.onopen = () => {
    const sessionId = sessionStorage.getItem("sessionId");
    WebSocket.send(JSON.stringify({ type: "getData", sessionId }));
  };

  const button = document.getElementById("gacha-button");
  button.addEventListener("click", () => {
    button.disabled = true;
    const sessionId = sessionStorage.getItem("sessionId");
    WebSocket.send(JSON.stringify({ type: "addWaifu", sessionId }));
    setTimeout(() => {
      button.disabled = false;
    }, 3000);
  });

  WebSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    //const div = document.getElementById("gacha-result");
    const msg = document.getElementById("gacha-message");
    if (data.waifu) {
      if (data.success) {
        msg.textContent = `You got ${data.waifu} - ${data.favourites}!`;
        msg.style.color = getColorByRarity(rarity(data.favourites));
        getCharacterByName(data.waifu).then((data) => {
          if (data) {
            document.getElementById("waifu-image").src = data.image.large;
          }
        });
      } else {
        msg.textContent = `Gacha failed: ${data.message}`;
      }
    }
  };
});

async function getCharacterByName(fullName) {
  const url = "https://graphql.anilist.co";

  const query = `
    query ($name: String) {
      Character (search: $name) {
        name {
          full
        }
        image {
          large
        }
        gender
      }
    }`;

  const variables = { name: fullName };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    const character = result.data.Character;
    if (!character) {
      return null;
    }

    if (character) {
      // Optional: Double check if she is female
      if (character.gender === "Female") {
        return character;
      }
    }
  } catch (error) {
    console.error("Error fetching character:", error);
  }
}
