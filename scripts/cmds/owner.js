const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "ownerinfo",
    author: "Asif",
    role: 0,
    shortDescription: "Premium Owner Profile ✨",
    longDescription: "Displays owner's information in premium atomic design style with video attachment",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const ownerInfo = {
        name: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
        preference: '🕋 Islamic Lifestyle',
        hobbies: '🎧 Music, 🎮 Gaming, 📚 Learning',
        gender: '👨 Male',
        age: '🔞 18+',
        height: '📏 5ft+',
        facebookLink: '🌐 https://www.facebook.com/share/1HPjorq8ce/',
        nick: '🔥 Jamai 🔥'
      };

      const videoUrl = 'https://files.catbox.moe/op5iay.mp4';
      const tmpFolderPath = path.join(__dirname, 'tmp');
      const videoPath = path.join(tmpFolderPath, 'owner_video.mp4');

      await fs.ensureDir(tmpFolderPath);

      const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      await fs.writeFile(videoPath, Buffer.from(videoResponse.data));

      const response = `
❖═══════≺•⊰❘⊱•≻═══════❖
          𝗢𝗪𝗡𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘
❖═══════≺•⊰❘⊱•≻═══════❖

✧・ﾟ: *✧・ﾟ:* 𝗕𝗔𝗦𝗜𝗖 𝗜𝗡𝗙𝗢 *:ﾟ・✧*:ﾟ・✧

⌬ 𝗡𝗮𝗺𝗲      ➠ ${ownerInfo.name}
⌬ 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲  ➠ ${ownerInfo.nick}
⌬ 𝗔𝗴𝗲        ➠ ${ownerInfo.age}
⌬ 𝗚𝗲𝗻𝗱𝗲𝗿   ➠ ${ownerInfo.gender}
⌬ 𝗛𝗲𝗶𝗴𝗵𝘁    ➠ ${ownerInfo.height}

✧・ﾟ: *✧・ﾟ:* 𝗟𝗜𝗙𝗘𝗦𝗧𝗬𝗟𝗘 *:ﾟ・✧*:ﾟ・✧

⌬ 𝗣𝗿𝗲𝗳𝗲𝗿𝗲𝗻𝗰𝗲 ➠ ${ownerInfo.preference}
⌬ 𝗛𝗼𝗯𝗯𝗶𝗲𝘀      ➠ ${ownerInfo.hobbies}

✧・ﾟ: *✧・ﾟ:* 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 *:ﾟ・✧*:ﾟ・✧

⌬ 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 ➠ ${ownerInfo.facebookLink}

❖═══════≺•⊰❘⊱•≻═══════❖
   𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗬 𝗔𝗦𝗜𝗙 𝗠𝗔𝗛𝗠𝗨𝗗
❖═══════≺•⊰❘⊱•≻═══════❖`;

      await api.sendMessage({
        body: response,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, () => fs.unlinkSync(videoPath), event.messageID);

      if ((event.body || '').toLowerCase().includes('ownerinfo')) {
        api.setMessageReaction('✨', event.messageID, () => {}, true);
      }

    } catch (error) {
      console.error('❌ Atomic command error:', error);
      return api.sendMessage('❌ An atomic error occurred! Please try again later ⚛', event.threadID);
    }
  },
};
