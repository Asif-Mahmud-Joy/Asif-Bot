const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "marry",
    aliases: ["marryfour"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "Biye koranor image gen korbe!",
    longDescription: "Apnar valobashar manush ke mention korun, ar biye-r chobi paben!",
    category: "love",
    guide: "{pn} @mention"
  },

  onStart: async function ({ message, event, args }) {
    try {
      const mention = Object.keys(event.mentions);
      if (mention.length === 0)
        return message.reply("❗Please mention someone to marry.");

      const one = mention.length === 1 ? event.senderID : mention[1];
      const two = mention[0];

      const path = await generateMarriageImage(one, two);
      message.reply({
        body: "💍 Biye hoye gelo! Mubarak ho! 🥰",
        attachment: fs.createReadStream(path)
      }, () => fs.unlinkSync(path));

    } catch (err) {
      console.error(err);
      message.reply("❌ Something went wrong while generating the marriage image.");
    }
  }
};

async function generateMarriageImage(one, two) {
  const pth = __dirname + "/cache/marryv4.png";

  const [avOne, avTwo, bg] = await Promise.all([
    jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`),
    jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`),
    jimp.read("https://i.postimg.cc/XN1TcH3L/tumblr-mm9nfpt7w-H1s490t5o1-1280.jpg")
  ]);

  avOne.circle();
  avTwo.circle();

  bg.resize(1024, 684)
    .composite(avOne.resize(85, 85), 204, 160)
    .composite(avTwo.resize(80, 80), 315, 105);

  await bg.writeAsync(pth);
  return pth;
}
