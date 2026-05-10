/**
 *  AnimeGamba - A web application that provides users with a randomly selected
 *  female anime character (waifu) from the AniList database, along with their popularity
 *  (favourites count). Users can also search for specific characters by name to view their details.
 *  Copyright (C) 2026  RUN1/RUN1-CS
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Authentication module for handling user registration, login, session management, and token filtering.
 *
 * This module provides functions to:
 * - Register new users by hashing their passwords and creating a session token.
 * - Log in existing users by verifying their credentials and generating a session token.
 * - Verify the validity of session tokens for authenticated requests.
 * - Filter out expired session tokens from the database to maintain security and performance.
 */

const bcrypt = require("bcrypt");

const { pool } = require("./db");
const { log } = require("./logging/logs");

// Function to hash a string using bcrypt with a salt rounds of 10.
// For some reason when I exported it wouldn't work, so I just put it here. If it works don't touch it. yk
async function hash(str) {
  return bcrypt.hash(str, 10);
}

// Function to generate a secure random token for session management.
function generateToken() {
  return require("crypto").randomBytes(64).toString("hex");
}

// Function to filter out expired session tokens from the database.
// This helps to keep the sessions table clean and secure by removing tokens that are older than 7 days.
async function filterTokens() {
  const res = await pool.query(
    "DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '7 days' RETURNING id",
  );
  if (res.rows.length > 0) {
    log(`Deleted ${res.rows.length} expired sessions`, "info", "auth");
  }
}

// Function to verify if a given session token is valid for a specific user ID.
// This is used to authenticate requests that require a valid session.
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
      // The tokens are stored as hashed values in the database, so we need to compare the provided token with the hashed tokens using bcrypt.
      const match = await bcrypt.compare(token, row.token);
      if (match) {
        // If a matching token is found, we log the successful verification and return true to indicate that the session is valid.
        log(`Session verified for user ID: ${userId}`, "info", "auth");
        return true;
      }
    }
    // Ofc the exact opposite is invalid session. LOOOGSSS
    log(`No valid session found for user ID: ${userId}`, "warn", "auth");
    return false;
  } catch (err) {
    // No I am not repeating my self.
    log(`Error verifying session: ${err.message}`, "error", "auth");
    return false;
  }
}

// Function to handle user login by verifying credentials and generating a session token.
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
    // The passwords are stored as hashed values in the database so we compareee.
    const match = await bcrypt.compare(data.Passwd, user.password);
    if (match) {
      // Tokeeens
      const token = generateToken();
      // HASHING, safety first yk.
      const hashed = await hash(token);

      const sesRes = await pool.query(
        "INSERT INTO sessions (user_id, token) VALUES ($1, $2) RETURNING id",
        [user.id, hashed],
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
    // Nuh uh
    log(`Login error: ${err.message}`, "error", "auth");
    ws.send(JSON.stringify({ success: false, message: "Database error" }));
  }
}

// If you can't log in then just register. It's not rocket science or music theory.
async function register(ws, data) {
  try {
    // HASH
    const hashedPassword = await hash(data.Passwd);
    const userRes = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [data.Username, hashedPassword],
    );
    const userId = userRes.rows[0].id;
    // Tokeeenz
    const token = generateToken();
    // Hash again
    const hashed = await hash(token);

    // Insert the new session into the database for the newly registered user.
    const sesRes = await pool.query(
      "INSERT INTO sessions (user_id, token) VALUES ($1, $2) RETURNING id",
      [userId, hashed],
    );
    if (sesRes.rows.length === 0) {
      log("Failed to create session for new user", "error", "auth");
      ws.send(
        JSON.stringify({ success: false, message: "Session creation failed" }),
      );
      return;
    }
    ws.send(JSON.stringify({ success: true, session: token, userId: userId }));
  } catch (err) {
    // -_-
    log(`Register error: ${err.message}`, "error", "auth");
    ws.send(
      JSON.stringify({
        success: false,
        message: err.message || "Database error",
      }),
    );
  }
}

// What are you doing down here?
module.exports = { filterTokens, login, register, hash, verifySession };
