const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "owner",
    author: "Asif", // Convert By Goatbot Asif
    role: 0,
    shortDescription: " ",
    longDescription: "",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const ownerInfo = {
        name: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
        title: '⚡ Premium Developer',
        gender: '♂️ Male',
        age: '18±',
        height: '5\'8" (173cm)',
        lifestyle: '🕋 Islamic Values',
        hobbies: '🎧 Music | � Gaming | 📚 AI Research',
        nickname: '🔥 Jamai 🔥',
        contact: '🌐 https://www.facebook.com/share/15yVioQQyq//',
        skills: 'JavaScript | Python | AI Architecture',
        philosophy: '"Code with purpose, build with passion"'
      };

      const bold = 'https://files.catbox.moe/op5iay.mp4'; // Replace with your Google Drive videoid link

      const tmpFolderPath = path.join(__dirname, 'tmp');

      if (!fs.existsSync(tmpFolderPath)) {
        fs.mkdirSync(tmpFolderPath);
      }

      const videoResponse = await axios.get(bold, { responseType: 'arraybuffer' });
      const videoPath = path.join(tmpFolderPath, 'owner_video.mp4');

      fs.writeFileSync(videoPath, Buffer.from(videoResponse.data, 'binary'));

      const response = ` 
╭────────────◊
├‣ 𝐁𝐨𝐭 & 𝐎𝐰𝐧𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 
├‣ 𝐍𝐚𝐦𝐞: ${ownerInfo.name}
├‣ 𝐓𝐢𝐭𝐥𝐞: ${ownerInfo.title}
├‣ 𝐆𝐞𝐧𝐝𝐞𝐫: ${ownerInfo.gender}
├‣ 𝐀𝐠𝐞: ${ownerInfo.age}
├‣ 𝐇𝐞𝐢𝐠𝐡𝐭: ${ownerInfo.height}
├‣ 𝐋𝐢𝐟𝐞𝐬𝐭𝐲𝐥𝐞: ${ownerInfo.lifestyle}
├‣ 𝐇𝐨𝐛𝐛𝐢𝐞𝐬: ${ownerInfo.hobbies}
├‣ 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞: ${ownerInfo.nickname}
├‣ 𝐂𝐨𝐧𝐭𝐚𝐜𝐭: ${ownerInfo.contact}
├‣ 𝐒𝐤𝐢𝐥𝐥𝐬: ${ownerInfo.skills}
├‣ 𝐏𝐡𝐢𝐥𝐨𝐬𝐨𝐩𝐡𝐲: ${ownerInfo.philosophy}
╰────────────◊ 
`;

      await api.sendMessage({
        body: response,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, event.messageID);

      if (event.body.toLowerCase().includes('ownerinfo')) {
        api.setMessageReaction('🚀', event.messageID, (err) => {}, true);
      }
    } catch (error) {
      console.error('Error in ownerinfo command:', error);
      return api.sendMessage('An error occurred while processing the command.', event.threadID);
    }
  },
};
