const axios = require("axios");
const jimp = require("jimp");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "mistake",
    aliases: ["mistake"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 2,
    role: 0,
    shortDescription: "tag kore bolen kar jonmo chilo bhul",
    longDescription: "Tag someone and show them as a mistake meme",
    category: "fun",
    guide: "{pn} @mention"
  },

  onStart: async function ({ message, event, args }) {
    const mention = Object.keys(event.mentions);

    if (mention.length === 0) {
      return message.reply("📌 Tag na dile kivabe jani ke bhul chilo? Tag ekjon ke!");
    }

    const targetUID = mention[0];
    try {
      const imagePath = await createMistakeMeme(targetUID);
      await message.reply({
        body: "😔 The Biggest Mistake on Earth...",
        attachment: fs.createReadStream(imagePath)
      });
      fs.unlinkSync(imagePath);
    } catch (err) {
      console.error("Error generating meme:", err);
      message.reply("❌ Problem hoise bhai, abar try koro.");
    }
  }
};

async function createMistakeMeme(uid) {
  const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
  const baseImageUrl = "https://i.postimg.cc/2ST7x1Dw/received-6010166635719509.jpg";

  const [avatar, baseImage] = await Promise.all([
    jimp.read(avatarUrl),
    jimp.read(baseImageUrl)
  ]);

  baseImage.resize(512, 512);
  avatar.resize(220, 203);
  baseImage.composite(avatar, 145, 305);

  const outputPath = __dirname + "/cache/mistake_output.png";
  await fs.ensureDir(__dirname + "/cache");
  await baseImage.writeAsync(outputPath);
  return outputPath;
}
