const fs = require("fs-extra");

module.exports = {
  config: {
    name: "leave",
    aliases: ["l"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 2,
    shortDescription: "Bot will leave a specified group or the current one",
    longDescription: "Command to make bot leave the specified thread or current group if no ID is provided.",
    category: "owner",
    guide: {
      en: "{pn} [threadID] — Leave specific thread or current one if blank"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const targetTID = args[0] ? args[0] : event.threadID;
      const threadName = args[0] ? `Thread ID: ${targetTID}` : "this group";
      const botID = api.getCurrentUserID();

      await api.sendMessage(`👋 Leaving ${threadName}...`, targetTID);
      await api.removeUserFromGroup(botID, targetTID);

    } catch (err) {
      console.error("[leave cmd error]", err);
      message.reply("❌ Bot couldn’t leave. Make sure I have permission or check thread ID.");
    }
  }
};
