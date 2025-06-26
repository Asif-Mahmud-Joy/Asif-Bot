const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "rip",
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: "Generate RIP image for tagged user",
    longDescription: "Creates a RIP tombstone image with the mentioned user's profile picture.",
    category: "fun",
    guide: {
      en: "{pn} [@mention someone]"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    try {
      const mentionID = Object.keys(event.mentions)[0] || event.senderID;

      const avatarURL = await usersData.getAvatarUrl(mentionID);
      if (!avatarURL) {
        return message.reply("❌ Couldn't fetch avatar. Please try again.");
      }

      const img = await new DIG.Rip().getImage(avatarURL);
      const tmpPath = path.join(__dirname, "tmp");
      const filePath = path.join(tmpPath, `${mentionID}_rip.png`);

      await fs.ensureDir(tmpPath);
      fs.writeFileSync(filePath, Buffer.from(img));

      await message.reply({
        body: `🪦 RIP ${event.mentions[mentionID] || "you"}...`,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlink(filePath); // Clean up temp file
    } catch (err) {
      console.error("[rip error]", err);
      return message.reply("⚠️ Something went wrong. Please try again later.");
    }
  }
};
