const axios = require('axios');
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "avatar2",
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 10,
    role: 0,
    shortDescription: "Create FB avatar banner",
    longDescription: "Create a Wibu avatar using character name or ID and text",
    category: "image",
    guide: {
      en: "{pn} character name or ID | main text | sub text"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    const input = args.join(" ").split("|").map(item => item.trim());
    if (input.length < 3) {
      return message.reply(`⚠️ Please enter in this format:\n{pn} character name or ID | main text | sub text`);
    }

    const [rawId, mainText, subText] = input;
    let id = rawId;

    // Notify user
    await message.reply("🌀 Processing your avatar... Please wait senpai~ 😻");

    // If input is name (not a number), convert it to ID
    if (isNaN(id)) {
      try {
        const searchRes = await axios.get(`https://www.nguyenmanh.name.vn/api/searchAvt?key=${encodeURIComponent(id)}`);
        id = searchRes.data.result.ID;
        if (!id) throw new Error("Invalid ID");
      } catch (err) {
        return message.reply("❌ Character not found! Please check the name or ID and try again. 😿");
      }
    }

    // Build final image URL
    const imgUrl = `https://www.nguyenmanh.name.vn/api/avtWibu3?id=${id}&tenchinh=${encodeURIComponent(mainText)}&tenphu=${encodeURIComponent(subText)}&apikey=CF9unN3H`;

    try {
      const form = {
        body: `✅ Here's your avatar banner, senpai~ 😻❤️`,
        attachment: [await global.utils.getStreamFromURL(imgUrl)]
      };
      return message.reply(form);
    } catch (e) {
      console.error("Image fetch error:", e);
      return message.reply("❌ Something went wrong while generating the image. Please try again later.");
    }
  }
};
