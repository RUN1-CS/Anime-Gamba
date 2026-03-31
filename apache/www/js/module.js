export function rarity(rating) {
  const maxRating = 35000;
  const percentage = (rating / maxRating) * 100;

  if (percentage >= 90) return "Mythic";
  else if (percentage >= 60) return "Legendary";
  else if (percentage >= 40) return "Epic";
  else if (percentage >= 35) return "Rare";
  else if (percentage >= 20) return "Uncommon";
  else return "Common";
}

export function getColorByRarity(rarity) {
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
