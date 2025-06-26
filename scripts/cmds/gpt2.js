const axios = require("axios");

module.exports = {
  config: {
    name: "gpt2",
    aliases: [],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Talk to AI in Banglish!"
    },
    longDescription: {
      en: "ChatGPT AI er sathe Banglish e kotha bolar jonno command."
    },
    category: "ai chat",
    guide: {
      en: "{pn} [tomar prompt/message]"
    }
  },

  onStart: async function({ api, event, args }) {
    const msg = args.join(" ").trim();

    if (!msg) {
      return api.sendMessage("🛑 Please type something to ask the AI.", event.threadID, event.messageID);
    }

    const loadingMessage = await api.sendMessage("🤖 AI vabshe... ektu wait koro...", event.threadID);

    try {
      const response = await axios.post("https://gpt4.deno.dev/chat", {
        messages: [
          {
            role: "user",
            content: msg
          }
        ]
      });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const reply = response.data.choices[0].message.content.trim();
        await api.sendMessage(reply, event.threadID, loadingMessage.messageID);
      } else {
        throw new Error("AI kichui bujte pareni. Try abar.");
      }

    } catch (error) {
      console.error("GPT error:", error.message);
      api.sendMessage("❌ AI er server e problem hoise ba connection fail. Try again porer somoy.", event.threadID, loadingMessage.messageID);
    }
  }
};
