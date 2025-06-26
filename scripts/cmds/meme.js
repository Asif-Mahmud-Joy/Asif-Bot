const axios = require('axios');

module.exports = {
  config: {
    name: 'meme',
    aliases: ['funnymeme', 'memepic'],
    version: '1.1',
    author: 'Mr.Smokey [Asif Mahmud]',
    role: 0,
    category: 'funny',
    shortDescription: {
      en: 'Sends a random meme image.'
    },
    longDescription: {
      en: 'Sends a random meme image fetched from a reliable meme API.'
    },
    guide: {
      en: '{pn}'
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const response = await axios.get('https://meme-api.com/gimme');

      if (!response.data || !response.data.url) {
        throw new Error('No meme found from API');
      }

      const stream = await global.utils.getStreamFromURL(response.data.url);

      if (!stream) {
        throw new Error('Image stream fetch failed');
      }

      return api.sendMessage({
        body: "😂 Here's a random meme:",
        attachment: stream
      }, event.threadID);

    } catch (error) {
      console.error("Meme command error:", error);
      return api.sendMessage(
        '😔 Meme pathao jaite parlam na. Later try koriyo!',
        event.threadID
      );
    }
  }
};
