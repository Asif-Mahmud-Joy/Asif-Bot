const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "uchiha",
    aliases: ["ucha"],
    version: "2.0",
    author: "Mr.Smokey[Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: {
      bn: "ইউজারকে গ্রুপে যুক্ত করুন"
    },
    longDescription: {
      bn: "ইউজারকে একটি নির্দিষ্ট গ্রুপ চ্যাটে যুক্ত করুন (যেখানে বট অ্যাডমিন আছে)"
    },
    category: "গ্রুপ মেসেজ",
    guide: {
      bn: "{pn} - আপনাকে গ্রুপে যুক্ত করবে"
    }
  },

  onStart: async function ({ api, event }) {
    const threadID = "7514556825304202"; // আপনার গ্রুপ আইডি

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participants = threadInfo.participantIDs;

      if (participants.includes(event.senderID)) {
        api.sendMessage(
          "🍀 আপনি ইতিমধ্যে গ্রুপে আছেন! যদি খুঁজে না পান, স্প্যাম অথবা মেসেজ রিকোয়েস্ট চেক করুন।",
          event.threadID
        );
        api.setMessageReaction("⚠️", event.messageID, () => {}, true);
      } else {
        await api.addUserToGroup(event.senderID, threadID);
        api.sendMessage(
          "🎉 আপনাকে সফলভাবে গ্রুপে যুক্ত করা হয়েছে! স্বাগতম 🤝",
          event.threadID
        );
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      }
    } catch (error) {
      console.error("[UCHIHA ERROR]", error);
      api.sendMessage(
        "❌ গ্রুপে যুক্ত করতে ব্যর্থ হয়েছে। দয়া করে বট অ্যাডমিন কিনা যাচাই করুন বা পুনরায় চেষ্টা করুন।",
        event.threadID
      );
      api.setMessageReaction("💀", event.messageID, () => {}, true);
    }
  }
};
