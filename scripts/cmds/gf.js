module.exports = {
  config: {
    name: "gf",
    version: "2.0", // ✅ Updated
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "no prefix trigger",
    longDescription: "Responds to 'gf' with a message and video",
    category: "no prefix",
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    try {
      const input = event.body?.toLowerCase().trim();
      if (input === "gf") {
        return message.reply({
          body: `💌 *BESSAR BUKE*

👑 ═════════════════
✨  𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥:  
🌫  𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 🌾`,
          attachment: [
            await global.utils.getStreamFromURL(
              "https://files.catbox.moe/k8kwue.jpg"
            ),
          ],
        });
      }
    } catch (err) {
      console.error("[GF COMMAND ERROR]", err);
      return message.reply("❌ Kisu ekta problem hoise. Try again later.");
    }
  },
};
