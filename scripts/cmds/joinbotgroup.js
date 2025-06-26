const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "join",
    version: "2.1",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "Join a bot group",
    longDescription: "Shows a list of groups where the bot is a member and lets user join.",
    category: "owner",
    guide: {
      en: "{p}join"
    },
  },

  onStart: async function ({ api, event }) {
    try {
      const groupList = await api.getThreadList(100, null, ['INBOX']);
      const filteredList = groupList.filter(group => group.isGroup && group.threadName !== null);

      if (filteredList.length === 0) {
        return api.sendMessage('❌ Bot kono group-e nai.', event.threadID);
      }

      const formattedList = filteredList.map((group, i) =>
        `🔹 ${i + 1}. ${group.threadName}\n🆔 TID: ${group.threadID}\n👥 Members: ${group.participantIDs.length}`
      );

      const msg = `📜 Bot er Group List:

${formattedList.join("\n\n")}\n\n🔢 Reply korun kon number group-e join korte chan.`;

      const sent = await api.sendMessage(msg, event.threadID);
      global.GoatBot.onReply.set(sent.messageID, {
        commandName: 'join',
        messageID: sent.messageID,
        author: event.senderID,
      });
    } catch (e) {
      console.log("❌ Error in join command:", e);
      api.sendMessage('❌ Error hoise. Try again porer somoy.', event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    const { author } = Reply;
    if (event.senderID !== author) return;

    const num = parseInt(args[0] || event.body);
    if (isNaN(num)) return api.sendMessage("❌ Valid number den. Jemon: 1", event.threadID, event.messageID);

    try {
      const groupList = await api.getThreadList(100, null, ['INBOX']);
      const filtered = groupList.filter(group => group.isGroup && group.threadName !== null);

      if (num < 1 || num > filtered.length) {
        return api.sendMessage("❌ Number ta valid na. List er moddhe thaka number den.", event.threadID, event.messageID);
      }

      const targetGroup = filtered[num - 1];
      const info = await api.getThreadInfo(targetGroup.threadID);

      if (info.participantIDs.includes(event.senderID)) {
        return api.sendMessage(`ℹ️ Apni already ei group-e ase: ${targetGroup.threadName}`, event.threadID);
      }

      if (info.participantIDs.length >= 250) {
        return api.sendMessage(`❌ Ei group full (${info.participantIDs.length}/250): ${targetGroup.threadName}`, event.threadID);
      }

      await api.addUserToGroup(event.senderID, targetGroup.threadID);
      api.sendMessage(`✅ Apnake add kora hoise ei group-e: ${targetGroup.threadName}`, event.threadID);
    } catch (err) {
      console.log("❌ Join error:", err);
      api.sendMessage("❌ Kichu ekta vul hoise join korar somoy.", event.threadID);
    } finally {
      global.GoatBot.onReply.delete(event.messageID);
    }
  },
};
