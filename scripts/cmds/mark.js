const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "mark",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Zucc board comment gen",
      bn: "Zucc board-e text likhe image banay"
    },
    guide: {
      en: "{pn} your text",
      bn: "{pn} apnar text likhun"
    }
  },

  wrapText: async (ctx, text, maxWidth) => {
    if (ctx.measureText(text).width < maxWidth) return [text];
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(line.trim());
        line = word + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    return lines;
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const text = args.join(" ");
    const pathImg = __dirname + "/cache/mark_zucc.png";

    if (!text) return api.sendMessage("📝 Please write something to comment.", threadID, messageID);

    try {
      const response = await axios.get("https://i.postimg.cc/gJCXgKv4/zucc.jpg", {
        responseType: "arraybuffer"
      });
      fs.writeFileSync(pathImg, Buffer.from(response.data, "utf-8"));

      const baseImage = await loadImage(pathImg);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0);
      ctx.fillStyle = "#000";
      ctx.textAlign = "start";
      let fontSize = 20;
      ctx.font = `${fontSize}px Arial`;
      const lines = await this.wrapText(ctx, text, 470);

      let y = 75;
      for (const line of lines) {
        ctx.fillText(line, 15, y);
        y += fontSize + 5;
      }

      const finalBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, finalBuffer);

      return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);
    } catch (err) {
      console.error("Error generating image:", err);
      return api.sendMessage("❌ Image generate korte somossa hoise.", threadID, messageID);
    }
  }
};
