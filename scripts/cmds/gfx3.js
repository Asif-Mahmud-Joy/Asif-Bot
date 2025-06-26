const axios = require('axios');

module.exports = {
  config: {
    name: "gfx3",
    version: "2.0", // ✅ Updated
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 10,
    role: 0,
    shortDescription: "Make a GFX logo",
    longDescription: "Generate a GFX logo using name and subname",
    category: "gfx",
    guide: {
      en: "{p}{n} name | subname",
    }
  },

  onStart: async function ({ message, event, api }) {
    try {
      const info = event.body.slice(event.body.indexOf(' ') + 1);

      if (!info.includes("|")) {
        return message.reply("\u274C Format vul! Use: gfx3 name | subname");
      }

      const [text, text1] = info.split("|").map(item => item.trim());

      if (!text || !text1) {
        return message.reply("\u274C Dono text thik moto dao! Format: gfx3 name | subname");
      }

      await message.reply("\u23F3 Processing... Please wait...");

      const imgUrl = `https://api.popcat.xyz/generate/gfx?text=${encodeURIComponent(text)}&text2=${encodeURIComponent(text1)}`;

      const form = {
        body: "\u2705 Here's your GFX logo \u2728",
        attachment: [await global.utils.getStreamFromURL(imgUrl)]
      };

      message.reply(form);
    } catch (error) {
      console.error("[GFX3 ERROR]", error);
      message.reply("\u274C Something went wrong while generating the GFX logo. Try again later.");
    }
  }
};
