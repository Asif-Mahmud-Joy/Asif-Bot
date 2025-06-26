const axios = require("axios");

module.exports = {
  config: {
    name: "sad",
    aliases: ["sadquote", "sad-quote", "dukkho"],
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get random sad quotes",
      bn: "দুঃখজনক উক্তি নিন"
    },
    longDescription: {
      en: "Sends you a random sad quote from a reliable API.",
      bn: "একটি নির্ভরযোগ্য API থেকে একটি এলোমেলো দুঃখজনক উক্তি পাঠায়।"
    },
    category: "fun",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const response = await axios.get("https://api.quotable.io/random?tags=sad");
      const { content, author } = response.data;

      const message = `😔 Sad Quote:
"${content}"
— ${author}`;
      return api.sendMessage(message, event.threadID, event.messageID);

    } catch (error) {
      console.error("❌ Sad Quote Command Error:", error);
      return api.sendMessage("❌ দুঃখিত! উক্তি আনতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", event.threadID, event.messageID);
    }
  }
};
