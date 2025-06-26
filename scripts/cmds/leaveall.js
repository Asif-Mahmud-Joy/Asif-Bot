module.exports = {
  config: {
    name: "leaveall",
    aliases: ["outall"],
    version: "1.1",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Leave all groups",
      bn: "সব গ্রুপ থেকে বের হয়ে যান"
    },
    longDescription: {
      en: "Make the bot leave all group chats except current.",
      bn: "বট নিজে থেকে সব গ্রুপ ছেড়ে দিবে, শুধু যেটাতে কমান্ড চালানো হয়েছে সেটা ছাড়া।"
    },
    category: "owner",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  langs: {
    en: {
      start: "🔄 Leaving all groups...",
      done: "✅ Left all groups successfully.",
      error: "❌ Error while leaving groups. Check console."
    },
    bn: {
      start: "🔄 সব গ্রুপ থেকে বের হওয়া শুরু হচ্ছে...",
      done: "✅ সফলভাবে সব গ্রুপ ছেড়ে দেয়া হয়েছে।",
      error: "❌ গ্রুপ ছাড়ার সময় সমস্যা হয়েছে। Console চেক করুন।"
    }
  },

  onStart: async function ({ api, args, message, event, getLang }) {
    try {
      message.reply(getLang("start"));
      const threadList = await api.getThreadList(100, null, ["INBOX"]);
      const botUserID = api.getCurrentUserID();

      for (const threadInfo of threadList) {
        if (threadInfo.isGroup && threadInfo.threadID !== event.threadID) {
          try {
            await api.removeUserFromGroup(botUserID, threadInfo.threadID);
          } catch (err) {
            console.error(`Failed to leave ${threadInfo.threadID}`, err);
          }
        }
      }

      message.reply(getLang("done"));
    } catch (e) {
      console.error("[leaveall error]", e);
      message.reply(getLang("error"));
    }
  }
};
