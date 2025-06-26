const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: "gfx6",
    aliases: ["gfxs6"],
    version: "2.0", // ✅ Updated
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 35,
    role: 0,
    shortDescription: "GFX logo toiri koren",
    longDescription: "Text diye GFX logo toiri koren (HD image ase)",
    category: "gfx",
    guide: {
      en: "{p}{n} [text]",
      bn: "{p}{n} [nam ba lekha]"
    }
  },

  onStart: async function ({ message, args }) {
    const text = args.join(" ");

    if (!text) {
      return message.reply("📝 Text den, tarpor ami GFX banamu.");
    }

    const apiKey = "tanjiro";
    const imgURL = `https://tanjiro-api.onrender.com/gfx6?name=${encodeURIComponent(text)}&api_key=${apiKey}`;

    try {
      const stream = await global.utils.getStreamFromURL(imgURL);

      if (!stream) {
        return message.reply("❌ GFX generate korte problem hoise. API hoito down ase.");
      }

      message.reply({
        body: `✅ GFX Ready for '${text}'`,
        attachment: stream
      });
    } catch (err) {
      console.error("GFX6 Error:", err);
      message.reply("❌ Error hoise GFX banate. API or connection check korun.");
    }
  }
};
