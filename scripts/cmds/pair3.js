const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair3",
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Pair you with someone randomly in the group",
      bn: "Group-e random ekjon-er shathe tomake pair kore"
    },
    longDescription: {
      en: "Randomly pairs you with someone in the group with a love percentage",
      bn: "Group-e ekjon random member-er shathe tomake love percentage shoh pair kore"
    },
    category: "love",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    const { threadID, messageID, senderID } = event;
    const { participantIDs } = await api.getThreadInfo(threadID);
    const botID = api.getCurrentUserID();
    const listUserID = participantIDs.filter(id => id !== botID && id !== senderID);

    if (listUserID.length === 0) {
      return api.sendMessage("[❌] Kono onno member nai pairing-er jonno!", threadID, messageID);
    }

    const targetID = listUserID[Math.floor(Math.random() * listUserID.length)];
    const lovePercentage = Math.floor(Math.random() * 101);

    const senderName = (await usersData.get(senderID)).name;
    const targetName = (await usersData.get(targetID)).name;

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    try {
      const [avatar1, avatar2, gifLove] = await Promise.all([
        axios.get(`https://graph.facebook.com/${senderID}/picture?width=512&height=512`, { responseType: "arraybuffer" }),
        axios.get(`https://graph.facebook.com/${targetID}/picture?width=512&height=512`, { responseType: "arraybuffer" }),
        axios.get("https://i.ibb.co/y4dWfQq/image.gif", { responseType: "arraybuffer" })
      ]);

      const imgPath1 = path.join(cacheDir, "pair-avt1.png");
      const imgPath2 = path.join(cacheDir, "pair-avt2.png");
      const gifPath = path.join(cacheDir, "pair-love.gif");

      await Promise.all([
        fs.writeFile(imgPath1, avatar1.data),
        fs.writeFile(imgPath2, avatar2.data),
        fs.writeFile(gifPath, gifLove.data)
      ]);

      const message = {
        body: `💘 Pair successful!
❤️ ${senderName} ❤️ ${targetName}
💞 Love Match: ${lovePercentage}%
🕊️ Wish you a hundred years of happiness!`,
        mentions: [
          { id: senderID, tag: senderName },
          { id: targetID, tag: targetName }
        ],
        attachment: [
          fs.createReadStream(imgPath1),
          fs.createReadStream(gifPath),
          fs.createReadStream(imgPath2)
        ]
      };

      return api.sendMessage(message, threadID, messageID);
    } catch (err) {
      console.error("Pair3 error:", err);
      return api.sendMessage("[⚠️] Pair bananor somoy vul hoyeche.", threadID, messageID);
    }
  }
};
