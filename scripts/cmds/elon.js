const axios = require('axios');
const fs = require('fs-extra');
const { loadImage, createCanvas } = require('canvas');

const wrapText = (ctx, text, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    if (ctx.measureText('W').width > maxWidth) return resolve(null);
    const words = text.split(' ');
    const lines = [];
    let line = '';
    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = '';
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
};

module.exports = {
  config: {
    name: "elon",
    version: "2.0-UltraPro",
    role: 0,
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    shortDescription: "🖊️ Text post with Elon image",
    category: "fun",
    guide: "elon [text]",
    countDown: 10
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const pathImg = __dirname + '/cache/elon_post.png';
    const text = args.join(" ");
    if (!text) return api.sendMessage('⚠️ Please enter some text to write.', threadID, messageID);

    try {
      const response = await axios.get('https://i.imgur.com/GGmRov3.png', { responseType: 'arraybuffer' });
      fs.ensureDirSync(__dirname + '/cache');
      fs.writeFileSync(pathImg, Buffer.from(response.data, 'binary'));

      const baseImage = await loadImage(pathImg);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      ctx.font = "bold 30px Arial";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "start";

      let fontSize = 30;
      ctx.font = `bold ${fontSize}px Arial`;
      while (ctx.measureText(text).width > 1100) {
        fontSize--;
        ctx.font = `bold ${fontSize}px Arial`;
      }

      const lines = await wrapText(ctx, text, 1100);
      let y = 115;
      for (let line of lines) {
        ctx.fillText(line, 40, y);
        y += fontSize + 10;
      }

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);

      return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);
    } catch (err) {
      console.error("Error generating Elon post:", err);
      return api.sendMessage("❌ Error occurred while generating image. Try again later.", threadID, messageID);
    }
  }
};
