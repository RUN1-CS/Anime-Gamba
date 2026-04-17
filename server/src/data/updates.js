const { pool } = require("../db");
const { hashPassword } = require("../auth");

async function updateUserPassword(userId, newPassword) {
  try {
    const hashedPassword = await hashPassword(newPassword);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);
    console.log(`Password updated for user ID: ${userId}`);
  } catch (err) {
    console.error("Error updating password:", err.message);
  }
}

async function updateUserSettings(userId, newUsername, newEmail) {
  try {
    await pool.query(
      "UPDATE users SET username = $1, email = $2 WHERE id = $3",
      [newUsername, newEmail, userId],
    );
    console.log(`Settings updated for user ID: ${userId}`);
  } catch (err) {
    console.error("Error updating settings:", err.message);
  }
}

module.exports = { updateUserPassword, updateUserSettings };
