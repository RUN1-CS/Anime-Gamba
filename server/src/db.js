const pg = require("pg");
const config = require("./config.json");

const dbConfig = {
  user: config.POSTGRES_USER,
  host: config.POSTGRES_HOST || "db",
  database: config.POSTGRES_DB,
  password: config.POSTGRES_PASSWORD,
  port: Number(config.POSTGRES_PORT || 5432),
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

async function getUsrnameBySessionId(sessionId) {
  try {
    const res = await pool.query(
      "SELECT users.username FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.id = $1",
      [sessionId],
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

module.exports = { pool, getUsrnameBySessionId };
