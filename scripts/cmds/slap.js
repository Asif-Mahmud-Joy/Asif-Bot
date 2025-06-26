const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "slap",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "Slap someone with image!",
    longDescription: "Generate a slap image where you slap a tagged user.",
    category: "image",
    guide: {
      en: "   {pn} @mention",
      bn: "   {pn} @mention koro jar mathay chita marba"
    }
  },

  langs: {
    vi: {
      noTag: "Bạn phải tag người bạn muốn tát",
      selfSlap: "Tự mình tát mình à? Thôi đi!"
    },
    en: {
      noTag: "You must tag the person you want to slap",
      selfSlap: "Slap yourself? Try someone else!"
    },
    bn: {
      noTag: "জার ঠুসান মারবা, ওরে ট্যাগ কর আগে!",
      selfSlap: "নিজেকে ঠুসান দিবা নাকি ভাই? আর কাউরে দে!"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    try {
      const uid1 = event.senderID;
      const uid2 = Object.keys(event.mentions)[0];

      if (!uid2) return message.reply(getLang("noTag"));

      if (uid1 === uid2) return message.reply(getLang("selfSlap"));

      // Block specific user
      if (uid2 === "100078140834638") {
        return message.reply("Slap yourself, bro 🐸! Eto chita dite ichcha! 🤦‍♂️");
      }

      const avatarURL1 = await usersData.getAvatarUrl(uid1);
      const avatarURL2 = await usersData.getAvatarUrl(uid2);
      const image = await new DIG.Batslap().getImage(avatarURL1, avatarURL2);
      const fileName = `${uid1}_${uid2}_batslap.png`;
      const savePath = path.join(__dirname, "tmp", fileName);

      fs.ensureDirSync(path.dirname(savePath));
      fs.writeFileSync(savePath, Buffer.from(image));

      const extraText = args.join(" ").replace(Object.keys(event.mentions)[0], "").trim();
      const replyText = extraText || "বাপ্প্পপপপপ!! 😵‍💫😵";

      message.reply({
        body: replyText,
        attachment: fs.createReadStream(savePath)
      }, () => fs.unlink(savePath, () => {}));
    } catch (err) {
      console.error("❌ Error in slap command:", err);
      return message.reply("❌ হুম একটু গণ্ডগোল হইসে ভাই... পরে আবার চেস্টা কর! 🙏");
    }
  }
};
