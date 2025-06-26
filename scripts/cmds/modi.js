const axios = require("axios");
const fs = require("fs-extra");
const canvas = require("canvas");

module.exports = {
  config: {
    name: "modi",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    category: "write",
    shortDescription: {
      en: "Sends meme image with your text."
    },
    longDescription: {
      en: "Generates a meme with your custom caption on a Modi-themed image."
    },
    guide: {
      en: "{pn} [your message here]"
    }
  },

  wrapText: async (ctx, text, maxWidth) => {
    const words = text.split(" ");
    const lines = [];
    let line = "";

    for (const word of words) {
      const testLine = line + word + " ";
      const { width } = ctx.measureText(testLine);
      if (width > maxWidth && line !== "") {
        lines.push(line.trim());
        line = word + " ";
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line.trim());
    return lines;
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const { loadImage, createCanvas } = canvas;

    const text = args.join(" ");
    if (!text)
      return api.sendMessage("📝 Please enter your caption text.", threadID, messageID);

    const imgURL = "https://i.ibb.co/98GsJJM/image.jpg";
    const imgPath = __dirname + "/cache/modi_meme.png";

    try {
      // Fetch image
      const response = await axios.get(imgURL, { responseType: "arraybuffer" });
      await fs.ensureDir(__dirname + "/cache");
      fs.writeFileSync(imgPath, response.data);

      const baseImage = await loadImage(imgPath);
      const canvasObj = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvasObj.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvasObj.width, canvasObj.height);

      // Font settings
      ctx.font = "bold 28px Arial";
      ctx.fillStyle = "#000";
      ctx.textAlign = "start";

      const lines = await this.wrapText(ctx, text, 600);
      let startY = 120;
      for (const line of lines) {
        ctx.fillText(line, 48, startY);
        startY += 35;
      }

      const outBuffer = canvasObj.toBuffer();
      fs.writeFileSync(imgPath, outBuffer);

      return api.sendMessage(
        {
          body: "🗿 Here's your meme:",
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );
    } catch (err) {
      console.error("Failed to create meme:", err);
      return api.sendMessage("❌ Failed to generate meme. Try again later.", threadID, messageID);
    }
  }
};
