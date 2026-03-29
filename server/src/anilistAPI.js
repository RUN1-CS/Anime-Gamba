async function getRandomFemaleCharacter() {
  const url = "https://graphql.anilist.co";

  // Pick a random page between 1 and 20 to get variety
  const randomPage = Math.floor(Math.random() * 20) + 1;

  const query = `
    query ($page: Int) {
      Page(page: $page, perPage: 50) {
        characters(sort: FAVOURITES_DESC) {
          name {
            full
          }
          gender
          favourites
        }
      }
    }`;

  const variables = { page: randomPage };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();
    const characters = result.data.Page.characters;

    // Filter for characters explicitly marked as "Female"
    const females = characters.filter((char) => char.gender === "Female");

    if (females.length > 0) {
      // Pick a random one from the filtered list
      const randomIndex = Math.floor(Math.random() * females.length);
      const chosenOne = females[randomIndex];
      const waifuData = {
        name: chosenOne.name.full,
        favourites: Number(chosenOne.favourites) || 0,
      };
      console.log("Chosen character:", waifuData);
      return waifuData;
    } else {
      console.log("No female characters found on this page, retrying...");
      return getRandomFemaleCharacter(); // Recursive retry
    }
  } catch (error) {
    console.error("Error fetching from AniList:", error);
    return null;
  }
}

module.exports = {
  getRandomFemaleCharacter,
};
