const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "kiss",
    aliases: ["kiss"],
    version: "1.0",
    author: "Asif,
    countDown: 5,
    role: 0,
    shortDescription: "Generate a kiss image for fun",
    longDescription: "Create a kissing scene between two users' profile pictures.",
    category: "fun",
    guide: "{pn} [@user1] (@user2)",
  },

  onStart: async function ({ api, message, event, usersData }) {
    try {
      const { senderID, mentions } = event;
      const mentionedUsers = Object.keys(mentions);

      // Validate mentions
      if (mentionedUsers.length === 0) {
        return message.reply("💔 Please mention at least one user!");
      }

      // Determine participants
      const user1 = senderID; // Default: command user
      const user2 = mentionedUsers[0]; // First mentioned user

      // Get profile pictures
      const [avatar1, avatar2] = await Promise.all([
        usersData.getAvatarUrl(user1),
        usersData.getAvatarUrl(user2),
      ]);

      // Generate image
      const img = await new DIG.Kiss().getImage(avatar1, avatar2);
      const tempPath = path.join(__dirname, "tmp", `kiss_${user1}_${user2}.png`);

      // Ensure tmp directory exists
      if (!fs.existsSync(path.dirname(tempPath))) {
        fs.mkdirSync(path.dirname(tempPath), { recursive: true };
      }

      fs.writeFileSync(tempPath, Buffer.from(img));

      // Send result
      await message.reply({
        body: "💋 | Love is in the air~",
        attachment: fs.createReadStream(tempPath),
      });

    } catch (error) {
      console.error("Kiss command error:", error);
      message.reply("❌ Failed to generate the image. Please try again later.");
    } finally {
      // Clean up temp files (if any)
      const tempDir = path.join(__dirname, "tmp");
      if (fs.existsSync(tempDir)) {
        fs.readdirSync(tempDir)
          .filter(file => file.startsWith("kiss_"))
          .forEach(file => fs.unlinkSync(path.join(tempDir, file)));
      }
    }
  },
};
