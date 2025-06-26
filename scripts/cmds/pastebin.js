const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pastebin",
    version: "2.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Upload file content to Pastebin",
      bn: "File-er content Pastebin-e upload koren"
    },
    longDescription: {
      en: "Uploads the contents of a given file in the cmds folder to Pastebin and sends the raw link.",
      bn: "cmds folder-e thaka kono file-er content Pastebin-e upload kore link dey"
    },
    category: "utility",
    guide: {
      en: "{pn} <filename> (without .js)",
      bn: "{pn} <filename> (.js chara)"
    }
  },

  onStart: async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const fileName = args[0];

    if (!fileName) return api.sendMessage("[❌] File name dao!", threadID, messageID);

    const filePathNoExt = path.join(__dirname, '..', 'cmds', fileName);
    const filePathWithExt = filePathNoExt + '.js';
    let filePath = null;

    if (await fs.pathExists(filePathNoExt)) filePath = filePathNoExt;
    else if (await fs.pathExists(filePathWithExt)) filePath = filePathWithExt;
    else return api.sendMessage("[❌] File pawa jay nai!", threadID, messageID);

    try {
      const content = await fs.readFile(filePath, 'utf8');

      const res = await axios.post("https://dpaste.org/api/", null, {
        params: {
          content,
          syntax: "javascript",
          expiry_days: 7
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      return api.sendMessage(`[✅] File upload hoyeche:
🔗 ${res.data}`, threadID, messageID);
    } catch (err) {
      console.error("Upload error:", err);
      return api.sendMessage("[⚠️] Upload e somossa hoise!", threadID, messageID);
    }
  }
};
