const axios = require("axios");

module.exports = {
  config: {
    name: "nokia",
    aliases: ["nokia"],
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    shortDescription: "Edit user's avatar in nokia meme style",
    longDescription: "Send a funny meme image using Popcat API with mentioned/replied user's avatar in Nokia format.",
    category: "fun",
    guide: "{pn} @mention or reply to someone's message"
  },

  async onStart({ api, event, usersData }) {
    try {
      const mention = Object.keys(event.mentions);
      let targetID = null;

      if (mention.length > 0) {
        // Mentioned user
        targetID = mention[0];
      } else if (event.messageReply) {
        // Replied user
        targetID = event.messageReply.senderID;
      } else {
        return api.sendMessage("⚠️ Tag ba reply na dile nokia banano jabena!", event.threadID, event.messageID);
      }

      const imageLink = await usersData.getAvatarUrl(targetID);

      const gifURL = `https://api.popcat.xyz/nokia?image=${encodeURIComponent(imageLink)}`;

      // Check API if working
      const check = await axios.get(gifURL, { responseType: 'stream' });
      if (!check || !check.data) throw new Error("API failed or returned no data");

      const message = {
        body: "📱 Bitch I'm stylish — Nokia Filter Activated 😂",
        attachment: check.data
      };

      api.sendMessage(message, event.threadID, event.messageID);

    } catch (err) {
      console.error("Nokia command error:", err.message);
      api.sendMessage("❌ Error occurred. API might be down or you didn't reply/tag properly.", event.threadID, event.messageID);
    }
  }
};
