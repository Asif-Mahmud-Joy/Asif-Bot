const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "voice",
    aliases: ["aniaudio"],
    author: "Mr.Smokey[Asif Mahmud]",
    version: "2.0",
    cooldowns: 5,
    role: 0,
    shortDescription: "Get anime voice",
    longDescription: "Get anime voice lines from selected anime series",
    category: "anime",
    guide: {
      en: "{pn} <anime>",
      bn: "{pn} <অ্যানিমে>"
    }
  },

  langs: {
    en: {
      missingCategory: "Please specify a valid anime. Available: %1",
      error: "An error occurred while processing your request."
    },
    bn: {
      missingCategory: "অনুগ্রহ করে একটি বৈধ অ্যানিমের নাম লিখুন। উপলব্ধ: %1",
      error: "আপনার অনুরোধটি প্রক্রিয়াকরণে একটি ত্রুটি ঘটেছে।"
    }
  },

  onStart: async function ({ api, event, args, message, getLang }) {
    const categories = ["naruto", "bleach", "onepiece", "aot", "jjk", "ds"];
    const anime = args[0]?.toLowerCase();

    if (!anime || !categories.includes(anime)) {
      return message.reply(getLang("missingCategory", categories.join(", ")));
    }

    try {
      const response = await axios.get(`https://api.safone.me/anivoice?anime=${anime}`, {
        responseType: "arraybuffer"
      });

      const tempPath = path.join(__dirname, "cache", `${Date.now()}.mp3`);
      fs.writeFileSync(tempPath, Buffer.from(response.data, 'binary'));

      await message.reply({
        body: `🎧 Anime: ${anime}`,
        attachment: fs.createReadStream(tempPath)
      }, () => fs.unlinkSync(tempPath));
    } catch (err) {
      console.error(err);
      return message.reply(getLang("error"));
    }
  }
};
