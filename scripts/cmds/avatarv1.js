const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "avatarv1",
    version: "2.1",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "Generate wibu avatar with text",
    longDescription: {
      en: "Generate wibu styled avatar with custom text using ID"
    },
    category: "image",
    guide: {
      en: "{pn} ID|Background Text|Signature Text"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID } = event;
    const content = args.join(" ").split("|").map(item => item.trim());

    if (content.length < 3) {
      return message.reply("[❗] Format vul ase. Use this: ID|Background Text|Signature Text");
    }

    const id = parseInt(content[0]);
    const backgroundText = encodeURIComponent(content[1]);
    const signatureText = encodeURIComponent(content[2]);

    if (isNaN(id) || id <= 0 || id > 882) {
      return message.reply("[❗] ID vul ase! Please use an ID between 1 and 882.");
    }

    const imageUrl = `https://apiv3.imageapi.tech/avatarwibu?id=${id}&chu_nen=${backgroundText}&chu_ky=${signatureText}`;
    const imgPath = path.join(__dirname, "cache", `avt1_${Date.now()}.png`);

    try {
      message.reply("[⏳] Please wait, creating your avatar...");

      const response = await axios.get(imageUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        message.reply({
          body: "[✅] Avatar ready!",
          attachment: fs.createReadStream(imgPath)
        }, () => fs.unlinkSync(imgPath));
      });

      writer.on("error", () => {
        fs.unlinkSync(imgPath);
        message.reply("[❌] Somossa hoise image download e. Try again.");
      });

    } catch (error) {
      console.error("[❌] API error:", error.message);
      message.reply("[❌] API kaj kortese na ba connection error. Onno somoy try koro.");
    }
  }
};
