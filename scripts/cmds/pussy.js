const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pussy",
    aliases: ["18+"],
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 2,
    shortDescription: "NSFW photo command",
    longDescription: "Bot tomake kichu 18+ pussy pic dekhabe (only if you're authorized)",
    category: "18+",
    guide: {
      en: "{pn}",
      bn: "{pn} likhe enter dan (18+ command)"
    }
  },

  onStart: async function ({ message, event, api }) {
    try {
      // Check for NSFW role (role: 2)
      if (event.senderID !== global.GoatBot.config.adminBot) {
        return message.reply("⚠️ Ei command ta shudhu admin ba verified 18+ user der jonno allowed.");
      }

      const links = [
        "https://i.ibb.co/jfqMF07/image.jpg",
        "https://i.ibb.co/tBBCS4y/image.jpg",
        "https://i.ibb.co/3zpyMVY/image.jpg",
        "https://i.ibb.co/gWbWT8k/image.jpg",
        "https://i.ibb.co/mHtyD1P/image.jpg",
        "https://i.ibb.co/vPHNhdY/image.jpg",
        "https://i.ibb.co/rm6rPjb/image.jpg",
        "https://i.ibb.co/7GpN2GW/image.jpg",
        "https://i.ibb.co/CnfMVpg/image.jpg"
      ];

      const selected = links[Math.floor(Math.random() * links.length)];
      const stream = await global.utils.getStreamFromURL(selected);

      message.reply({
        body: "🔞 𝐏𝐮𝐬𝐬𝐲 𝐏𝐢𝐜 𝐁𝐞𝐥𝐨𝐰 💦🥵",
        attachment: stream
      });
    } catch (err) {
      console.error("Pussy command error:", err);
      message.reply("❌ Kichu ekta problem hoise... Try again later!");
    }
  }
};
