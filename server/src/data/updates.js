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
 * Updates users...
 * It's called updates...
 */

const { pool } = require("../db");
const { hash } = require("../auth");

// Updates users password...
async function updateUserPassword(userId, newPassword) {
  try {
    const hashedPassword = await hash(newPassword);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);
  } catch (err) {
    console.error("Error updating password:", err.message);
  }
}

// and settigns here
async function updateUserSettings(userId, newUsername, newEmail) {
  try {
    await pool.query(
      "UPDATE users SET username = $1, email = $2 WHERE id = $3",
      [newUsername, newEmail, userId],
    );
  } catch (err) {
    console.error("Error updating settings:", err.message);
  }
}

module.exports = { updateUserPassword, updateUserSettings };
