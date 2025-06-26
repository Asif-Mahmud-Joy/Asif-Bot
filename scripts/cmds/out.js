const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "out",
    aliases: ["l", "leave"],
    version: "2.2",
    author: "Asif Mahmud",
    countDown: 5,
    role: 2,
    shortDescription: "⛔ Bot ke GC theke ber kore dao",
    longDescription: "Ei command use kore bot ke kono group theke leave korano jay.",
    category: "admin",
    guide: {
      en: "{pn} [tid] — Bot will leave the specified group or current group if none provided",
      bn: "{pn} [tid] — Bot ke specific group (tid) ba current group theke ber kore dibe"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const targetTID = args[0] ? parseInt(args[0]) : event.threadID;
      const threadInfo = await api.getThreadInfo(targetTID);
      const senderID = event.senderID;

      if (!threadInfo.adminIDs.some(e => e.id === senderID)) {
        return api.sendMessage("⚠️ Ei command shudhu group admin ra use korte parbe!", event.threadID);
      }

      const groupName = threadInfo.threadName || "Unnamed Group";

      await api.sendMessage(
        `👋 BOT LEAVING ANNOUNCEMENT:

📤 Group Name: ${groupName}
🆔 TID: ${targetTID}

🥲 Ami toder sukh dewar jonno aschilam...
😞 Kintu tora amar joggo na...

BOT ber hoye jacche... Goodbye!`,
        targetTID
      );

      return api.removeUserFromGroup(api.getCurrentUserID(), targetTID);
    } catch (err) {
      console.error("[out command error]", err);
      return api.sendMessage("❌ Bot ke group theke ber korte giye error hoise. TID tik ache to?", event.threadID);
    }
  }
};
