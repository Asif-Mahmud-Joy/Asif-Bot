const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "putin",
    version: "2.0-ultra",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: "Putin meme meeting with tagged user",
    longDescription: "Create a meme where Putin is meeting the mentioned user.",
    category: "meme",
    guide: {
      en: "{pn} [@mention someone]"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    try {
      const mentionID = Object.keys(event.mentions)[0];

      if (!mentionID) {
        return message.reply("📌 *Tag someone to create the meme with Putin.*");
      }

      const avatarURL = await usersData.getAvatarUrl(mentionID);

      if (!avatarURL) {
        return message.reply("❌ Couldn't fetch the avatar of the mentioned user.");
      }

      const imgBuffer = await new DIG.Poutine().getImage(avatarURL);
      const tempPath = path.join(__dirname, `tmp/putin_${mentionID}.png`);

      await fs.ensureDir(path.dirname(tempPath));
      await fs.writeFile(tempPath, imgBuffer);

      await message.reply({
        body: `🇷🇺 Here's your Putin meeting meme with @${event.mentions[mentionID].replace(/@/g, '')}:`,
        attachment: fs.createReadStream(tempPath),
      });

      setTimeout(() => fs.remove(tempPath), 30 * 1000);

    } catch (error) {
      console.error("Putin Meme Error:", error);
      message.reply("⚠️ There was an error generating the meme. Please try again.");
    }
  }
};
