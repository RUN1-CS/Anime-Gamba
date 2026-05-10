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
 * AnimeGamba WebSocket Server
 *
 * This file takes care of WebSocket comms.
 * It bassically servers as a router for incoming messages, directing them to the appropriate handlers in the data and auth modules.
 */

const WebSocket = require("ws");

const config = require("./config.json");

// Importing all the necessary... all functions from other files. This keeps the code organized and modular.
const { filterTokens, login, register } = require("./auth");
const { getData, addWaifu, getTop } = require("./data/data");
const { exportData, importData } = require("./data/utils");
const { updateUserPassword, updateUserSettings } = require("./data/updates");
const { getUsernameBySession } = require("./db");
const { log } = require("./logging/logs");

const { getCharacter } = require("./anilistAPI.js");

const wss = new WebSocket.Server({ port: config.websocket.PORT || 3000 });

wss.on("connection", (ws) => {
  log(
    `New client ${ws._socket.remoteAddress} connected. Total clients: ${wss.clients.size}`,
    "info",
    "websocket",
  );

  ws.on("message", async (msg) => {
    // Before processing any message, we filter out expired sessions to keep the database clean.
    await filterTokens();
    // All comms is in JSON format, so parsing is done here.
    const data = JSON.parse(msg);
    // We route the message to the appropriate handler based on the "type" field in the incoming data.
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
        // Handling errors.
        try {
          const character = await getCharacter(data.name);
          ws.send(JSON.stringify({ success: true, character }));
        } catch (err) {
          log(`Error fetching character data: ${err.message}`, "error", "api");
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
      case "getTop":
        // Sometimes we need to wait for our DB.
        const top = await getTop();
        ws.send(JSON.stringify({ success: true, top }));
        break;
      default:
        // More error handling for unknown message types.
        log(
          `Received unknown message type: ${data.type} from ${ws._socket.remoteAddress}`,
          "warn",
          "websocket",
        );
        ws.send(
          JSON.stringify({ success: false, message: "Unknown message type" }),
        );
    }
  });

  ws.on("close", () => {
    log(`Client ${ws._socket.remoteAddress} disconnected`, "info", "websocket");
  });
});

wss.on("error", (error) => {
  log(`WebSocket error: ${error.message}`, "error", "websocket");
});
