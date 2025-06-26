module.exports = {
  config: {
    name: 'masskick',
    version: '2.2.0',
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 2,
    shortDescription: 'Remove all group members',
    longDescription: {
      en: 'Kick all members from the group or restore them back.'
    },
    category: 'box chat',
    guide: {
      en: '{p}kickall on/off'
    }
  },

  kickOffMembers: {},

  onStart: async function ({ api, event, args, message }) {
    try {
      const threadID = event.threadID;
      const botID = api.getCurrentUserID();
      const threadInfo = await api.getThreadInfo(threadID);
      const adminIDs = threadInfo.adminIDs.map(a => a.id);

      if (!adminIDs.includes(botID)) {
        return message.reply("⛔ Bot needs admin rights to perform this command.");
      }

      if (!adminIDs.includes(event.senderID)) {
        return message.reply("⛔ Only group admins can use this command.");
      }

      const participantIDs = threadInfo.participantIDs.filter(id => id !== botID);

      if (args[0] === 'off') {
        this.kickOffMembers[threadID] = participantIDs;
        return message.reply("✅ KickAll is now OFF. Members list stored.");
      }

      if (args[0] === 'on') {
        const membersToRestore = this.kickOffMembers[threadID] || [];

        for (const uid of membersToRestore) {
          try {
            await api.addUserToGroup(uid, threadID);
            await new Promise(r => setTimeout(r, 1000));
          } catch (err) {
            console.log(`Failed to add ${uid}:`, err);
          }
        }

        this.kickOffMembers[threadID] = [];
        return message.reply("🔄 Members restored to the group.");
      }

      message.reply("⚠️ Starting to kick all members except bot...");
      for (const uid of participantIDs) {
        try {
          await api.removeUserFromGroup(uid, threadID);
          await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
          console.log(`Failed to remove ${uid}:`, err);
        }
      }

      return message.reply("✅ All members have been removed.");

    } catch (err) {
      console.error("[KickAll Error]", err);
      return message.reply("❌ Something went wrong. Check logs for details.");
    }
  }
};
