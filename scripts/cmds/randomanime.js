const axios = require("axios");
const fs = require("fs");
const path = require("path");
const request = require("request");

module.exports = {
  config: {
    name: "animevideo2",
    aliases: ["randomanime"],
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Get a random anime video",
      bn: "র‍্যান্ডম অ্যানিমে ভিডিও পান",
      banglish: "Random anime video nin"
    },
    longDescription: {
      en: "Send a random anime video from a working API",
      bn: "একটি কাজ করে এমন API থেকে র‍্যান্ডম অ্যানিমে ভিডিও পাঠান",
      banglish: "Ekta kaj kore emon API theke random anime video pathan"
    },
    category: "anime",
    guide: {
      en: "{pn}",
      bn: "{pn}",
      banglish: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

    try {
      // Send loading message
      api.sendMessage("⏳ Anime video is loading, Senpai...", event.threadID);

      // Get the anime video list
      const res = await axios.get("https://raw.githubusercontent.com/OpenBangla/dev-static/main/anime-video-list.json");
      const list = res.data;

      if (!Array.isArray(list) || list.length === 0)
        return api.sendMessage("🚫 No anime videos found.", event.threadID);

      const videoUrl = list[Math.floor(Math.random() * list.length)];
      const filePath = path.join(cachePath, "anime_video.mp4");

      // Download video
      const file = fs.createWriteStream(filePath);
      request(videoUrl)
        .pipe(file)
        .on("finish", () => {
          api.sendMessage(
            {
              body: "🎥 Here is your anime video, Senpai~",
              attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => fs.unlinkSync(filePath)
          );
        });
    } catch (err) {
      console.error("AnimeVideo Error:", err);
      api.sendMessage("❌ Failed to load anime video. Contact bot owner.", event.threadID);
    }
  }
};
