const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "file",
    aliases: ["files"],
    version: "1.1",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send bot script",
      bn: "Bot-er file pathiye dao"
    },
    longDescription: {
      en: "Send a specific file from the bot folder",
      bn: "Bot-er ekta nirdishto file pathiye dey"
    },
    category: "𝗢𝗪𝗡𝗘𝗥",
    guide: {
      en: "{pn} <filename>",
      bn: "{pn} <filename>"
    }
  },

  onStart: async function ({ message, args, api, event }) {
    const permission = ["61571630409265"];

    if (!permission.includes(event.senderID)) {
      return api.sendMessage("❌ You don't have permission to use this command.", event.threadID, event.messageID);
    }

    if (!args[0]) {
      return api.sendMessage("⚠️ Please provide a file name. Example: .file config", event.threadID, event.messageID);
    }

    const fileName = args[0].replace(/\.js$/, "") + ".js";
    const filePath = path.join(__dirname, fileName);

    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`❌ File not found: ${fileName}`, event.threadID, event.messageID);
    }

    try {
      const fileBuffer = fs.readFileSync(filePath);
      return api.sendMessage({
        body: `✅ File sent: ${fileName}`,
        attachment: fileBuffer
      }, event.threadID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Error reading the file.", event.threadID, event.messageID);
    }
  }
};
