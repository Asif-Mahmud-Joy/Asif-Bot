// Banglish: Ei script user-er avatar niye ekta "drip" effect-er gif toiri kore

module.exports = {
  config: {
    name: "drip",
    aliases: [],
    version: "1.1",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    shortDescription: "Drip style avatar",
    longDescription: "User-er profile pic diye drip effect gif banay",
    category: "fun",
    guide: "{pn} @mention/reply"
  },

  async onStart({ api, event, usersData }) {
    try {
      let imageLink = "";

      // Banglish: Jodi reply thake, tahole oi user-er avatar nibo
      if (event.type === "message_reply" && event.messageReply) {
        imageLink = await usersData.getAvatarUrl(event.messageReply.senderID);
      } else {
        // Banglish: Reply na thakle nijer avatar nibo
        imageLink = await usersData.getAvatarUrl(event.senderID);
      }

      // ✅ Updated API: Popcat API drip endpoint
      const gifURL = `https://api.popcat.xyz/drip?image=${encodeURIComponent(imageLink)}`;

      const message = {
        body: "💧 You can't handle my richness 🤑",
        attachment: [await global.utils.getStreamFromURL(gifURL)]
      };

      api.sendMessage(message, event.threadID, event.messageID);

    } catch (err) {
      console.error("❌ Drip command error:", err);
      api.sendMessage("🔴 Mention/reply koro ba kichu wrong hoise.", event.threadID, event.messageID);
    }
  }
};
