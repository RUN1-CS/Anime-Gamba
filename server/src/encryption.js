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
 *  Encryption utility functions for the AnimeGamba server.
 *
 *  This module provides functions to encrypt and decrypt data using AES-256-CBC.
 *  It uses a key derived from the ENCRYPTION_KEY specified in the config.json file.
 *  The encrypted data is stored in the format: iv:encryptedData, where iv is the initialization vector used for encryption.
 */

const crypto = require("crypto");

const config = require("./config.json");
const { log } = require("./logging/logs");

function encrypt(text) {
  // Input validation to ensure we are working with strings.
  if (typeof text !== "string") {
    log("Encryption error: Input must be a string", "error", "encryption");
    throw new Error("Input must be a string");
  }

  // Generate a random initialization vector (IV) for encryption.
  const iv = crypto.randomBytes(16);
  // Derive a key from the ENCRYPTION_KEY using SHA-256 hashing.
  const key = crypto
    .createHash("sha256")
    .update(config.database.ENCRYPTION_KEY)
    .digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encrypted) {
  if (typeof encrypted !== "string") {
    log("Decryption error: Input must be a string", "error", "encryption");
    throw new Error("Input must be a string");
  }
  // The encrypted data is expected to be in the format: iv:encryptedData
  const parts = encrypted.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encryptedData = parts[1];
  const key = crypto
    .createHash("sha256")
    .update(config.database.ENCRYPTION_KEY)
    .digest();
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Exporting the encrypt and decrypt functions for use in other parts of the application.
module.exports = { encrypt, decrypt };
