const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'redroom',
    aliases: ['raatokotha'],
    version: '2.0',
    author: '✨ Mr.Smokey [Asif Mahmud] ✨',
    countDown: 20,
    role: 2,
    shortDescription: {
      en: '18+ NSFW content',
      bn: '১৮+ কনটেন্ট দেখতে এই কমান্ড ব্যবহার করুন'
    },
    longDescription: {
      en: 'Sends a random NSFW image from RedRoom',
      bn: 'RedRoom থেকে এলোমেলো ১৮+ ছবি পাঠাবে'
    },
    category: '18+',
    guide: {
      en: '{p}{n}',
      bn: '{p}{n} লিখুন এবং অপেক্ষা করুন'
    }
  },

  onStart: async function ({ api, event }) {
    const tempPath = path.join(__dirname, 'cache', `redroom_${Date.now()}.jpg`);

    try {
      // Updated working NSFW API
      const { data } = await axios.get('https://fantox-apis.vercel.app/nsfw');
      const imageUrl = data.url;

      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      await fs.outputFile(tempPath, response.data);

      api.sendMessage({
        body: '🔥 𝖄𝖔𝖚𝖗 𝖗𝖊𝖖𝖚𝖊𝖘𝖙𝖊𝖉 𝖗𝖊𝖉𝖗𝖔𝖔𝖒 𝖈𝖔𝖓𝖙𝖊𝖓𝖙 𝖎𝖘 𝖍𝖊𝖗𝖊...',
        attachment: fs.createReadStream(tempPath)
      }, event.threadID, () => fs.unlink(tempPath), event.messageID);
    } catch (error) {
      console.error('[RedRoom Error]', error);
      api.sendMessage('❌ NSFW API e samossa. Try again later or contact admin.', event.threadID, event.messageID);
    }
  }
};
