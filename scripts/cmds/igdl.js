const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
  config: {
    name: "igdl",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    version: "2.0",
    role: 0,
    shortDescription: "Download Instagram video",
    longDescription: "Download Instagram videos using a working API.",
    category: "media",
    guide: {
      en: "{pn} <instagram_video_link>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const link = args[0];

    if (!link || !link.startsWith("https://www.instagram.com/")) {
      return api.sendMessage("📎 Please provide a valid Instagram video link.", event.threadID, event.messageID);
    }

    api.sendMessage("⏳ Downloading Instagram video... Please wait...", event.threadID, event.messageID);

    try {
      const res = await axios.get(`https://api.zenoapi.online/api/download/instagram?url=${encodeURIComponent(link)}&apikey=zenoofc`);

      if (!res.data || !res.data.status || !res.data.result || !res.data.result.url) {
        throw new Error("Invalid response from API");
      }

      const videoURL = res.data.result.url;
      const path = `${__dirname}/cache/ig_video_${Date.now()}.mp4`;

      const videoData = (await axios.get(videoURL, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(path, Buffer.from(videoData));

      return api.sendMessage({
        body: "✅ Here's your Instagram video:",
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path), event.messageID);
    } catch (error) {
      console.error("Instagram DL Error:", error);
      return api.sendMessage("❌ Failed to download the video. Try another link or wait a moment.", event.threadID, event.messageID);
    }
  }
};
