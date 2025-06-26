const axios = require('axios');

module.exports = {
  config: {
    name: "image",
    aliases: ["img"],
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    version: "5.0",
    shortDescription: "Unsplash Image Search",
    longDescription: "Search high-quality images using Unsplash API. Default 5, max 10 results.",
    category: "image",
    guide: {
      en: "{pn} <keyword> or {pn} <number> <keyword>\nExample: image 5 cat"
    }
  },

  onStart: async function({ args, message }) {
    if (args.length === 0) return message.reply("📸| Please enter a keyword to search image. Example: image 5 cat");

    let numResults = 5;
    let query;

    if (!isNaN(args[0])) {
      numResults = Math.min(parseInt(args[0]), 10);
      query = args.slice(1).join(" ");
    } else {
      query = args.join(" ");
    }

    if (!query) return message.reply("🔍| Please enter a valid search keyword after number. Example: image 5 car");

    const url = `https://api.unsplash.com/search/photos?page=1&per_page=${numResults}&query=${encodeURIComponent(query)}&client_id=oWmBq0kLICkR_5Sp7m5xcLTAdkNtEcRG7zrd55ZX6oQ`;

    try {
      const { data } = await axios.get(url);
      if (!data.results || data.results.length === 0) {
        return message.reply(`❌| No image found for: "${query}"`);
      }

      const images = data.results.map(item => item.urls.regular);
      const attachments = await Promise.all(
        images.map(img => global.utils.getStreamFromURL(img))
      );

      return message.reply({
        body: `✅| Found ${images.length} image(s) for "${query}":`,
        attachment: attachments
      });
    } catch (err) {
      console.error(err);
      return message.reply("⚠️| Error occurred while searching. Try again later.");
    }
  }
};
