const bcrypt = require("bcrypt");

const { pool } = require("./db");

async function hash(str) {
  return bcrypt.hash(str, 10);
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

async function verifySession(token, userId) {
  try {
    const res = await pool.query(
      "SELECT token FROM sessions WHERE user_id = $1",
      [userId],
    );
    if (res.rows.length === 0) {
      return false;
    }
    for (const row of res.rows) {
      const match = await bcrypt.compare(token, row.token);
      if (match) {
        console.log(`Session verified for user ID: ${userId}`);
        return true;
      } else {
        const invalid = await pool.query(
          "DELETE FROM sessions WHERE user_id = $1 AND token = $2",
          [userId, row.token],
        );
        console.log(
          `Deleted invalid session for user ID: ${userId}, token: ${row.token}`,
        );
      }
    }
    console.log(`No valid session found for user ID: ${userId}`);
    return false;
  } catch (err) {
    console.error("Error verifying session:", err.message);
    return false;
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
      const token = generateToken();
      const sesRes = await pool.query(
        "INSERT INTO sessions (user_id, token) VALUES ($1, $2) RETURNING id",
        [user.id, hash(token)],
      );
      ws.send(
        JSON.stringify({ success: true, session: token, userId: user.id }),
      );
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
    const hashedPassword = await hash(data.Passwd);
    const userRes = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [data.Username, hashedPassword],
    );
    const userId = userRes.rows[0].id;
    const token = generateToken();
    const sesRes = await pool.query(
      "INSERT INTO sessions (user_id, token) VALUES ($1, $2) RETURNING id",
      [userId, hash(token)],
    );
    if (sesRes.rows.length === 0) {
      console.error("Failed to create session for new user");
      ws.send(
        JSON.stringify({ success: false, message: "Session creation failed" }),
      );
      return;
    }
    ws.send(JSON.stringify({ success: true, session: token, userId: userId }));
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

module.exports = { filterTokens, login, register, hash, verifySession };
