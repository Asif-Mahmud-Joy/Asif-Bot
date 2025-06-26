const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "f84",
    aliases: [],
    version: "1.2",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Random Farlight 84 video downloader",
    longDescription: "Downloads and sends a random Farlight gameplay video",
    category: "media",
    guide: {
      en: "{pn} f84"
    }
  },

  onStart: async function ({ api, event }) {
    // Banglish: Ensure cache directory ache
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const tempFilePath = path.join(cacheDir, 'farlight.mp4');

    try {
      await api.sendMessage('📥 Downloading a random Farlight 84 video, boss... 🎮', event.threadID);

      // Banglish: API call theke random video URL paoa
      const { data } = await axios.get('https://farlight-api.z4f.dev/random');
      const videoUrl = data.url;
      if (!videoUrl) {
        return api.sendMessage('❌ Video URL paoa jai nai. Try abar porer somoy.', event.threadID);
      }

      // Banglish: Video download kore local file e write korchi
      const response = await axios.get(videoUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(tempFilePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        // Banglish: Multiline message use korar jonno backtick
        const bodyMsg = `🔥 Farlight 84 Incoming!\nReady to join the fight? 💥`;
        api.sendMessage({ body: bodyMsg, attachment: fs.createReadStream(tempFilePath) }, event.threadID, () => {
          // Banglish: Temp file delete korechi
          fs.unlink(tempFilePath, err => {
            if (err) console.error('❌ Error deleting temp file:', err);
          });
        });
      });

      writer.on('error', (err) => {
        console.error('❌ Stream error:', err);
        api.sendMessage('❌ Video stream save korte vul hoise.', event.threadID);
      });

    } catch (err) {
      console.error('❌ API or file error:', err);
      api.sendMessage('❌ Sorry, Farlight API unavailable ba error hoise.', event.threadID);
    }
  }
};
