const { pool } = require("../db");
const { getRandomFemaleCharacter } = require("../anilistAPI.js");
const { verifySession } = require("../auth.js");

async function getData(ws, data) {
  try {
    if (!data.session || !data.userId) {
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
      ws.send(JSON.stringify({ success: false, message: "Invalid session" }));
      return;
    }

    const res = await pool.query(
      `SELECT u.username,
                    u.score AS value,
                    COALESCE(u.waifus, '[]'::jsonb) AS waifus
             FROM users u
             WHERE u.id = $1`,
      [data.userId],
    );

    if (res.rows.length === 0) {
      ws.send(
        JSON.stringify({ success: false, message: "Couldn't get user data" }),
      );
      return;
    }

    const row = res.rows[0];
    const waifuNames = row.waifus.map((entry) => {
      if (typeof entry === "string") {
        return entry;
      } else if (entry && typeof entry === "object" && entry.name) {
        return entry.name;
      } else {
        return String(entry);
      }
    });

    ws.send(
      JSON.stringify({
        success: true,
        data: {
          ...row,
          waifus: waifuNames,
        },
      }),
    );
  } catch (err) {
    console.error("GetData error:", err.message);
    ws.send(JSON.stringify({ success: false, message: "Database error" }));
  }
}

async function addWaifu(ws, data) {
  try {
    if (!data.session) {
      ws.send(JSON.stringify({ success: false, message: "Missing session" }));
      return;
    }

    const sessionValid = await verifySession(data.session, data.userId);
    if (!sessionValid) {
      ws.send(JSON.stringify({ success: false, message: "Invalid session" }));
      return;
    }

    const userId = data.userId;

    let newWaifu = false;
    let waifuData = null;
    do {
      waifuData = await getRandomFemaleCharacter();
      if (waifuData) {
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

    const waifuName =
      typeof waifuData === "string" ? waifuData : waifuData.name;
    const waifuFavourites =
      typeof waifuData === "object" && waifuData !== null
        ? Number(waifuData.favourites) || 0
        : 0;

    const waifuRes = await pool.query(
      "UPDATE users SET waifus = COALESCE(waifus, '[]'::jsonb) || to_jsonb($1::text) WHERE id = $2 RETURNING waifus",
      [waifuName, userId],
    );
    const scoreRes = await pool.query(
      "UPDATE users SET score = COALESCE(score, 0) + $1 WHERE id = $2 RETURNING score",
      [waifuFavourites, userId],
    );

    if (waifuRes.rows.length === 0 || scoreRes.rows.length === 0) {
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
      }),
    );
  } catch (err) {
    console.error("AddWaifu error:", err.message);
    ws.send(JSON.stringify({ success: false, message: "Database error" }));
  }
}

module.exports = { getData, addWaifu };
