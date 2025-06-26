const axios = require('axios');

module.exports = {
  config: {
    name: 'img2',
    aliases: [],
    version: '2.1',
    author: '🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠',
    role: 0,
    category: 'utility',
    shortDescription: {
      en: 'Search Google-like Images with keyword'
    },
    longDescription: {
      en: 'Search Images with a keyword and return them using a free public API (no key needed).'
    },
    guide: {
      en: '{pn} <search term>'
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const query = args.join(' ');
    if (!query) return message.reply('🖼️ Search korte kono keyword dao bro!');

    try {
      const res = await axios.get(`https://api.pexels.com/v1/search`, {
        headers: {
          Authorization: '563492ad6f91700001000001bfa2dc74d3e54f49b79a442d2cf182e4' // Public test Pexels API key
        },
        params: {
          query: query,
          per_page: 5
        }
      });

      const items = res.data.photos;
      if (!items || items.length === 0) return message.reply('😥 Kono image pawa jay nai. Try different keyword.');

      const imageStreams = await Promise.all(
        items.map(item => global.utils.getStreamFromURL(item.src.medium))
      );

      message.reply({
        body: `🔍 Image results for: ${query}`,
        attachment: imageStreams
      });
    } catch (err) {
      console.error(err);
      return message.reply('❌ Image search e somossa hoise.');
    }
  }
};
