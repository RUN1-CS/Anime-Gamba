const crypto = require("crypto");

const config = require("./config.json");

function encrypt(text) {
  if (typeof text !== "string") {
    throw new Error("Input must be a string");
  }
  const iv = crypto.randomBytes(16);
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
    throw new Error("Input must be a string");
  }
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

module.exports = { encrypt, decrypt };
