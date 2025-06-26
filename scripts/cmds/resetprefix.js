const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "resetprefix",
    version: "1.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 2,
    shortDescription: "Reset the bot's prefix to default",
    longDescription: "Reset the command prefix in your thread to the default value (usually global.defaultPrefix).",
    category: "config",
    guide: {
      en: "{pn}"
    },
  },

  onStart: async function ({ message, threadsData, event }) {
    try {
      // Reset prefix to null which uses global default
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply("✅ | Prefix has been reset to the default value.");
    } catch (err) {
      console.error("❌ Error resetting prefix:", err);
      return message.reply("⚠️ | Failed to reset prefix. Please try again or contact support.");
    }
  },

  onChat: async function ({ event, message, threadsData }) {
    if (event.body && event.body.trim().toLowerCase() === "resetprefix") {
      try {
        await threadsData.set(event.threadID, null, "data.prefix");
        return message.reply("✅ | Prefix has been reset to the default value.");
      } catch (err) {
        console.error("❌ Error resetting prefix from chat:", err);
        return message.reply("⚠️ | Something went wrong while resetting the prefix.");
      }
    }
  }
};
