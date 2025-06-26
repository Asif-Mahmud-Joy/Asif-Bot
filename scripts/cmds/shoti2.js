const axios = require('axios');
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "shoti21",
    aliases: ["shoti31"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 20,
    role: 0,
    shortDescription: "Random TikTok shoti video",
    longDescription: "Fetches a random TikTok-style short video from a working API",
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const cachePath = path.join(__dirname, "cache");
    await fs.ensureDir(cachePath);

    const apiURL = 'https://api.kenliejugarap.com/api/others/shoti';

    try {
      const res = await axios.get(apiURL);

      if (!res.data || !res.data.url) {
        throw new Error("Invalid response from API");
      }

      const videoUrl = res.data.url;
      const fileExt = path.extname(videoUrl);
      const filePath = path.join(cachePath, `shoti${fileExt}`);

      const videoStream = (await axios.get(videoUrl, { responseType: 'stream' })).data;
      const writer = fs.createWriteStream(filePath);
      videoStream.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `📥 SHOTI READY SENPAI 😎✨`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        api.sendMessage("❌ File saving error!", event.threadID, event.messageID);
      });

    } catch (err) {
      console.error("API error:", err.message);
      api.sendMessage("❌ [ SHOTI API ERROR ] Server problem or API dead. Try again later or contact developer.", event.threadID, event.messageID);
    }
  }
};
