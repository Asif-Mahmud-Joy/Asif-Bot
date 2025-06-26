const axios = require('axios');

module.exports = {
  config: {
    name: "gfx4",
    version: "3.0", // ✅ Fully Upgraded
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 10,
    role: 0,
    shortDescription: "Make a GFX logo",
    longDescription: "Generate a GFX logo using text and subtext",
    category: "gfx",
    guide: {
      en: "{p}{n} name | subname"
    }
  },

  onStart: async function ({ message, event, api }) {
    try {
      const info = event.body.slice(event.body.indexOf(' ') + 1);
      if (!info.includes("|")) {
        return message.reply("\u274C Format vul! Use: gfx4 name | subname");
      }

      const [text, text1] = info.split("|").map(t => t.trim());

      if (!text || !text1) {
        return message.reply("\u274C Dono text thik moto dao! Format: gfx4 name | subname");
      }

      await message.reply("\u23F3 Processing... Please wait...");

      // ✅ New reliable API (Fast + Working)
      const apiUrl = `https://api.popcat.xyz/generate/gfx?text=${encodeURIComponent(text)}&text2=${encodeURIComponent(text1)}`;

      const form = {
        body: "\u2705 Here's your GFX logo \u2728",
        attachment: [await global.utils.getStreamFromURL(apiUrl)]
      };

      message.reply(form);
    } catch (error) {
      console.error("[GFX4 ERROR]", error);
      message.reply("\u274C Something went wrong while generating the GFX logo. Try again later.");
    }
  }
};
