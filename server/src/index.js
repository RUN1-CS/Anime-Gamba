const WebSocket = require("ws");
const pg = require("pg");
const bcrypt = require("bcrypt");

const config = require("./config.json");
const { getRandomFemaleCharacter, getCharacter } = require("./anilistAPI.js");
const { get } = require("http");

const dbConfig = {
  user: process.env.POSTGRES_USER || config.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || config.POSTGRES_HOST || "db",
  database: process.env.POSTGRES_DB || config.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD || config.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT || config.POSTGRES_PORT || 5432),
};

const wss = new WebSocket.Server({ port: 3000 });

const pool = new pg.Pool(dbConfig);

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

pool.on("connect", () => {
  console.log("Database connected successfully");
});

pool.on("error", (err) => {
  console.error("Database pool error:", err);
});

async function filterTokens() {
  const res = await pool.query(
    "DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '7 days' RETURNING id",
  );
  if (res.rows.length > 0) {
    console.log(`Deleted ${res.rows.length} expired sessions`);
  }
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (msg) => {
    await filterTokens();
    const data = JSON.parse(msg);
    switch (data.type) {
      case "login":
        try {
          const res = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [data.Username],
          );
          if (res.rows.length === 0) {
            ws.send(
              JSON.stringify({ success: false, message: "User not found" }),
            );
            return;
          }
          const user = res.rows[0];
          const match = await bcrypt.compare(data.Passwd, user.password);
          if (match) {
            const sesRes = await pool.query(
              "INSERT INTO sessions (user_id, token) VALUES ($1, $2) RETURNING id",
              [user.id, generateToken() || null],
            );
            const sessionId = sesRes.rows[0].id;
            ws.send(JSON.stringify({ success: true, sessionId }));
            console.log(
              `Session created for ${data.Username} with ID: ${sessionId}`,
            );
          } else {
            ws.send(
              JSON.stringify({ success: false, message: "Incorrect password" }),
            );
            return;
          }
        } catch (err) {
          console.error("Login error:", err.message);
          ws.send(
            JSON.stringify({ success: false, message: "Database error" }),
          );
        }
        break;
      case "register":
        try {
          const hashedPassword = await bcrypt.hash(data.Passwd, 10);
          const userRes = await pool.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
            [data.Username, hashedPassword],
          );
          const userId = userRes.rows[0].id;
          const sesRes = await pool.query(
            "INSERT INTO sessions (user_id, token) VALUES ($1, $2) RETURNING id",
            [userId, generateToken()],
          );
          const sessionId = sesRes.rows[0].id;
          ws.send(JSON.stringify({ success: true, sessionId }));
        } catch (err) {
          console.error("Register error:", err.message || err);
          console.error("Full error:", err);
          ws.send(
            JSON.stringify({
              success: false,
              message: err.message || "Database error",
            }),
          );
        }
        break;
      case "getData":
        try {
          if (!data.sessionId) {
            ws.send(
              JSON.stringify({ success: false, message: "Missing sessionId" }),
            );
            return;
          }

          const res = await pool.query(
            `SELECT u.username,
                    u.score AS value,
                    COALESCE(u.waifus, '[]'::jsonb) AS waifus
             FROM sessions s
             JOIN users u ON u.id = s.user_id
             WHERE s.id = $1`,
            [data.sessionId],
          );

          if (res.rows.length === 0) {
            ws.send(
              JSON.stringify({ success: false, message: "Session not found" }),
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
          ws.send(
            JSON.stringify({ success: false, message: "Database error" }),
          );
        }
        break;
      case "addWaifu":
        try {
          if (!data.sessionId) {
            ws.send(
              JSON.stringify({ success: false, message: "Missing sessionId" }),
            );
            return;
          }

          const sessionRes = await pool.query(
            "SELECT user_id FROM sessions WHERE id = $1",
            [data.sessionId],
          );

          if (sessionRes.rows.length === 0) {
            ws.send(
              JSON.stringify({ success: false, message: "Session not found" }),
            );
            return;
          }

          const userId = sessionRes.rows[0].user_id;

          let newWaifu = false;
          do {
            const waifuData = await getRandomFemaleCharacter();
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
          ws.send(
            JSON.stringify({ success: false, message: "Database error" }),
          );
        }
        break;
      case "getCharacter":
        try {
          const character = await getCharacter(data.name);
          console.log(character);
          ws.send(JSON.stringify({ success: true, character }));
        } catch (err) {
          console.error("getCharacter error:", err.message);
          ws.send(
            JSON.stringify({ success: false, message: "Character not found" }),
          );
        }
        break;
      default:
        ws.send(
          JSON.stringify({ success: false, message: "Unknown message type" }),
        );
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

wss.on("error", (error) => {
  console.error("WebSocket error:", error);
});

function generateToken() {
  return require("crypto").randomBytes(64).toString("hex");
}

async function addSpecificWaifuToUser(sessionId, waifuName) {
  try {
    const sessionRes = await pool.query(
      "SELECT user_id FROM sessions WHERE id = $1",
      [sessionId],
    );

    if (sessionRes.rows.length === 0) {
      return { success: false, message: "Session not found" };
    }

    const userId = sessionRes.rows[0].user_id;

    const waifuData = await getCharacter(waifuName);
    if (!waifuData) {
      return { success: false, message: "Failed to get waifu data" };
    }

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
      return { success: false, message: "User not found" };
    }

    return { success: true, waifu: waifuName, favourites: waifuFavourites };
  } catch (err) {
    console.error("addSpecificWaifuToUser error:", err.message);
    return { success: false, message: "Database error" };
  }
}

async function removeWaifuFromUser(sessionId, waifuName) {
  try {
    const sessionRes = await pool.query(
      "SELECT user_id FROM sessions WHERE id = $1",
      [sessionId],
    );

    if (sessionRes.rows.length === 0) {
      return { success: false, message: "Session not found" };
    }

    const userId = sessionRes.rows[0].user_id;

    const waifuRes = await pool.query(
      "UPDATE users SET waifus = waifus - $1 WHERE id = $2 RETURNING waifus",
      [waifuName, userId],
    );

    if (waifuRes.rows.length === 0) {
      return { success: false, message: "User not found" };
    }

    return { success: true, waifu: waifuName };
  } catch (err) {
    console.error("removeWaifuFromUser error:", err.message);
    return { success: false, message: "Database error" };
  }
}

module.exports = { addSpecificWaifuToUser, removeWaifuFromUser };

console.log("WebSocket server is running on ws://localhost:3000");
