const url = "https://graphql.anilist.co";

async function getRandomFemaleCharacter() {
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
async function getCharacter(fullName) {
  const query = `
        query ($name: String) {
          Character (search: $name) {
            name { full }
            favourites
            gender
            image { large }
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

    if (!result.data || !result.data.Character) {
      return JSON.stringify({
        success: false,
        message: "Character not found",
      });
    }

    const char = result.data.Character;

    const favs = char.favourites;

    return JSON.stringify({
      success: true,
      favs: favs,
      waifuImg: char.image.large,
    });
  } catch (error) {
    console.error("Error fetching character:", error);
    return JSON.stringify({
      success: false,
      message: "Error fetching character data",
    });
  }
}

module.exports = {
  getRandomFemaleCharacter,
  getCharacter,
};
