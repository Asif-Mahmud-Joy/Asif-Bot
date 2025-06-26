const fs = require('fs');
const path = require('path');
const https = require('https');

const mediaList = [
  {
    name: "ara.mp3",
    url: "https://youtu.be/tuUxeez-5CA?si=f2GeMKBOg7Sj2EN3"
  },
  {
    name: "yemete.mp3",
    url: "https://l.messenger.com/l.php?u=https%3A%2F%2Ffiles.catbox.moe%2Fddvljo.mp4&h=AT0Va-kr4UJqEP1XT9jJVd0VFh17GIUHBrCZtcDGu9QBcY8DK9k3oTlCC-Ar4S_WeBotau9FW186aNUzCyS9PfOV8z3alN-CNSOmCiZFTLSIhdjl8O_Y3zpZXdiv1vOkWVLpoA"
  }
];

module.exports = {
  config: {
    name: "audionp",
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "no prefix audio/video auto-play",
    longDescription: "writes message like 'ara' and bot will play the sound",
    category: "no prefix"
  },

  onStart: async function () {
    const mediaDir = path.join(__dirname, 'noprefix_media');
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
      console.log(`[✅] Created folder: ${mediaDir}`);
    }

    for (const media of mediaList) {
      const filePath = path.join(mediaDir, media.name);
      if (!fs.existsSync(filePath)) {
        const file = fs.createWriteStream(filePath);
        https.get(media.url, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`[📥] Downloaded ${media.name}`);
          });
        }).on("error", (err) => {
          fs.unlinkSync(filePath);
          console.log(`[❌] Failed to download ${media.name}: ${err.message}`);
        });
      }
    }
  },

  onChat: async function ({ event, message, api }) {
    const text = event.body;
    if (!text) return;
    const word = text.trim().toLowerCase();

    const mediaDir = path.join(__dirname, 'noprefix_media');
    const tryFiles = [`${word}.mp3`, `${word}.mp4`];

    for (let fileName of tryFiles) {
      const fullPath = path.join(mediaDir, fileName);
      if (fs.existsSync(fullPath)) {
        await message.reply({
          body: `「 ${word} 」`,
          attachment: fs.createReadStream(fullPath)
        });
        await api.setMessageReaction(fileName.endsWith('.mp4') ? "🎬" : "🔊", event.messageID, event.threadID);
        return;
      }
    }
  }
};
