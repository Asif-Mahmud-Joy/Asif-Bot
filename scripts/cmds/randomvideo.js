const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "randomvideo",
    aliases: [],
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 20,
    role: 0,
    shortDescription: {
      en: "Get a random video",
      bn: "একেরandom ভিডিও পাও",
      banglish: "Random video paw"
    },
    longDescription: {
      en: "Sends a random video from a trusted API",
      bn: "একটি র‍্যান্ডম ভিডিও পাঠানো হবে নির্ভরযোগ্য API থেকে",
      banglish: "Ekta random video pathano hobe trusted API theke"
    },
    category: "fun",
    guide: {
      en: "{pn}",
      bn: "{pn}",
      banglish: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const filePath = path.join(__dirname, "cache", "random_video.mp4");
    const API_URL = "https://raw.githubusercontent.com/OpenBangladesh/video-api/main/list.json"; // Updated API list

    try {
      api.sendMessage("🎥 Video load hochhe... please wait...", event.threadID);

      const res = await axios.get(API_URL);
      const videoList = res.data;

      if (!Array.isArray(videoList) || videoList.length === 0)
        throw new Error("Video list empty");

      const randomVideo = videoList[Math.floor(Math.random() * videoList.length)];
      const videoURL = randomVideo.url;

      const videoBuffer = (await axios.get(videoURL, { responseType: 'arraybuffer' })).data;
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, videoBuffer);

      return api.sendMessage({
        body: `🎬 Here's your random video!`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID);

    } catch (err) {
      console.error("Random Video Error:", err);
      return api.sendMessage("❌ Video load korte problem holo. Try again later.", event.threadID);
    }
  }
};
