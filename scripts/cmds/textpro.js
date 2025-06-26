const fs = require("fs");
const path = require("path");
const axios = require("axios"); // ✅ Fixed: Use standard require instead of global.nodemodule

module.exports = {
  config: {
    name: "textpro",
    version: "2.1",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "Generate logos with text",
    longDescription: {
      en: "Use various styles to generate text logos."
    },
    category: "logo",
    guide: {
      en: "{pn} [style_id] [your text]\nExample: {pn} 1 Hello World"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const styleId = parseInt(args[0]);
    const text = args.slice(1).join(" ");

    if (!styleId || isNaN(styleId))
      return message.reply("❌ Please provide a valid number for the style ID.");

    if (styleId > 100)
      return message.reply("⚠️ Maximum style ID is 100.");

    if (!text)
      return message.reply("⚠️ Please provide text to generate logo.");

    message.reply("🎨 Generating your logo, please wait...");

    try {
      const apiUrl = `https://textpro-api-z2my.onrender.com/api/generate?id=${styleId}&text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      const imagePath = path.join(__dirname, "cache", `textpro_${event.threadID}.png`);
      fs.writeFileSync(imagePath, response.data);

      return message.reply({
        attachment: fs.createReadStream(imagePath)
      }, () => fs.unlinkSync(imagePath));
    } catch (err) {
      console.error("TextPro Error:", err);
      return message.reply("❌ Failed to generate logo. Please try again later.");
    }
  }
};
