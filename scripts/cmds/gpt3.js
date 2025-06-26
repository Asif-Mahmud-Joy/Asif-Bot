const axios = require("axios");

module.exports = {
  config: {
    name: "gpt3",
    version: "3.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    role: 0,
    category: "Ai - Chat",
    shortDescription: {
      en: "Ask an AI anything",
      bn: "AI কে যেকোনো প্রশ্ন জিজ্ঞাসা করুন"
    },
    longDescription: {
      en: "Ask AI for a response based on your prompt",
      bn: "আপনার প্রশ্ন অনুযায়ী AI উত্তর দেবে"
    },
    guide: {
      en: "{pn} [your question]",
      bn: "{pn} [আপনার প্রশ্ন]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    const lang = "bn"; // Optional: auto-detect or command-specific

    if (!prompt) {
      return api.sendMessage(
        lang === "bn"
          ? "❌ দয়া করে AI কে প্রশ্ন করার জন্য কিছু লিখুন।"
          : "❌ Please provide a prompt to ask AI.",
        event.threadID
      );
    }

    const waitMsg = lang === "bn"
      ? "🤖 আপনার প্রশ্নের উত্তর তৈরি হচ্ছে..."
      : "🤖 Generating response, please wait...";

    const wait = await api.sendMessage(waitMsg, event.threadID);

    try {
      // Recommended working public GPT API (fallback)
      const response = await axios.post(
        "https://gpt4.deno.dev/chat",
        {
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content;

      if (!reply) {
        throw new Error(
          lang === "bn"
            ? "❌ AI থেকে কোনো উত্তর পাওয়া যায়নি।"
            : "❌ No response received from AI."
        );
      }

      await api.sendMessage({
        body: reply.trim(),
        mentions: event.mentions
      }, event.threadID, wait.messageID);
    } catch (error) {
      console.error("[GPT3 Error]", error);
      await api.sendMessage(
        lang === "bn"
          ? `❌ সমস্যা হয়েছে: ${error.message}\nআবার চেষ্টা করুন বা পরে চেষ্টা করুন।`
          : `❌ Error occurred: ${error.message}\nTry again or try later.`,
        event.threadID,
        null,
        wait.messageID
      );
    }
  }
};
