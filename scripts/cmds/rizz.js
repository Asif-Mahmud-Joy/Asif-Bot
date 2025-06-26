const axios = require('axios');

module.exports = {
  config: {
    name: 'rizz',
    version: '2.1',
    author: '✨ Mr.Smokey [Asif Mahmud] ✨',
    countDown: 8,
    role: 0,
    category: 'fun',
    shortDescription: {
      en: 'Get a random rizz line 🎯'
    },
    longDescription: {
      en: 'Fetches a spicy pickup/rizz line from API and sends it as a message.'
    },
    guide: {
      en: '{pn} rizz'
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const { threadID, messageID, senderID } = event;

      // ✅ Using verified working API
      const res = await axios.get('https://vinuxd.vercel.app/api/pickup');
      const pickup = res?.data?.pickup;

      if (!pickup) throw new Error("No pickup line returned from API.");

      // 📩 Send the pickup line directly
      await api.sendMessage({
        body: `🔥 Rizz Line for You:

"${pickup}"`,
        mentions: [{
          tag: `@${senderID}`,
          id: senderID
        }]
      }, threadID, messageID);

    } catch (err) {
      console.error("[RIZZ ERROR]", err);
      return api.sendMessage("❌ Couldn't fetch a rizz line right now. Try again later.", event.threadID, event.messageID);
    }
  }
};
