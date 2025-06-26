const axios = require('axios');

module.exports = {
  config: {
    name: "gfx",
    aliases: ["gfxs"],
    version: "2.0", // ✅ Updated
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 20,
    role: 0,
    shortDescription: "Make a GFX logo",
    longDescription: "Generate a GFX logo using a name",
    category: "gfx",
    guide: {
      en: "{p}{n} name"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      const text = args.join(" ");
      if (!text) return message.reply("\u274C Doya kore kono text dao!\nUse: gfx YourName");

      await message.reply("\u23F3 GFX logo toiri hocche, ophekha korun...");

      const imgUrl = `https://api.popcat.xyz/generate/gfx?text=${encodeURIComponent(text)}`;

      const form = {
        body: `\u2705 Here's your GFX logo ✨`,
        attachment: [await global.utils.getStreamFromURL(imgUrl)]
      };

      message.reply(form);
    } catch (e) {
      console.error("[GFX1 ERROR]", e);
      message.reply("\u274C Error hoyeche. Poroborti te abar try korun.");
    }
  }
};
