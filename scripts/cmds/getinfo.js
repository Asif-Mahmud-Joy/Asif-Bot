const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "getinfo",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Get user info using UID",
    longDescription: "Provides Facebook user info based on UID input",
    category: "info",
    guide: {
      en: "{p}getinfo <uid>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const uid = args[0];
    if (!uid) return api.sendMessage("⚠️ UID dao! Usage: getinfo <uid>", event.threadID, event.messageID);

    try {
      const res = await api.getUserInfo(uid);
      const info = res[uid];

      if (!info) return api.sendMessage("❌ User information paoa jay nai.", event.threadID, event.messageID);

      const gender = info.gender === 2 ? "👦 Male" : info.gender === 1 ? "👧 Female" : "⚪ Unknown";
      const name = info.name || "Not found";
      const profileUrl = `https://facebook.com/${uid}`;

      const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
      const filePath = __dirname + `/cache/${uid}.jpg`;

      const callback = () => {
        api.sendMessage({
          body: `📄 Facebook Info:

👤 Name: ${name}
🔗 Profile: ${profileUrl}
🆔 UID: ${uid}
🚻 Gender: ${gender}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      };

      request(encodeURI(avatarUrl)).pipe(fs.createWriteStream(filePath)).on("close", callback);
    } catch (err) {
      console.error("[GETINFO ERROR]", err);
      return api.sendMessage("❌ Kisu ekta problem hoise. Try again pore.", event.threadID, event.messageID);
    }
  }
};
