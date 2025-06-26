const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "fbget",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Download from Facebook",
    longDescription: "Download Facebook video or audio (with link only)",
    category: "media",
    guide: "{pn} [audio/video] [facebook_url]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    // 🔐 Check arguments
    if (args.length < 2) {
      return api.sendMessage(
        "❌ Usage: fbget audio <url> or fbget video <url>",
        threadID,
        messageID
      );
    }

    const type = args[0];
    const url = args[1];

    if (!url.includes("facebook.com")) {
      return api.sendMessage("❌ Please provide a valid Facebook URL.", threadID, messageID);
    }

    const API_URL = `https://fb-api.rajdx.com/fb?url=${encodeURIComponent(url)}`;

    try {
      const wait = await api.sendMessage("⏳ Downloading, please wait...", threadID);
      const res = await axios.get(API_URL);

      if (!res.data || (!res.data.audio && !res.data.sd && !res.data.hd)) {
        throw new Error("No media found at this link.");
      }

      let fileUrl, fileName;
      if (type === "audio") {
        fileUrl = res.data.audio;
        fileName = "facebook-audio.mp3";
      } else if (type === "video") {
        fileUrl = res.data.hd || res.data.sd;
        fileName = "facebook-video.mp4";
      } else {
        return api.sendMessage("❌ Invalid type. Use 'audio' or 'video' only.", threadID, messageID);
      }

      const filePath = __dirname + "/cache/" + fileName;
      const media = await axios.get(fileUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(media.data, "binary"));

      return api.sendMessage({
        body: `✅ Here's your downloaded ${type}:`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Failed to download. Try a valid Facebook video/audio link.", threadID, messageID);
    }
  }
};
