const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notice",
    aliases: ["notif", "noti"],
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 1,
    shortDescription: {
      en: "Send premium notice to all groups",
      bn: "সব গ্রুপে স্টাইলিশ নোটিশ পাঠান"
    },
    longDescription: {
      en: "Admin can send a stylish notice to all groups with optional media and user mention",
      bn: "অ্যাডমিন সব গ্রুপে সুন্দরভাবে নোটিশ পাঠাতে পারবেন, মেনশন আর মিডিয়া সহ"
    },
    category: "owner",
    guide: {
      en: "{pn} <your message>",
      bn: "{pn} <তোমার নোটিশ বার্তা>"
    },
    envConfig: {
      delayPerGroup: 300
    }
  },

  langs: {
    en: {
      missingMessage: "⚠️ Please enter a message to send.",
      sending: "⏳ Sending notice to %1 groups...",
      success: "✅ Successfully sent notices to %1 groups.",
      failure: "❌ Failed to send to %1 groups:\n%2"
    },
    bn: {
      missingMessage: "⚠️ দয়া করে পাঠাতে একটি বার্তা লিখুন।",
      sending: "⏳ মোট %1 টা গ্রুপে নোটিশ পাঠানো হচ্ছে...",
      success: "✅ সফলভাবে %1 টা গ্রুপে পাঠানো হয়েছে।",
      failure: "❌ %1 টা গ্রুপে পাঠানো ব্যর্থ:\n%2"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, getLang }) {
    const lang = getLang;
    const { delayPerGroup } = envCommands[commandName];

    if (!args.length) return message.reply(lang("missingMessage"));

    const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
    const userMention = event.messageReply?.senderID
      ? `👤 Mentioned User: [@${event.messageReply.senderID}]`
      : "";

    const noticeMessage = `『 𝗢𝗳𝗳𝗶𝗰𝗶𝗮𝗹 𝗡𝗼𝘁𝗶𝗰𝗲 』\n━━━━━━━━━━━━━━━━━━\n🕒 ${timestamp}\n${userMention}\n\n📢 ${args.join(" ")}\n━━━━━━━━━━━━━━━━━━\n✅ Admin Announcement`;

    const attachments = await getStreamsFromAttachment([
      ...event.attachments,
      ...(event.messageReply?.attachments || [])
    ]);

    const formSend = { body: noticeMessage, attachment: attachments };

    const allThreads = await api.getThreadList(1000, null, ["INBOX"]);
    const groupThreads = allThreads.filter(thread => thread.isGroup);

    if (groupThreads.length === 0)
      return message.reply(lang("failure", 0, "No groups found."));

    message.reply(lang("sending", groupThreads.length));

    let success = 0;
    let errors = [];
    const pending = [];

    for (const { threadID } of groupThreads) {
      try {
        pending.push({ threadID, pending: api.sendMessage(formSend, threadID) });
        await new Promise(r => setTimeout(r, delayPerGroup));
      } catch (err) {
        errors.push({ id: threadID, error: err.message });
      }
    }

    for (const { threadID, pending: task } of pending) {
      try {
        await task;
        success++;
      } catch (err) {
        errors.push({ id: threadID, error: err.message });
      }
    }

    const errorText = errors.length
      ? lang("failure", errors.length, errors.map(e => `• ${e.id} - ${e.error}`).join("\n"))
      : "";

    return message.reply(lang("success", success) + (errorText ? `\n${errorText}` : ""));
  }
};
