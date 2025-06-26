const axios = require('axios');

module.exports = {
  config: {
    name: "ss",
    aliases: ["screenshot"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "Get screenshot of website",
    longDescription: "Tumi ekta website er screenshot pete parba ei command diye.",
    category: "media",
    guide: "{pn} <website link>"
  },

  onStart: async function ({ message, args }) {
    const url = args.join(" ").trim();
    if (!url) {
      return message.reply("⚠️ | Doya kore ekta valid URL dao.");
    }

    // Check if URL is valid
    if (!/^https?:\/\//i.test(url)) {
      return message.reply("❌ | URL https:// diye shuru hote hobe.");
    }

    try {
      const API_URL = `https://image.thum.io/get/fullpage/${encodeURIComponent(url)}`;

      const screenshotStream = await global.utils.getStreamFromURL(API_URL);
      if (!screenshotStream) throw new Error("Stream fail");

      const form = {
        body: `✅ Screenshot of: ${url}`,
        attachment: screenshotStream
      };
      return message.reply(form);

    } catch (error) {
      console.error("Screenshot Error:", error);
      return message.reply("🚫 Screenshot toiri kora gelo na. Please try a valid link or try again later.");
    }
  }
};
