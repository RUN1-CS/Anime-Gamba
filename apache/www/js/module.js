/**
 * This module provides utility functions for handling item rarity,
 * color coding based on rarity, and establishing a WebSocket connection to the server.
 */

// The rarity function calculates the rarity category of an item based on its rating compared to a maximum rating.
export function rarity(rating) {
  const maxRating = 35000;
  const percentage = (rating / maxRating) * 100;

  // You can tweak them but I find these values to be pretty good for the current state of the database.
  if (percentage >= 90) return "Mythic";
  else if (percentage >= 60) return "Legendary";
  else if (percentage >= 40) return "Epic";
  else if (percentage >= 35) return "Rare";
  else if (percentage >= 20) return "Uncommon";
  else return "Common";
}

// The getColorByRarity function returns a specific color code based on the rarity category of an item.
export function getColorByRarity(rarity) {
  // I hope you like these...
  const colors = {
    Mythic: "#ff006adc",
    Legendary: "#fdf000",
    Epic: "#CD7F32",
    Rare: "#1E90FF",
    Uncommon: "#32CD32",
    Common: "#808080",
  };
  return colors[rarity] || "#000000";
}

// I had problems with the connection so I just put it here. If it works don't touch it. iykyk
export async function createConnection() {
  const response = await fetch("/js/host_conf.json");
  const config = await response.json();
  return new WebSocket(`${config.protocol}://${config.host}:${config.port}`);
}
