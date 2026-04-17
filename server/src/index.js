const WebSocket = require("ws");

const { filterTokens, login, register } = require("./auth");
const { getData, addWaifu } = require("./data/data");
const { exportData, importData } = require("./data/utils");
const { updateUserPassword, updateUserSettings } = require("./data/updates");
const { getUsernameBySession } = require("./db");

const { getCharacter } = require("./anilistAPI.js");

const wss = new WebSocket.Server({ port: 3000 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (msg) => {
    await filterTokens();
    const data = JSON.parse(msg);
    switch (data.type) {
      case "login":
        await login(ws, data);
        break;
      case "register":
        await register(ws, data);
        break;
      case "getData":
        await getData(ws, data);
        break;
      case "addWaifu":
        await addWaifu(ws, data);
        break;
      case "getCharacter":
        try {
          const character = await getCharacter(data.name);
          ws.send(JSON.stringify({ success: true, character }));
        } catch (err) {
          console.error("getCharacter error:", err.message);
          ws.send(
            JSON.stringify({ success: false, message: "Character not found" }),
          );
        }
        break;
      case "requestExport":
        await exportData(ws, data);
        break;
      case "importData":
        await importData(ws, data);
        break;
      case "updatePassword":
        await updateUserPassword(
          getUsernameBySession(data.session),
          data.newPassword,
        );
        break;
      case "updateSettings":
        await updateUserSettings(
          getUsernameBySession(data.session),
          data.newUsername,
          data.newEmail,
        );
        break;
      default:
        ws.send(
          JSON.stringify({ success: false, message: "Unknown message type" }),
        );
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

wss.on("error", (error) => {
  console.error("WebSocket error:", error);
});

console.log("WebSocket server is running on ws://localhost:3000");
