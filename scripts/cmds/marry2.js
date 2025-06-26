const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "marry2",
    aliases: ["marry2"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "Biye image generate kore",
    longDescription: "Apnar bhalobasha ke tag korlei biye-r cute photo paben!",
    category: "love",
    guide: {
      vi: "{pn} @tag",
      en: "{pn} @tag"
    }
  },

  onStart: async function ({ message, event }) {
    try {
      const mention = Object.keys(event.mentions);
      if (mention.length === 0) return message.reply("⚠️ Please mention someone to generate the marriage image.");

      const one = mention.length === 1 ? event.senderID : mention[1];
      const two = mention[0];

      const outputPath = await generateImage(one, two);

      await message.reply({
        body: "💖 One day with you for sure...",
        attachment: fs.createReadStream(outputPath)
      }, () => fs.unlinkSync(outputPath));

    } catch (error) {
      console.error("❌ Error generating marriage image:", error);
      message.reply("❌ Sorry! Biye image banate problem hoise. Try again later.");
    }
  }
};

async function generateImage(uid1, uid2) {
  const cachePath = path.join(__dirname, "cache");
  const outputFile = path.join(cachePath, "marry2.png");

  await fs.ensureDir(cachePath);

  const fbToken = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

  const [avatar1, avatar2, background] = await Promise.all([
    jimp.read(`https://graph.facebook.com/${uid1}/picture?width=512&height=512&access_token=${fbToken}`),
    jimp.read(`https://graph.facebook.com/${uid2}/picture?width=512&height=512&access_token=${fbToken}`),
    jimp.read("https://i.ibb.co/9ZZCSzR/ba6abadae46b5bdaa29cf6a64d762874.jpg")
  ]);

  avatar1.circle();
  avatar2.circle();

  background.resize(640, 535)
    .composite(avatar1.resize(130, 130), 200, 70)
    .composite(avatar2.resize(130, 130), 350, 150);

  await background.writeAsync(outputFile);
  return outputFile;
}
