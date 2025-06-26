const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "fbvideo",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Download Facebook video",
    longDescription: "Download public Facebook video (story/post) using real API",
    category: "media",
    guide: {
      en: "{pn} <facebook video url>"
    }
  },

  onStart: async function ({ args, message }) {
    if (!args[0]) return message.reply("🟠 Facebook video URL dao, bhai!");
    const url = args[0];

    message.reply("⏳ Video download hoche, wait...", async (err, info) => {
      try {
        const api = `https://api.videofbdownload.com/api/facebook?url=${encodeURIComponent(url)}`;
        const res = await axios.get(api);

        if (!res.data || !res.data.sd) return message.reply("❌ Video link invalid or download API kaj kortese na.");

        const videoStream = await axios.get(res.data.sd, { responseType: 'stream' });
        const tempPath = __dirname + "/cache/fbvideo.mp4";
        const writer = fs.createWriteStream(tempPath);

        videoStream.data.pipe(writer);
        writer.on("finish", () => {
          message.reply({
            body: "✅ Download complete! Here is your video:",
            attachment: fs.createReadStream(tempPath)
          }, () => fs.unlinkSync(tempPath));
        });
      } catch (err) {
        console.error(err);
        message.reply("❌ Download e somossa hoyeche. Try another public video link.");
      }
    });
  }
};
