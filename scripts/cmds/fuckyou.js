module.exports = {
  config: {
    name: "fuckyou",
    version: "2.0", // ✅ Updated
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "No prefix trigger for rude message",
    longDescription: "Reacts when someone types 'fuck' without prefix",
    category: "no prefix"
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    try {
      const input = event.body?.toLowerCase().trim();
      if (input === "fuck") {
        return message.reply({
          body: "🖕 *Fuck you too!*",
          attachment: [
            await global.utils.getStreamFromURL(
              "https://i.imgur.com/9bNeakd.gif"
            )
          ]
        });
      }
    } catch (err) {
      console.error("[FuckYou Command Error]", err);
      return message.reply("❌ Kisu ekta problem hoise. Try again poroborti te.");
    }
  }
};
