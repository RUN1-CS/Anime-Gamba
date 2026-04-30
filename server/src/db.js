const pg = require("pg");
const config = require("./config.json");
const { hash } = require("./auth");

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

module.exports = { pool, getUsernameBySession };
