const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "shoti",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 20,
    category: "media",
    shortDescription: "Send Shoti short video",
    longDescription: "Pulls a Shoti (TikTok-style) short video and sends it.",
    guide: {
      en: "{pn} — to receive a random Shoti video"
    }
  },

  onStart: async function ({ api, event }) {
    const cachePath = path.join(__dirname, "cache");
    const videoFile = path.join(cachePath, `shoti.mp4`);

    try {
      // Ensure cache folder exists
      await fs.ensureDir(cachePath);

      // Notify user
      await api.sendMessage(`⏳ Please wait, fetching a Shoti video...`, event.threadID, event.messageID);

      // Use working API
      const { data } = await axios.get("https://api.kenliejugarap.com/api/others/shoti");
      if (!data || !data.url) throw new Error("Video URL not found in API response.");

      const videoUrl = data.url;

      // Download video with axios stream
      const response = await axios.get(videoUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(videoFile);

      response.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage({
          body: "✅ Here is your Shoti 🇻🇳",
          attachment: fs.createReadStream(videoFile)
        }, event.threadID, () => fs.unlinkSync(videoFile), event.messageID);
      });

      writer.on("error", (err) => {
        throw err;
      });

    } catch (err) {
      console.error("[Shoti Error]", err);
      api.sendMessage("❌ Could not fetch video. Please try again later.", event.threadID, event.messageID);
      api.setMessageReaction("😢", event.messageID, () => {}, true);
    }
  }
};
