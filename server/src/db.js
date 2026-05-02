const pg = require("pg");
const bcrypt = require("bcrypt");
const config = require("./config.json");

async function hash(str) {
  return bcrypt.hash(str, 10);
}

const dbConfig = {
  user: config.database.POSTGRES_USER,
  host: config.database.POSTGRES_HOST || "db",
  database: config.database.POSTGRES_DB,
  password: config.database.POSTGRES_PASSWORD,
  port: Number(config.database.POSTGRES_PORT || 5432),
};

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

async function getUsernameBySession(session) {
  try {
    const sesHash = await hash(session);
    const res = await pool.query(
      "SELECT users.username FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.token = $1",
      [sesHash],
    );
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0].username;
  } catch (err) {
    console.error("Error fetching username by session ID:", err.message);
    return null;
  }
}

async function duplicateCheck(userId, waifuName) {
  try {
    const res = await pool.query("SELECT waifus FROM users WHERE id = $1", [
      userId,
    ]);
    if (res.rows.length === 0) {
      return false;
    }
    const rawWaifus = res.rows[0].waifus;
    const waifuList = Array.isArray(rawWaifus) ? rawWaifus : [];
    for (const w of waifuList) {
      const waifu = typeof w === "string" ? JSON.parse(w)?.name : w?.name;
      if (waifu === waifuName) {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error("Error checking for duplicate waifu:", err.message);
    return false;
  }
}

module.exports = { pool, getUsernameBySession, duplicateCheck };
