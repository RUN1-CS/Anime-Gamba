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

    const orderedWaifus = row.waifus.sort((a, b) => {
      switch (data.orderby) {
        case "FAVOURITES_DESC":
          return b.favs - a.favs;
        case "FAVOURITES_ASC":
          return a.favs - b.favs;
        case "NAME_ASC":
          return a.name.localeCompare(b.name);
        case "NAME_DESC":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

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

    const waifuObj = { name: waifuName, favs: waifuFavourites };

    const waifuRes = await pool.query(
      "UPDATE users SET waifus = COALESCE(waifus, '[]'::jsonb) || to_jsonb($1::text) WHERE id = $2 RETURNING waifus",
      [waifuObj, userId],
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

async function getTop() {
  try {
    const res = await pool.query(
      "SELECT username, score FROM users ORDER BY score DESC NULLS LAST LIMIT 10",
    );
    return res.rows;
  } catch (err) {
    console.error("GetTop error:", err.message);
    return [];
  }
}

module.exports = { getData, addWaifu, getTop };
