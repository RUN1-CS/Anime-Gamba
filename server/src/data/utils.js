/**
 * Utility functions for handling user data, including exporting and importing user data,
 *  adding and removing waifus, and wiping user data.
 * These functions interact with the database and the AniList API to manage user information and waifu collections.
 */

const { pool } = require("../db");
const { encrypt, decrypt } = require("../encryption");
const { verifySession } = require("../auth");
const { getCharacter } = require("../anilistAPI.js");
const { log } = require("../logging/logs");

// Function to export user data by verifying the session, retrieving the user's information from the database,
// encrypting it, and sending it back to the client.
async function exportData(ws, data) {
  try {
    if (!data || !data.session || !data.userId) {
      ws.send(JSON.stringify({ success: false, message: "Missing session" }));
      return;
    }

    // Verify the session to ensure the request is authenticated. As always...
    const sessionValid = await verifySession(data.session, data.userId);
    if (!sessionValid) {
      ws.send(JSON.stringify({ success: false, message: "Invalid session" }));
      return;
    }

    const userId = data.userId;

    const userRes = await pool.query(
      "SELECT username, score, waifus FROM users WHERE id = $1",
      [userId],
    );
    if (userRes.rows.length === 0) {
      ws.send(JSON.stringify({ success: false, message: "User not found" }));
      return;
    }

    // Fetch the user's data, convert it to a JSON string, encrypt it, and send it back to the client in a structured format.
    const userData = userRes.rows[0];
    const rawData = JSON.stringify({
      username: userData.username,
      score: userData.score,
      waifus: userData.waifus,
    });
    // Encrypt the raw data before sending it to ensure that sensitive information is protected during transmission.
    // Jk, I just don't want people to easily mess with the data. It's not really for security.
    const encryptedData = encrypt(rawData);
    ws.send(
      JSON.stringify({
        success: true,
        type: "export",
        data: encryptedData,
      }),
    );
  } catch (err) {
    log("Failed to export user data.", "error", "data");
    ws.send(JSON.stringify({ success: false, message: "Database error" }));
  }
}

// The other way around. We decrypt the incoming data, parse it, and update the user's information in the database accordingly.
async function importData(ws, data) {
  try {
    if (!data.session) {
      ws.send(JSON.stringify({ success: false, message: "Missing session" }));
      return;
    }

    // Verify the session to ensure the request is authenticated. Yes, again.
    const sessionValid = await verifySession(data.session, data.userId);
    if (!sessionValid) {
      ws.send(JSON.stringify({ success: false, message: "Invalid session" }));
      return;
    }

    const userId = data.userId;

    // Bro, rly, it's just the same thing as before but in reverse. Decrypt, parse, update database. That's all there is to it.
    let decryptedData;
    try {
      decryptedData = decrypt(data.data);
    } catch (err) {
      log("Failed to decrypt data.", "error", "data");
      ws.send(
        JSON.stringify({
          success: false,
          message: "Invalid data format",
        }),
      );
      return;
    }

    // You can't be serious. It's the same things broooo.
    let importedData;
    try {
      importedData = JSON.parse(decryptedData);
    } catch (err) {
      // Did you know?
      // Logs are traumatized from lumberjacks?
      // Yeah, they get logged. Hahaha.
      // Sorry.
      log("Failed to parse JSON data.", "error", "data");
      ws.send(
        JSON.stringify({
          success: false,
          message: "Invalid data format",
        }),
      );
      return;
    }

    // Update the user's data in the database with the imported information,
    //  ensuring that the waifu collection and score are correctly set according to the imported data.
    const { score, waifus } = importedData;

    // AWAIT THE MAGIC DATABASE UPDATE SPELL
    await pool.query("UPDATE users SET score = $1, waifus = $2 WHERE id = $3", [
      score,
      JSON.stringify(waifus),
      userId,
    ]);

    ws.send(
      JSON.stringify({
        success: true,
        message: "Data imported successfully",
      }),
    );
  } catch (err) {
    log("Failed to import user data.", "error", "data");
    ws.send(JSON.stringify({ success: false, message: "Database error" }));
  }
}

/**
 * This part is primarily for testing and scripting.
 */

async function addSpecificWaifuToUser(userId, waifuName) {
  try {
    // hmmm, I think I saw this code somewhere before... where was it...?
    // Oh yeah, it's literally the same code as in addWaifu but with a specific waifu instead of a random one.
    // I just needed a way to add specific waifus for testing and stuff.
    const rawWaifuData = await getCharacter(waifuName);
    const waifuData = JSON.parse(rawWaifuData);
    if (!waifuData) {
      log(`Failed to get waifu data for: ${waifuName}`, "error", "data");
      return { success: false, message: "Failed to get waifu data" };
    }

    // "Don't treat women as objects" they said.
    // "It's not healthy" they said.
    // Yeah, well, I treat them as waifus and it's working out great for me, so... who are you to judge?
    const waifuObj = {
      name: waifuName,
      favs: waifuData.favs || 0,
      unlocked: Date.now(),
    };

    // Just updating yk.
    // How long was it since you updated your drivers?
    // Or are you a Linux user like me?
    // Did you do your daily upgrade?
    const waifuRes = await pool.query(
      "UPDATE users SET waifus = COALESCE(waifus, '[]'::jsonb) || to_jsonb($1::text) WHERE id = $2 RETURNING waifus",
      [waifuObj, userId],
    );
    const scoreRes = await pool.query(
      "UPDATE users SET score = COALESCE(score, 0) + $1 WHERE id = $2 RETURNING score",
      [waifuObj.favs, userId],
    );

    if (waifuRes.rows.length === 0 || scoreRes.rows.length === 0) {
      log(`User not found for ID: ${userId}`, "error", "data");
      return { success: false, message: "User not found" };
    }

    // Return the added waifu's name and favourites in the response to confirm the addition was successful.
    return {
      success: true,
      waifu: waifuName,
      favourites: waifuData.favs || 0,
    };
  } catch (err) {
    log("Failed to add waifu to user.", "error", "data");
    return { success: false, message: "Database error" };
  }
}

// How can you do this to me?
// Oh wait, it's not removing it from me?
// I used this function like once for testing.
// Thank god nobody removed my waifu...
async function removeWaifuFromUser(userId, waifuName) {
  try {
    const checkRes = await pool.query(
      "SELECT waifus FROM users WHERE id = $1 AND waifus @> to_jsonb($2::text)",
      [userId, waifuName],
    );

    const waifuRes = await pool.query(
      "UPDATE users SET waifus = waifus - $1 WHERE id = $2 RETURNING waifus",
      [checkRes.rows[0].waifus, userId],
    );

    if (waifuRes.rows.length === 0) {
      log(`User not found for ID: ${userId}`, "error", "data");
      return { success: false, message: "User not found" };
    }

    return { success: true, waifu: waifuName };
  } catch (err) {
    log("Failed to remove waifu from user.", "error", "data");
    return { success: false, message: "Database error" };
  }
}

// This is for wiping user data, not for deleting the user itself. So the user can start fresh without losing their account.
async function wipeUserData(userId) {
  try {
    const res = await pool.query(
      "UPDATE users SET waifus = '[]'::jsonb, score = 0 WHERE id = $1 RETURNING waifus, score",
      [userId],
    );

    if (res.rows.length === 0) {
      log(`User not found for ID: ${userId}`, "error", "data");
      return { success: false, message: "User not found" };
    }

    return { success: true };
  } catch (err) {
    log("Failed to wipe user data.", "error", "data");
    return { success: false, message: "Database error" };
  }
}

// "The only ones who should kill are those who are prepared to be killed."
module.exports = {
  addSpecificWaifuToUser,
  removeWaifuFromUser,
  wipeUserData,
  exportData,
  importData,
};
