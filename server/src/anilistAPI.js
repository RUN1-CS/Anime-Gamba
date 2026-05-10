/**
 *  AnimeGamba - A web application that provides users with a randomly selected
 *  female anime character (waifu) from the AniList database, along with their popularity
 *  (favourites count). Users can also search for specific characters by name to view their details.
 *  Copyright (C) 2026  RUN1/RUN1-CS
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * This module interacts with the AniList GraphQL API to fetch character data,
 *  specifically focusing on female characters for the AnimeGamba application.
 *
 * Also don't ask me how'd I come up with this idea,
 * because I didn't. My classmates did.
 *
 * But it's fun to work on.
 */

const duplicateCheck = require("./db").duplicateCheck;
const config = require("./config.json");
const { log } = require("./logging/logs");

// URL for the AniList GraphQL API endpoint.
const url = config.AniListAPI.URL;

let timestamp = Date.now(); // Timestamp to track the last API call for rate limiting purposes.

// We get a random female character...
async function getRandomFemaleCharacter(userId) {
  // It's rate limited and debugging was painful. So we add a delay to ensure we don't hit the rate limit.
  let newStamp = Date.now();
  if (newStamp - timestamp < config.AniListAPI.RateLimitDelay) {
    await new Promise((resolve) =>
      // Slow down mate.
      setTimeout(
        resolve,
        config.AniListAPI.RateLimitDelay - (newStamp - timestamp),
      ),
    );
  }
  // Update the timestamp for the next call.
  timestamp = Date.now();

  // Pick a random page between 1 and 20 to get variety
  const randomPage = Math.floor(Math.random() * config.AniListAPI.Pages) + 1;

  // GraphQL query to fetch characters sorted by favourites in descending order, with pagination.
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

  // Variables for the GraphQL query, specifying the random page number.
  const variables = { page: randomPage };

  try {
    // Make a POST request to the AniList GraphQL API with the query and variables.
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

    // Parse the JSON response from the API.
    const result = await response.json();
    const characters = result.data.Page.characters;

    // Filter for characters explicitly marked as "Female"
    const females = characters.filter((char) => char.gender === "Female");

    // Error handling... yaaay
    if (females.length > 0) {
      // Pick a random one from the filtered list
      const randomIndex = Math.floor(Math.random() * females.length);
      // Is this a STAR WARS REFERENCE? MAYBE. WHO KNOWS.
      const chosenOne = females[randomIndex];
      if (await duplicateCheck(userId, chosenOne.name.full)) {
        // RIP my time on bugs
        return getRandomFemaleCharacter(userId); // Recursive retry if duplicate
      }
      // Return the character data in the expected format for the application.
      const waifuData = {
        name: chosenOne.name.full,
        favourites: Number(chosenOne.favourites) || 0,
        unlocked: Date.now(),
      };
      return waifuData;
    } else {
      log(
        "No female characters found on this page, retrying...",
        "warn",
        "api",
      );
      return getRandomFemaleCharacter(userId); // Recursive retry
    }
  } catch (error) {
    log("Error fetching from AniList:", "error", "api");
    return null;
  }
}

// ...and we can also get specific character data by name.
async function getCharacter(fullName) {
  // GraphQL query to fetch a character by name, including their full name, favourites, gender, and large image.
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

    // Error handling for character not found or missing data.
    if (!result.data || !result.data.Character) {
      return JSON.stringify({
        success: false,
        message: "Character not found",
      });
    }

    // Return the character data in the expected format for the application.
    const char = result.data.Character;

    const favs = char.favourites;

    return JSON.stringify({
      success: true,
      favs: favs,
      waifuImg: char.image.large,
    });
  } catch (error) {
    log(`Error fetching character: ${error.message}`, "error", "api");
    return JSON.stringify({
      success: false,
      message: "Error fetching character data",
    });
  }
}

// A world without lies cannot exist.
module.exports = {
  getRandomFemaleCharacter,
  getCharacter,
};
