const axios = require('axios');
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "gfx5",
    aliases: ["gfxs5"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 20,
    role: 0,
    shortDescription: "GFX logo create koro",
    longDescription: "Text theke GFX style logo create koro tanjiro API diye.",
    category: "gfx",
    guide: {
      en: "{p}{n} YourText"
    }
  },

  onStart: async function ({ message, args }) {
    const text = args.join(" ");
    if (!text) return message.reply("📝 Text dao GFX logo bananor jonno!");

    const imgURL = `https://tanjiro-api.onrender.com/gfx5?text=${encodeURIComponent(text)}&api_key=tanjiro`;

    try {
      const imageStream = await global.utils.getStreamFromURL(imgURL);

      message.reply({
        body: `✅ Ready! Ei holo tomar GFX logo:`,
        attachment: imageStream
      });

    } catch (err) {
      console.error("GFX5 Error:", err);
      message.reply("❌ API e kono somossa hoise, poroborti te abar try koro.");
    }
  }
};
