const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const process = require("process");

module.exports.config = {
  name: "resetsqlite",
  version: "7.1.0",
  permission: 3,
  credits: "✨ Asif Mahmud ✨",
  prefix: true,
  description: "Reset the SQLite database and restart the bot.",
  category: "operator",
  usages: "{p}resetsqlite",
  cooldowns: 0,
  dependencies: {
    "fs-extra": "",
    "child_process": "",
    "process": ""
  }
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  // 🔍 Automatically find the .sqlite file in the expected directory
  const dbDir = path.resolve(__dirname, '../../system/database/datasqlite');

  if (!fs.existsSync(dbDir)) {
    return api.sendMessage("❌ Directory not found: 'system/database/datasqlite'", threadID, messageID);
  }

  const files = fs.readdirSync(dbDir);
  const sqliteFile = files.find(file => file.endsWith(".sqlite"));

  if (!sqliteFile) {
    return api.sendMessage("❌ No .sqlite database found to delete.", threadID, messageID);
  }

  const fullPath = path.join(dbDir, sqliteFile);

  api.sendMessage(`⚠️ [ASIF SYSTEM] Resetting database file: ${sqliteFile}...\nPlease wait...`, threadID, messageID);

  exec(`rm -rf "${fullPath}"`, (error, stdout, stderr) => {
    if (error) {
      return api.sendMessage(`❌ Error while deleting:\n${error.message}`, threadID, messageID);
    }

    if (stderr) {
      return api.sendMessage(`⚠️ Warning:\n${stderr}`, threadID, messageID);
    }

    api.sendMessage("✅ Database reset successfully!\n🔁 Restarting bot in 1 second...", threadID, () => {
      setTimeout(() => process.exit(1), 1000);
    });
  });
};
