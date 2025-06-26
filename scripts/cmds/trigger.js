const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "trigger",
    version: "2.0",
    author: "Mr.Smokey[Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "Generate triggered meme GIF",
    longDescription: "Create a triggered-style animated GIF using the profile picture of the tagged user or yourself.",
    category: "image",
    guide: {
      vi: "{pn} [@tag | để trống]",
      en: "{pn} [@tag | empty]"
    }
  },

  onStart: async function ({ event, message, usersData, api }) {
    try {
      const uid = Object.keys(event.mentions)[0] || event.senderID;
      const userInfo = await usersData.get(uid);
      const avatarURL = await usersData.getAvatarUrl(uid);
      const img = await new DIG.Triggered().getImage(avatarURL);
      const pathSave = `${__dirname}/tmp/${uid}_trigger.gif`;

      await fs.ensureDir(`${__dirname}/tmp`);
      await fs.writeFile(pathSave, Buffer.from(img));

      const displayName = userInfo?.name || "User";
      await message.reply({
        body: `😡 Triggered meme for ${displayName}`,
        attachment: fs.createReadStream(pathSave)
      });

      fs.unlink(pathSave).catch(() => {});
    } catch (error) {
      console.error("Trigger Command Error:", error);
      message.reply("❌ Error generating triggered image. Please try again later.");
    }
  }
};
