const WebSocket = require("ws");
const pg = require("pg");
const bcrypt = require("bcrypt");

const config = require("./config.json");

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
          const waifuIds = Array.isArray(row.waifus)
            ? row.waifus.map((id) => String(id))
            : [];

          let waifuNames = [];
          if (waifuIds.length > 0) {
            const uniqueWaifuIds = [...new Set(waifuIds)]
              .map((id) => Number.parseInt(id, 10))
              .filter(Number.isInteger);

            const waifuRes = await pool.query(
              "SELECT id, name, rarity FROM waifus WHERE id = ANY($1::int[])",
              [uniqueWaifuIds],
            );

            const waifuById = new Map(
              waifuRes.rows.map((waifu) => [
                String(waifu.id),
                `${waifu.name} (${waifu.rarity})`,
              ]),
            );

            waifuNames = waifuIds.map((id) => waifuById.get(id) || id);
          }

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
          const waifuId = Number.parseInt(data.waifuId, 10);
          if (!Number.isInteger(waifuId)) {
            ws.send(
              JSON.stringify({ success: false, message: "Invalid waifuId" }),
            );
            return;
          }

          const waifuRes = await pool.query(
            "SELECT id, name, rarity, score FROM waifus WHERE id = $1",
            [waifuId],
          );
          if (waifuRes.rows.length === 0) {
            ws.send(
              JSON.stringify({ success: false, message: "Waifu not found" }),
            );
            return;
          }

          const waifu = waifuRes.rows[0];

          const userWaifusRes = await pool.query(
            "SELECT COALESCE(waifus, '[]'::jsonb) AS waifus FROM users WHERE id = $1",
            [userId],
          );
          const userWaifus = Array.isArray(userWaifusRes.rows[0]?.waifus)
            ? userWaifusRes.rows[0].waifus.map((id) => String(id))
            : [];

          if (userWaifus.includes(String(waifuId))) {
            ws.send(
              JSON.stringify({
                success: false,
                message: "Waifu already owned",
                waifu: String(waifuId),
              }),
            );
            return;
          }

          console.log(`Adding waifu ID ${waifuId} to user ID ${userId}`);
          const waifuScore = waifu.score;

          const updateRes = await pool.query(
            "UPDATE users SET waifus = COALESCE(waifus, '[]'::jsonb) || to_jsonb($1::text), score = score + $2 WHERE id = $3 RETURNING score",
            [String(waifuId), waifuScore, userId],
          );
          ws.send(
            JSON.stringify({
              success: true,
              waifu: String(waifuId),
              waifuDisplay: `${waifu.name} (${waifu.rarity})`,
              addedScore: waifuScore,
              newScore: updateRes.rows[0].score,
            }),
          );
        } catch (err) {
          console.error("AddWaifu error:", err.message);
          ws.send(
            JSON.stringify({ success: false, message: "Database error" }),
          );
        }
        break;
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

console.log("WebSocket server is running on ws://localhost:3000");
