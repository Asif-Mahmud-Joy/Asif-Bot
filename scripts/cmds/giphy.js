const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "giphy",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    category: "utility",
    role: 0,
    guide: {
      en: "{pn} <search query>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args[0]) {
      return api.sendMessage('🔎 Please provide a keyword to search GIFs from Giphy.', threadID, messageID);
    }

    const query = encodeURIComponent(args.join(' '));
    const apiKey = 'QHv1qVaxy4LS3AmaNuUYNT9zr40ReFBI';
    const limit = 5;
    const giphyURL = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${query}&limit=${limit}&rating=g`;

    try {
      const response = await axios.get(giphyURL);
      const gifs = response.data.data;

      if (!gifs || gifs.length === 0) {
        return api.sendMessage('❌ No GIFs found for your query.', threadID, messageID);
      }

      const attachments = await Promise.all(gifs.map(async (gif, i) => {
        const gifUrl = gif.images.original.url;
        const gifPath = path.join(__dirname, `cache/giphy${i}.gif`);

        const buffer = await axios.get(gifUrl, { responseType: 'arraybuffer' }).then(res => res.data);
        await fs.writeFile(gifPath, Buffer.from(buffer));

        return fs.createReadStream(gifPath);
      }));

      api.sendMessage({ attachment: attachments }, threadID, async () => {
        // Auto delete cache after sending
        for (let i = 0; i < limit; i++) {
          const filePath = path.join(__dirname, `cache/giphy${i}.gif`);
          if (fs.existsSync(filePath)) await fs.unlink(filePath);
        }
      });

    } catch (error) {
      console.error('[Giphy Error]', error.message);
      return api.sendMessage('⚠️ Somossa hoise GIF ber kortey. Try again later.', threadID, messageID);
    }
  }
};
