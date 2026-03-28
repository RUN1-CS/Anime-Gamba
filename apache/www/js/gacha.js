// This logic will be moved to server later, but for now it's here for testing purposes

const MythicalRange = { min: 1, max: 6 };
const LegendaryRange = { min: 7, max: 11 };
const EpicRange = { min: 12, max: 27 };
const RareRange = { min: 18, max: 22 };
const UncommonRange = { min: 23, max: 25 };

const ChanceTable = {
  Mythical: 0.01,
  Legendary: 0.04,
  Epic: 0.15,
  Rare: 0.3,
  Uncommon: 0.5,
  Common: 0.0,
};
// ---

function getRarity() {
  const rand = Math.random();

  if (rand < ChanceTable.Mythical) return "Mythical";
  if (rand < ChanceTable.Mythical + ChanceTable.Legendary) return "Legendary";
  if (rand < ChanceTable.Mythical + ChanceTable.Legendary + ChanceTable.Epic)
    return "Epic";
  if (
    rand <
    ChanceTable.Mythical +
      ChanceTable.Legendary +
      ChanceTable.Epic +
      ChanceTable.Rare
  )
    return "Rare";
  if (
    rand <
    ChanceTable.Mythical +
      ChanceTable.Legendary +
      ChanceTable.Epic +
      ChanceTable.Rare +
      ChanceTable.Uncommon
  )
    return "Uncommon";
  return "Common";
}

function getWaifuId() {
  const rarity = getRarity();
  let range;

  switch (rarity) {
    case "Mythical":
      range = MythicalRange;
      break;
    case "Legendary":
      range = LegendaryRange;
      break;
    case "Epic":
      range = EpicRange;
      break;
    case "Rare":
      range = RareRange;
      break;
    case "Uncommon":
      range = UncommonRange;
      break;
    default:
      return null; // Common waifus are not implemented
  }

  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

addEventListener("DOMContentLoaded", () => {
  WebSocket = new WebSocket("ws://localhost:3000");

  WebSocket.onopen = () => {
    console.log("WebSocket connection established");
    const sessionId = sessionStorage.getItem("sessionId");
    WebSocket.send(JSON.stringify({ type: "getData", sessionId }));
  };

  const button = document.getElementById("gacha-button");
  button.addEventListener("click", () => {
    const sessionId = sessionStorage.getItem("sessionId");
    WebSocket.send(
      JSON.stringify({ type: "addWaifu", sessionId, waifuId: getWaifuId() }),
    );
  });

  WebSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received data:", data);

    //const div = document.getElementById("gacha-result");
    const msg = document.getElementById("gacha-message");
    if (data.waifu) {
      if (data.success) {
        msg.textContent = `You got ${data.waifuDisplay})!`;
      } else {
        msg.textContent = `Gacha failed: ${data.message}`;
      }
    }
  };
});
