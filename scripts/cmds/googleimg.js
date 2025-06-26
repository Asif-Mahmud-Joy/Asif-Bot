const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
  config: {
    name: "googleimg",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    version: "3.1",
    shortDescription: "Search for images using Google Images",
    longDescription: "Search for images using Google Images and return a specified number of results.",
    category: "utility",
    guide: {
      en: "{pn} <query> [number]",
    }
  },

  onStart: async function ({ args, message, event }) {
    try {
      if (args.length === 0) return message.reply("🔍 Please enter a search query.");

      let numResults = 5;
      let queryArgs = args;
      if (!isNaN(args[args.length - 1])) {
        numResults = Math.min(parseInt(args.pop()), 10);
        queryArgs = args;
      }
      const query = encodeURIComponent(queryArgs.join(" "));

      // ✅ Public proxy API (works without API key)
      const safeQuery = queryArgs.join("+");
      const url = `https://api.qwant.com/api/search/images?count=${numResults}&q=${safeQuery}&t=images&safesearch=1&locale=en_US&uiv=4`;

      const response = await axios.get(url);
      const results = response.data.data.result.items;

      if (!results || results.length === 0) {
        return message.reply("❌ Kono image pawa jai nai.");
      }

      const attachments = await Promise.all(results.slice(0, numResults).map(async item => {
        return global.utils.getStreamFromURL(item.media);
      }));

      return message.reply({
        body: `📷 Top ${attachments.length} result for: \"${decodeURIComponent(query)}\"`,
        attachment: attachments
      });
    } catch (err) {
      console.error("[googleimg command error]", err);
      return message.reply("❌ Somossa hoise image ber korar somoy. Try again porer bar.");
    }
  }
};
