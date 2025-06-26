const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "motivationalvideo",
    aliases: ["mv"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get a random motivational video",
      bn: "Random motivational video paw"
    },
    longDescription: {
      en: "Sends a randomly selected motivational video",
      bn: "Random vabe motivational video pathano hoy"
    },
    category: "fun",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const videoCachePath = path.join(__dirname, 'cache');
    const videoPath = path.join(videoCachePath, 'motivational.mp4');

    try {
      // Ensure cache folder exists
      if (!fs.existsSync(videoCachePath)) {
        fs.mkdirSync(videoCachePath);
      }

      const processingMessage = await api.sendMessage({
        body: '⏳ Motivational video load kora hocche, ektu opekkha korun...'
      }, event.threadID);

      const res = await axios.get('https://motivational.august-api.repl.co/video', { timeout: 120000 });
      const { url, title } = res.data || {};

      if (!url) {
        return api.sendMessage('🚫 Video URL pawa jai nai. Poroborti te try korun.', event.threadID);
      }

      // Ensure correct .mp4 format
      const mp4Url = url.endsWith('.mp4') ? url : url.replace(/\?.*/, '') + '.mp4';

      const videoRes = await axios.get(mp4Url, { responseType: 'arraybuffer', timeout: 120000 });
      fs.writeFileSync(videoPath, Buffer.from(videoRes.data, 'binary'));

      await api.sendMessage({
        attachment: fs.createReadStream(videoPath),
        body: `🎥 𝗠𝗢𝗧𝗜𝗩𝗔𝗧𝗜𝗢𝗡𝗔𝗟 𝗩𝗜𝗗𝗘𝗢

💡 "${title || 'No title'}"`
      }, event.threadID);

      fs.unlink(videoPath, (err) => {
        if (err) console.error('❌ Failed to delete video:', err);
        else console.log('✅ Motivational video file deleted.');
      });

    } catch (error) {
      console.error('[Motivational Video Error]', error);

      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        return api.sendMessage('⌛ Time out hoye geche. Poroborti te try korun.', event.threadID);
      }

      return api.sendMessage('⚠️ Somossa hoyeche. Motivational video pawya jacche na.', event.threadID);
    }
  }
};
