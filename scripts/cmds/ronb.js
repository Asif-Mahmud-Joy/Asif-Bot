const axios = require("axios");
const fs = require("fs-extra");
const canvas = require("canvas");

module.exports = {
  config: {
    name: "RONB",
    aliases: ["ronb"],
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    category: "write",
    shortDescription: {
      en: "make something RONB wrote about you or friends/ something",
    },
  },

  wrapText: async (ctx, text, maxWidth) => {
    return new Promise((resolve) => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      if (ctx.measureText("W").width > maxWidth) return resolve(null);
      const words = text.split(" ");
      const lines = [];
      let line = "";
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
        if (ctx.measureText(`${line}${words[0]}`).width < maxWidth)
          line += `${words.shift()} `;
        else {
          lines.push(line.trim());
          line = "";
        }
        if (words.length === 0) lines.push(line.trim());
      }
      return resolve(lines);
    });
  },

  onStart: async function ({ api, event, args }) {
    const { senderID, threadID, messageID } = event;
    const { loadImage, createCanvas } = require("canvas");

    const text = args.join(" ");
    if (!text) {
      return api.sendMessage("\ud83d\udccc Please enter a message to write on the board!", threadID, messageID);
    }

    const pathImg = __dirname + "/cache/ronb.png";

    // \u2705 Valid working board image
    const imageURL = "https://i.imgur.com/BRO82eZ.png"; // <- changeable if needed
    const imageResponse = await axios.get(imageURL, { responseType: "arraybuffer" });
    fs.writeFileSync(pathImg, Buffer.from(imageResponse.data, "utf-8"));

    const baseImage = await loadImage(pathImg);
    const canvasInstance = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvasInstance.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvasInstance.width, canvasInstance.height);

    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";

    const lines = await this.wrapText(ctx, text, 880); // max width adjusted
    let yPosition = 160; // Y start pos for text
    const lineHeight = 35;

    for (const line of lines) {
      ctx.fillText(line, 60, yPosition);
      yPosition += lineHeight;
    }

    const imageBuffer = canvasInstance.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);
  },
};
