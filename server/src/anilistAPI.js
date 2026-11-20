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

const { randomInt } = require("crypto");
const duplicateCheck = require("./db").duplicateCheck;
const config = require("./config.json");
const { log } = require("./logging/logs");

// URL for the AniList GraphQL API endpoint.
const url = config.AniListAPI.URL;

let timestamp = Date.now(); // Timestamp to track the last API call for rate limiting purposes.

// --- Randomness helpers -------------------------------------------------
// True randomness feels BAD: you get the same page three times in a row and
// everyone swears the bot is rigged. So we make it *feel* random instead:
//   1. Pages come out of a shuffle bag (every page gets used before any repeats).
//   2. The last few characters handed out (to anyone) are blacklisted.
//   3. Fetched pages are cached, so a duplicate just means "pick another girl
//      from the same page" instead of burning another rate-limited request.

const PAGE_CACHE_TTL = config.AniListAPI.PageCacheTTL ?? 10 * 60 * 1000; // 10 minutes
const RECENT_MEMORY = config.AniListAPI.RecentMemory ?? 30; // How many recent picks to avoid globally
const MAX_PAGE_ATTEMPTS = config.AniListAPI.MaxAttempts ?? 6; // Replaces the old infinite recursion

let pageBag = []; // Pages left to draw in the current "round".
let lastPage = null; // Last page drawn, so a refill never repeats it back-to-back.
const pageCache = new Map(); // page -> { females, fetchedAt }
const recentPicks = []; // Names of the most recent characters handed out.

// Draw the next page from the shuffle bag, refilling (and shuffling) when empty.
function nextPage() {
  if (pageBag.length === 0) {
    pageBag = Array.from({ length: config.AniListAPI.Pages }, (_, i) => i + 1);
    // Fisher-Yates shuffle.
    for (let i = pageBag.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [pageBag[i], pageBag[j]] = [pageBag[j], pageBag[i]];
    }
    // pop() takes from the end, so make sure the end isn't the page we just used.
    if (pageBag.length > 1 && pageBag[pageBag.length - 1] === lastPage) {
      [pageBag[0], pageBag[pageBag.length - 1]] = [
        pageBag[pageBag.length - 1],
        pageBag[0],
      ];
    }
  }
  lastPage = pageBag.pop();
  return lastPage;
}

// Remember a pick so nobody gets the same character again right away.
function rememberPick(name) {
  recentPicks.push(name);
  if (recentPicks.length > RECENT_MEMORY) recentPicks.shift();
}

// Reserve a slot in the rate limit window. Reserving *before* sleeping means
// simultaneous callers queue up properly instead of all waking up together.
async function waitForRateLimit() {
  const now = Date.now();
  const wait = Math.max(0, timestamp + config.AniListAPI.RateLimitDelay - now);
  timestamp = now + wait;
  if (wait > 0) {
    // Slow down mate.
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}

// Get every female character on a page (cached). Returns null on failure.
async function getFemalesOnPage(page) {
  const cached = pageCache.get(page);
  if (cached && Date.now() - cached.fetchedAt < PAGE_CACHE_TTL) {
    return cached.females;
  }

  // It's rate limited and debugging was painful. So we add a delay to ensure we don't hit the rate limit.
  await waitForRateLimit();

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

  try {
    // Make a POST request to the AniList GraphQL API with the query and variables.
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables: { page } }),
    });

    // Parse the JSON response from the API.
    const result = await response.json();
    const characters = result?.data?.Page?.characters;
    if (!response.ok || !characters) {
      log(`AniList returned no data for page ${page}`, "warn", "api");
      return null;
    }

    // Filter for characters explicitly marked as "Female"
    const females = characters.filter((char) => char.gender === "Female");
    pageCache.set(page, { females, fetchedAt: Date.now() });
    return females;
  } catch (error) {
    log(`Error fetching from AniList: ${error.message}`, "error", "api");
    return null;
  }
}

// We get a random female character...
async function getRandomFemaleCharacter(userId) {
  // A loop with a hard cap instead of recursion, so a user who owns
  // everything gets a null back rather than a stack overflow.
  for (let attempt = 0; attempt < MAX_PAGE_ATTEMPTS; attempt++) {
    const females = await getFemalesOnPage(nextPage());

    if (!females || females.length === 0) {
      log(
        "No female characters found on this page, trying another...",
        "warn",
        "api",
      );
      continue;
    }

    // Skip anything handed out recently, then draw without replacement
    // until we find one this user doesn't already own.
    const pool = females.filter((c) => !recentPicks.includes(c.name.full));

    while (pool.length > 0) {
      // Is this a STAR WARS REFERENCE? MAYBE. WHO KNOWS.
      const chosenOneData = pool.splice(randomInt(pool.length), 1)[0];

      // RIP my time on bugs
      if (await duplicateCheck(userId, chosenOneData.name.full)) continue;

      rememberPick(chosenOneData.name.full);

      const chosenOne = JSON.parse(await getCharacter(chosenOneData.name.full));

      // Return the character data in the expected format for the application.
      return {
        name: chosenOne.name,
        favourites: Number(chosenOne.favs) || 0,
        image: chosenOne.waifuImg ?? null,
        unlocked: Date.now(),
      };
    }
  }

  log("Ran out of attempts finding a new character", "warn", "api");
  return null;
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
      name: char.name.full,
      success: true,
      favs: favs,
      waifuImg: char.image?.large ?? null,
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
