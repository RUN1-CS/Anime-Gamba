/**
 * Database module for AnimeGamba server.
 *
 * This module handles all interactions with the PostgreSQL database, including:
 * - Establishing a connection pool to the database.
 * - Providing functions to retrieve user data, add waifus to a user's collection, and get the top users by score.
 * - Implementing error handling and logging for database operations.
 */

const pg = require("pg");
const bcrypt = require("bcrypt");

const config = require("./config.json");
const { log } = require("./logging/logs");

// Function to hash a string using bcrypt with a salt rounds of 10.
async function hash(str) {
  return bcrypt.hash(str, 10);
}

// Database configuration using values from config.json, with defaults for host and port.
const dbConfig = {
  user: config.database.POSTGRES_USER,
  host: config.database.POSTGRES_HOST || "db",
  database: config.database.POSTGRES_DB,
  password: config.database.POSTGRES_PASSWORD,
  port: Number(config.database.POSTGRES_PORT || 5432),
};

// Create a new connection pool to the PostgreSQL database using the provided configuration.
const pool = new pg.Pool(dbConfig);

pool.on("connect", () => {
  log("Database connected successfully", "info", "database");
});

// Handle errors emitted by the connection pool and log them appropriately.
pool.on("error", (err) => {
  log("Database pool error:", "error", "database");
});

// Function to retrieve the username associated with a given session token.
async function getUsernameBySession(session) {
  try {
    // Hash the session token to match the format stored in the database.
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
    // Log any errors that occur during the database query and return null to indicate failure.
    log(`Error in getUsernameBySession: ${err.message}`, "error", "database");
    return null;
  }
}

// Function to check if a user already has a specific waifu in their collection to prevent duplicates.
async function duplicateCheck(userId, waifuName) {
  try {
    const res = await pool.query("SELECT waifus FROM users WHERE id = $1", [
      userId,
    ]);
    if (res.rows.length === 0) {
      return false;
    }
    // The waifus are stored as a JSON array in the database, so we need to parse it and check if the waifuName already exists.
    const rawWaifus = res.rows[0].waifus;
    const waifuList = Array.isArray(rawWaifus) ? rawWaifus : [];
    for (const w of waifuList) {
      // Each waifu can be stored as a string or an object, so we handle both cases to extract the name for comparison.
      const waifu = typeof w === "string" ? JSON.parse(w)?.name : w?.name;
      if (waifu === waifuName) {
        return true;
      }
    }
    return false;
  } catch (err) {
    // Log any errors blah blah blah. It's the same thing all the time.
    log(`Error in duplicateCheck: ${err.message}`, "error", "database");
    return false;
  }
}

// Saataa Andagii
module.exports = { pool, getUsernameBySession, duplicateCheck };
