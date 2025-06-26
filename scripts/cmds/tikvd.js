const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "tikvd",
    version: "2.1",
    role: 0,
    author: "Mr.Smokey {Asif Mahmud}",
    shortDescription: {
      en: "Search TikTok videos",
      bn: "টিকটক ভিডিও খুঁজুন",
      ban: "TikTok video khuji"
    },
    category: "media",
    guide: {
      en: "{pn} <search text> - Search and download a TikTok video",
      bn: "{pn} <সার্চ টেক্সট> - টিকটক ভিডিও সার্চ এবং ডাউনলোড করুন",
      ban: "{pn} <search text> - TikTok video khuji ebong download koren"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    const reply = (msg) => api.sendMessage(msg, event.threadID, event.messageID);

    if (!query) return reply("❗ Please provide a search term.");

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const res = await axios.get(`https://tanjiro-api-v2.vercel.app/tiktok/search?q=${encodeURIComponent(query)}`);

      if (!res.data || !res.data.data || res.data.data.length === 0)
        return reply("❌ No video found for your search.");

      const video = res.data.data[0];
      const videoUrl = video.play;
      const message = `🎵 TikTok Video Found:

👤 ${video.author.nickname}
🔗 Username: ${video.author.unique_id}`;

      const tempPath = path.join(__dirname, 'cache', 'tiktok_tmp.mp4');
      const writer = fs.createWriteStream(tempPath);

      const videoStream = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
      videoStream.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: message,
            attachment: fs.createReadStream(tempPath)
          },
          event.threadID,
          () => fs.unlinkSync(tempPath)
        );
      });
    } catch (err) {
      console.error(err);
      reply("❌ Failed to fetch TikTok video. Try again later.");
    }
  }
};
