const bcrypt = require("bcrypt");

const { pool } = require("./db");

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function generateToken() {
  return require("crypto").randomBytes(64).toString("hex");
}

async function filterTokens() {
  const res = await pool.query(
    "DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '7 days' RETURNING id",
  );
  if (res.rows.length > 0) {
    console.log(`Deleted ${res.rows.length} expired sessions`);
  }
}

async function login(ws, data) {
  try {
    const res = await pool.query("SELECT * FROM users WHERE username = $1", [
      data.Username,
    ]);
    if (res.rows.length === 0) {
      ws.send(JSON.stringify({ success: false, message: "User not found" }));
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
      console.log(`Session created for ${data.Username} with ID: ${sessionId}`);
    } else {
      ws.send(
        JSON.stringify({ success: false, message: "Incorrect password" }),
      );
      return;
    }
  } catch (err) {
    console.error("Login error:", err.message);
    ws.send(JSON.stringify({ success: false, message: "Database error" }));
  }
}

async function register(ws, data) {
  try {
    const hashedPassword = await hashPassword(data.Passwd);
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
}

module.exports = { filterTokens, login, register, hashPassword };
