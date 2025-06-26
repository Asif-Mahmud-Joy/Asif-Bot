const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "wanted",
    aliases: ["chorgang"],
    version: "1.1",
    author: "Mr.Smokey{Asif Mahmud})",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Create a fun wanted frame with friends",
      bn: "বন্ধুদের সাথে মজার ওয়ান্টেড ফ্রেম তৈরি করুন"
    },
    longDescription: {
      en: "Generate a wanted poster with 3 tagged Facebook friends",
      bn: "৩ জন ট্যাগ করা ফেসবুক বন্ধুকে নিয়ে একটি ওয়ান্টেড পোস্টার তৈরি করুন"
    },
    category: "fun",
    guide: {
      en: "{pn} @tag1 @tag2",
      bn: "{pn} @ট্যাগ1 @ট্যাগ2"
    }
  },

  langs: {
    en: {
      tagMore: "Tag your two friends to invite them in wanted frame",
      result: "These guys are wanted!",
      error: "An error occurred while generating the image."
    },
    bn: {
      tagMore: "দয়া করে আপনার দুইজন বন্ধুকে ট্যাগ করুন ওয়ান্টেড ফ্রেমে যোগ করার জন্য",
      result: "এরা এখন ওয়ান্টেড!",
      error: "ছবি তৈরি করতে গিয়ে একটি সমস্যা হয়েছে।"
    }
  },

  onStart: async function ({ message, event, args, getLang }) {
    const mention = Object.keys(event.mentions);
    if (mention.length < 2) {
      return message.reply(getLang("tagMore"));
    }

    mention.push(event.senderID);
    let [one, two, three] = mention;

    try {
      const imagePath = await generateImage(one, two, three);
      await message.reply({
        body: getLang("result"),
        attachment: fs.createReadStream(imagePath)
      }, () => fs.unlinkSync(imagePath));
    } catch (error) {
      console.error("Error while running command:", error);
      await message.reply(getLang("error"));
    }
  }
};

async function generateImage(one, two, three) {
  const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

  const avatarOne = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${token}`);
  const avatarTwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${token}`);
  const avatarThree = await jimp.read(`https://graph.facebook.com/${three}/picture?width=512&height=512&access_token=${token}`);

  const image = await jimp.read("https://i.ibb.co/7yPR6Xf/image.jpg");
  image
    .resize(2452, 1226)
    .composite(avatarOne.resize(405, 405), 206, 345)
    .composite(avatarTwo.resize(400, 400), 1830, 350)
    .composite(avatarThree.resize(450, 450), 1010, 315);

  const imagePath = `${__dirname}/tmp/wanted_output.png`;
  await fs.ensureDir(`${__dirname}/tmp`);
  await image.writeAsync(imagePath);
  return imagePath;
}
