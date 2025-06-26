const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "trash",
    version: "2.0",
    author: "Mr.Smokey[Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "Make someone look like trash meme",
    longDescription: "Generates a 'trash' meme image using the mentioned user's avatar or your own.",
    category: "meme",
    guide: {
      vi: "{pn} [@tag | để trống]",
      en: "{pn} [@tag | empty]"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    try {
      const uid = Object.keys(event.mentions)[0] || event.senderID;
      const userInfo = await usersData.get(uid);
      const displayName = userInfo?.name || "User";

      const avatarURL = await usersData.getAvatarUrl(uid);
      const img = await new DIG.Delete().getImage(avatarURL);

      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);

      const pathSave = path.join(tmpDir, `${uid}_delete.png`);
      fs.writeFileSync(pathSave, Buffer.from(img));

      message.reply({
        body: `${displayName} is now trash 🗑️`,
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlink(pathSave).catch(() => {}));

    } catch (err) {
      console.error("Trash command error:", err);
      message.reply("❌ Failed to generate the trash image. Please try again later.");
    }
  }
};
