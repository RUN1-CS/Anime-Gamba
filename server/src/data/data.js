/**
 * This file contains functions for getting and updating user data,
 *  as well as adding waifus to users.
 * These functions are used in the WebSocket handlers to respond to client requests for data and updates.
 *
 * Pls take care of your data.
 */

const { pool } = require("../db");
const { getRandomFemaleCharacter } = require("../anilistAPI.js");
const { verifySession } = require("../auth.js");
const { log } = require("../logging/logs");

// Function to get user data, including their username, score, and waifu collection, by verifying the session and querying the database.
async function getData(ws, data) {
  try {
    if (!data.session || !data.userId) {
      log("GetData request missing session or user ID", "warn", "data");
      ws.send(
        JSON.stringify({
          success: false,
          message: "Missing session or user ID",
        }),
      );
      return;
    }

    const sessionValid = await verifySession(data.session, data.userId);
    if (!sessionValid) {
      log(`Invalid session for user ID: ${data.userId}`, "warn", "data");
      ws.send(JSON.stringify({ success: false, message: "Invalid session" }));
      return;
    }

    // SQL query to fetch the user's username, score, and waifu collection from the database.
    // The waifus are stored as a JSONB array, so we use COALESCE to return an empty array if the user has no waifus.
    const res = await pool.query(
      `SELECT u.username,
                    u.score AS value,
                    COALESCE(u.waifus, '[]'::jsonb) AS waifus
             FROM users u
             WHERE u.id = $1`,
      [data.userId],
    );

    if (res.rows.length === 0) {
      log(`User not found for ID: ${data.userId}`, "warn", "data");
      ws.send(
        JSON.stringify({ success: false, message: "Couldn't get user data" }),
      );
      return;
    }

    const row = res.rows[0];

    // Parse the waifus from the database, which are stored as JSON strings, and extract the name and favourites for sorting.
    const waifusArray = Array.isArray(row.waifus) ? row.waifus : [];
    const parsed = waifusArray.map((s) => {
      try {
        const obj = typeof s === "string" ? JSON.parse(s) : s;
        return {
          raw: s,
          name: obj && obj.name ? String(obj.name) : "",
          favs: Number(obj && obj.favs) || 0,
        };
      } catch (e) {
        return { raw: s, name: "", favs: 0 };
      }
    });

    // You see the block before this?
    // I had to parse the data for this little block under this...
    parsed.sort((a, b) => {
      switch (data.orderby) {
        case "FAVOURITES_DESC":
          return b.favs - a.favs;
        case "FAVOURITES_ASC":
          return a.favs - b.favs;
        case "NAME_ASC":
          return a.name.localeCompare(b.name);
        case "NAME_DESC":
          return b.name.localeCompare(a.name);
        case "DATE_ASC":
          return a - b;
        case "DATE_DESC":
          return b - a;
        default:
          return 0;
      }
    });

    // Just to map it back lol.
    // Well it's sorted at least.
    // I guess that's what matters.
    const orderedWaifus = parsed.map((p) => p.raw);

    ws.send(
      JSON.stringify({
        success: true,
        data: {
          ...row,
          waifus: orderedWaifus || [],
        },
      }),
    );
  } catch (err) {
    log(`GetData error: ${err.message}`, "error", "data");
    ws.send(JSON.stringify({ success: false, message: "Database error" }));
  }
}

// Function to add a random waifu to the user's collection by verifying the session,
// fetching a random character, and updating the database.
async function addWaifu(ws, data) {
  try {
    const timestamp = Date.now();
    if (!data.session) {
      log("AddWaifu request missing session", "warn", "data");
      ws.send(JSON.stringify({ success: false, message: "Missing session" }));
      return;
    }

    const sessionValid = await verifySession(data.session, data.userId);
    if (!sessionValid) {
      log(`Invalid session for user ID: ${data.userId}`, "warn", "data");
      ws.send(JSON.stringify({ success: false, message: "Invalid session" }));
      return;
    }

    const userId = data.userId;

    let newWaifu = false;
    let waifuData = null;
    do {
      // Here we get a random female character from the AniList API.
      // We keep trying until we get one that the user doesn't already have in their collection,
      // to ensure that they always get a new waifu.
      waifuData = await getRandomFemaleCharacter(userId);
      if (waifuData) {
        // We check if the user already has this waifu in their collection by querying the database.
        const waifuName =
          typeof waifuData === "string" ? waifuData : waifuData.name;
        const checkRes = await pool.query(
          "SELECT 1 FROM users WHERE id = $1 AND waifus @> to_jsonb($2::text)",
          [userId, waifuName],
        );
        if (checkRes.rows.length === 0) {
          newWaifu = true;
        }
      }
      // The eternal loop of getting waifus.
    } while (!newWaifu);

    if (!waifuData) {
      ws.send(
        JSON.stringify({
          success: false,
          message: "Failed to get waifu",
        }),
      );
      return;
    }

    // We get ready da dataaaaa.
    const waifuName =
      typeof waifuData === "string" ? waifuData : waifuData.name;
    const waifuFavourites =
      typeof waifuData === "object" && waifuData !== null
        ? Number(waifuData.favourites) || 0
        : 0;

    // And then we treat them like an object...
    const waifuObj = {
      name: waifuName,
      favs: waifuFavourites,
      unlocked: timestamp,
    };

    // And we update the user's waifu collection in the database by appending the new waifu to the existing JSONB array of waifus.
    const waifuRes = await pool.query(
      "UPDATE users SET waifus = COALESCE(waifus, '[]'::jsonb) || to_jsonb($1::text) WHERE id = $2 RETURNING waifus",
      [waifuObj, userId],
    );
    const scoreRes = await pool.query(
      "UPDATE users SET score = COALESCE(score, 0) + $1 WHERE id = $2 RETURNING score",
      [waifuFavourites, userId],
    );

    // Bro, if this happens then something went really wrong. Like how did you even get here?
    if (waifuRes.rows.length === 0 || scoreRes.rows.length === 0) {
      log(`User not found for ID: ${data.userId}`, "warn", "data");
      ws.send(
        JSON.stringify({
          success: false,
          message: "User not found",
        }),
      );
      return;
    }

    ws.send(
      JSON.stringify({
        success: true,
        waifu: waifuName,
        favourites: waifuFavourites,
        image: waifuData.image || null,
      }),
    );
  } catch (err) {
    log(`AddWaifu error: ${err}`, "error", "data");
    ws.send(JSON.stringify({ success: false, message: "Database error" }));
  }
}

// No way, a short function
// Yes, we just get the top 10 users by score and return their username and score in an array.
async function getTop() {
  try {
    const res = await pool.query(
      "SELECT username, score FROM users ORDER BY score DESC NULLS LAST LIMIT 10",
    );
    return res.rows;
  } catch (err) {
    log(`GetTop error: ${err.message}`, "error", "data");
    return [];
  }
}

module.exports = { getData, addWaifu, getTop };
