const { pool } = require("../db");
const { encrypt, decrypt } = require("../encryption");

async function exportData(ws, data) {
  try {
    if (!data.sessionId) {
      ws.send(JSON.stringify({ success: false, message: "Missing sessionId" }));
      return;
    }

    const sessionRes = await pool.query(
      "SELECT user_id FROM sessions WHERE id = $1",
      [data.sessionId],
    );

    if (sessionRes.rows.length === 0) {
      ws.send(JSON.stringify({ success: false, message: "Session not found" }));
      return;
    }

    const userId = sessionRes.rows[0].user_id;

    const userRes = await pool.query(
      "SELECT username, score, waifus FROM users WHERE id = $1",
      [userId],
    );
    if (userRes.rows.length === 0) {
      ws.send(JSON.stringify({ success: false, message: "User not found" }));
      return;
    }

    const userData = userRes.rows[0];
    const rawData = JSON.stringify({
      username: userData.username,
      score: userData.score,
      waifus: userData.waifus,
    });
    const encryptedData = encrypt(rawData);
    ws.send(
      JSON.stringify({
        success: true,
        type: "export",
        data: encryptedData,
      }),
    );
  } catch (err) {
    console.error("requestExport error:", err.message);
    ws.send(JSON.stringify({ success: false, message: "Database error" }));
  }
}

async function importData(ws, data) {
  try {
    if (!data.sessionId) {
      ws.send(JSON.stringify({ success: false, message: "Missing sessionId" }));
      return;
    }

    const sessionRes = await pool.query(
      "SELECT user_id FROM sessions WHERE id = $1",
      [data.sessionId],
    );

    if (sessionRes.rows.length === 0) {
      ws.send(JSON.stringify({ success: false, message: "Session not found" }));
      return;
    }

    const userId = sessionRes.rows[0].user_id;

    let decryptedData;
    try {
      decryptedData = decrypt(data.data);
    } catch (err) {
      console.error("Decryption error:", err.message);
      ws.send(
        JSON.stringify({
          success: false,
          message: "Invalid data format",
        }),
      );
      return;
    }

    let importedData;
    try {
      importedData = JSON.parse(decryptedData);
    } catch (err) {
      console.error("JSON parse error:", err.message);
      ws.send(
        JSON.stringify({
          success: false,
          message: "Invalid data format",
        }),
      );
      return;
    }

    const { score, waifus } = importedData;

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
    console.error("importData error:", err.message);
    ws.send(JSON.stringify({ success: false, message: "Database error" }));
  }
}

async function addSpecificWaifuToUser(userId, waifuName) {
  try {
    const rawWaifuData = await getCharacter(waifuName);
    const waifuData = JSON.parse(rawWaifuData);
    if (!waifuData) {
      console.error("Failed to get waifu data for:", waifuName);
      return { success: false, message: "Failed to get waifu data" };
    }

    const waifuRes = await pool.query(
      "UPDATE users SET waifus = COALESCE(waifus, '[]'::jsonb) || to_jsonb($1::text) WHERE id = $2 RETURNING waifus",
      [waifuName, userId],
    );
    const scoreRes = await pool.query(
      "UPDATE users SET score = COALESCE(score, 0) + $1 WHERE id = $2 RETURNING score",
      [waifuData.favs || 0, userId],
    );

    if (waifuRes.rows.length === 0 || scoreRes.rows.length === 0) {
      console.error("User not found for ID:", userId);
      return { success: false, message: "User not found" };
    }

    return {
      success: true,
      waifu: waifuName,
      favourites: waifuData.favs || 0,
    };
  } catch (err) {
    console.error("addSpecificWaifuToUser error:", err.message);
    return { success: false, message: "Database error" };
  }
}

async function removeWaifuFromUser(userId, waifuName) {
  try {
    const waifuRes = await pool.query(
      "UPDATE users SET waifus = waifus - $1 WHERE id = $2 RETURNING waifus",
      [waifuName, userId],
    );

    if (waifuRes.rows.length === 0) {
      console.error("User not found for ID:", userId);
      return { success: false, message: "User not found" };
    }

    return { success: true, waifu: waifuName };
  } catch (err) {
    console.error("removeWaifuFromUser error:", err.message);
    console.error("Full error:", err);
    return { success: false, message: "Database error" };
  }
}

async function wipeUserData(userId) {
  try {
    const res = await pool.query(
      "UPDATE users SET waifus = '[]'::jsonb, score = 0 WHERE id = $1 RETURNING waifus, score",
      [userId],
    );

    if (res.rows.length === 0) {
      console.error("User not found for ID:", userId);
      return { success: false, message: "User not found" };
    }

    return { success: true };
  } catch (err) {
    console.error("wipeUserData error:", err.message);
    console.error("Full error:", err);
    return { success: false, message: "Database error" };
  }
}

module.exports = {
  addSpecificWaifuToUser,
  removeWaifuFromUser,
  wipeUserData,
  exportData,
  importData,
};
