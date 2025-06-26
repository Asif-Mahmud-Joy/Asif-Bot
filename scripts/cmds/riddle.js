const axios = require('axios');

module.exports = {
  config: {
    name: "riddle",
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Get a random riddle!"
    },
    longDescription: {
      en: "Fetch a fun riddle and try to solve it by replying."
    },
    category: "game",
    guide: {
      en: "{pn}riddle"
    }
  },

  onReply: async function ({ event, api, Reply }) {
    if (event.senderID !== Reply.author || Reply.type !== "riddle_reply") return;

    const msg = `✅ Correct answer:
${Reply.answer}`;
    return api.sendMessage(msg, event.threadID, event.messageID);
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    const loadingMsg = await api.sendMessage("🔍 Fetching a riddle for you...", threadID);

    try {
      const response = await axios.get('https://riddles-api.vercel.app/random');
      const riddleData = response.data;
      const { riddle, answer } = riddleData;

      if (!riddle || !answer) throw new Error("API returned incomplete data");

      const msg = {
        body: `🤔 *RIDDLE TIME!*

${riddle}

💡 Reply to this message to see the answer.`
      };

      api.sendMessage(msg, threadID, (err, info) => {
        if (err) return api.sendMessage("❌ Failed to send riddle.", threadID);

        global.GoatBot.onReply.set(info.messageID, {
          type: "riddle_reply",
          commandName: "riddle",
          author: senderID,
          messageID: info.messageID,
          answer,
        });
      });
    } catch (err) {
      console.error("❌ Failed to fetch riddle:", err.message);
      api.sendMessage("❌ Couldn't fetch a riddle right now. Try again later.", threadID, loadingMsg.messageID);
    }
  }
};
