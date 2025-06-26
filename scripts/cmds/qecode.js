const qrcode = require("qrcode");
const fs = require("fs-extra");
const axios = require("axios");
const jsQR = require("jsqr");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "qrcode",
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: "Generate or Decode QR codes",
    longDescription: "Generate QR code from text or decode text from a QR image.",
    category: "image",
    guide: {
      en: `
{pn} make <text> - Generate QR from text
{pn} scan - Reply to QR image to decode
Example:
{pn} make Hello World`
    }
  },

  onStart: async function ({ api, args, message, event }) {
    const command = args[0]?.toLowerCase();
    const text = args.slice(1).join(" ");

    if (command === "make") {
      if (!text) return message.reply("\uD83D\uDD39 Text dao jar QR code banabo.\nউদাহরণ: qrcode make I am SiAM");

      const filePath = path.join(__dirname, `${Date.now()}_qr.png`);
      try {
        await qrcode.toFile(filePath, text);
        message.reply({
          body: "✅ Tumar QR ready ⬇️",
          attachment: fs.createReadStream(filePath)
        }, () => fs.unlink(filePath));
      } catch (err) {
        console.error(err);
        message.reply("❌ QR banate somossa hoyeche.");
      }

    } else if (command === "scan") {
      let imageUrl = null;
      if (event.type === "message_reply") {
        const attachment = event.messageReply.attachments?.[0];
        if (attachment && attachment.type === "photo") {
          imageUrl = attachment.url;
        }
      }

      if (!imageUrl) return message.reply("📌 QR image-er reply dao dekhar jonno.");

      try {
        const buffer = (await axios.get(imageUrl, { responseType: 'arraybuffer' })).data;
        const image = await loadImage(buffer);

        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code?.data) {
          message.reply(`✅ QR decoded result:
${code.data}`);
        } else {
          message.reply("⚠️ Decode korte parlam na. Check koro valid QR kina.");
        }
      } catch (err) {
        console.error(err);
        message.reply("❌ Image theke QR decode korte somossa hoise.");
      }
    } else {
      message.reply(`❓ Invalid command.

🔹 QR generate: {pn} make <text>
🔹 QR decode: reply with QR image and type: {pn} scan`);
    }
  }
};
