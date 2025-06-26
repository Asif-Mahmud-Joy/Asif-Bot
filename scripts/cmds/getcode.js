const axios = require("axios");

module.exports = {
  config: {
    name: "getcode",
    aliases: ["getCode"],
    version: "2.0", // ✅ Updated
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Fetch code from Pastebin",
    longDescription: "Fetch raw code from a given Pastebin link",
    category: "utility",
    guide: {
      en: "{pn} <pastebin-link>",
    },
  },

  onStart: async function ({ api, event, args }) {
    const pastebinUrl = args[0];

    if (!pastebinUrl) {
      return api.sendMessage("📎 Pastebin link dao!", event.threadID, event.messageID);
    }

    if (!pastebinUrl.startsWith("https://pastebin.com/")) {
      return api.sendMessage("❌ Valid Pastebin link na! Example: https://pastebin.com/abc123", event.threadID, event.messageID);
    }

    const codeId = pastebinUrl.split("/").pop();

    try {
      const response = await axios.get(`https://pastebin.com/raw/${codeId}`);
      const code = response.data;

      if (code.length > 20000) {
        return api.sendMessage("❗️ Code onek boro! File akare patacchi...", event.threadID, event.messageID, async () => {
          const fs = require("fs-extra");
          const path = `${__dirname}/tmp/${codeId}.txt`;

          await fs.outputFile(path, code);

          api.sendMessage(
            {
              body: "✅ Code file attach kora holo:",
              attachment: fs.createReadStream(path),
            },
            event.threadID,
            () => fs.unlinkSync(path),
            event.messageID
          );
        });
      } else {
        return api.sendMessage(`✅ Code:

${code}`, event.threadID, event.messageID);
      }
    } catch (error) {
      console.error("[GETCODE ERROR]", error);
      return api.sendMessage("❌ Code nite giye error hoise. Link check koro.", event.threadID, event.messageID);
    }
  },
};
