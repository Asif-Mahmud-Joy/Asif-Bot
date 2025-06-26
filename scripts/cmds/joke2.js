const axios = require("axios");

module.exports = {
  config: {
    name: "joke2",
    aliases: ["joke"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "Get random jokes",
    longDescription: {
      en: "Get a random joke using a working API",
      bn: "একটি র্যান্ডম মজার জোকস দেখাবে"
    },
    category: "fun",
    guide: {
      en: "{pn}",
      bn: "{pn} - র‍্যান্ডম জোকস দেখাও"
    },
  },

  onStart: async function ({ api, event }) {
    try {
      const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
      const { setup, punchline } = response.data;
      const message = `😂 ${setup}\n👉 ${punchline}`;
      return api.sendMessage(message, event.threadID);
    } catch (error) {
      console.error("❌ Joke API Error:", error.message);
      return api.sendMessage("❌ মাফ করবেন, জোকস আনতে সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করুন।", event.threadID);
    }
  },
};
