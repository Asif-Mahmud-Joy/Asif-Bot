const axios = require('axios');

module.exports = {
  config: {
    name: "fact",
    aliases: ["facts"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 10,
    role: 0,
    shortDescription: "Get random facts",
    longDescription: "Gives you an interesting random fact every time you use it",
    category: "study",
    guide: "{p}fact"
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
      const fact = res.data.text;

      return api.sendMessage(`🧠 Did you know?
${fact}`, event.threadID, event.messageID);

    } catch (err) {
      console.error("Fact command error:", err);
      return api.sendMessage("❌ Sorry, ekhon fact ana jacche na. Try again pore. 😓", event.threadID, event.messageID);
    }
  }
};
