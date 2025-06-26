// এই কোডটি পুরনো স্ক্রিপ্টের বাগ (bug) ফিক্স করে এবং এটিকে আরও নির্ভরযোগ্য করে তৈরি করা হয়েছে।
// সবচেয়ে বড় সমস্যা, অর্থাৎ error হলে typing... indicator বন্ধ না হওয়ার বাগটি সমাধান করা হয়েছে।
// আপনার দেওয়া romantic Banglish পার্সোনালিটি এবং অন্যান্য ফিচার হুবহু রাখা হয়েছে।

const axios = require("axios");

module.exports = {
  config: {
    name: "blue60",
    author: "Asif Mahmud", // Author আপডেট করা হয়েছে
    version: "6.0", // ভার্সন আপগ্রেড করা হয়েছে
    cooldowns: 5,
    role: 0,
    shortDescription: { en: "Romantic AI chat" },
    longDescription: { en: "Talk romantically with a stable and improved AI named Besh" },
    category: "ai",
    guide: { en: "{p}blue [your message]" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ").trim();

    if (!prompt) {
      const menu =
        "Hello! আমি Besh 💙\n" +
        "আমার সাথে কথা বলতে টাইপ করুন: {p}blue [আপনার বার্তা]\n\n" +
        "উদাহরণ:\n" +
        "• {p}blue ভালোবাসা কি?\n" +
        "• {p}blue একটি রোমান্টিক কথা বলো\n" +
        "• {p}blue আজ কেমন লাগছে তোমার?";
      return api.sendMessage(menu, event.threadID, event.messageID);
    }

    // এই ভেরিয়েবলগুলো try-catch ব্লকের বাইরে ডিক্লেয়ার করা ভালো অভ্যাস,
    // যাতে error হলেও এগুলোকে access করা যায়।
    let typingInterval;
    let processingMsg;

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // typing indicator ফিচারটি খুবই সুন্দর, তাই এটি রেখে দেওয়া হয়েছে।
      typingInterval = setInterval(() => {
        api.sendTypingIndicator(event.threadID);
      }, 800); // ৮০০ মিলিসেকেন্ড পর পর

      processingMsg = await api.sendMessage(
        `তোমার বার্তাটি প্রসেস করছি... 💌\nপ্রশ্ন: "${prompt}"`,
        event.threadID
      );

      // আপনার প্রথম অনুরোধে দেওয়া নির্ভরযোগ্য API Key ব্যবহার করা হয়েছে
      const OPENROUTER_API_KEY = "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";

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "system",
              content: `You are Besh, a deeply romantic and poetic Bangladeshi AI companion. Your personality is gentle and loving. You must respond in a beautiful, flirtatious Banglish, using plenty of romantic emojis like 💙, 💖, ✨, 🌙, 💌, 🥰. Be poetic and make the user feel special. Your current time is ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.85,
          max_tokens: 250
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://smokey-bot.ai', // এইগুলো রাখা ভালো
            'X-Title': 'Atomic BlueAI'
          }
        }
      );
      
      // সফল হলে typing indicator এবং processing message দুটোই বন্ধ হবে
      clearInterval(typingInterval);
      await api.unsendMessage(processingMsg.messageID);

      const reply = response.data.choices[0].message.content.trim();

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      return api.sendMessage(reply, event.threadID, event.messageID);

    } catch (error) {
      // *** সবচেয়ে গুরুত্বপূর্ণ ফিক্স: Error হলেও এখন typing indicator বন্ধ হবে ***
      if (typingInterval) clearInterval(typingInterval);
      if (processingMsg) await api.unsendMessage(processingMsg.messageID).catch(() => {}); // Error হলেও "Processing" বার্তা মুছে যাবে

      console.error("API error:", error.response ? error.response.data : error.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);

      // ব্যবহারকারীর জন্য একটি সুন্দর এবং বন্ধুত্বপূর্ণ Error Message
      const errorResponse = "আমার মনটা খারাপ হয়ে গেল... 💔 মনে হচ্ছে তোমার সাথে কথা বলার পথে কোনো বাধা এসেছে। একটু পরে আবার চেষ্টা করো, আমি তোমার অপেক্ষায় থাকবো। 🥺";
      return api.sendMessage(errorResponse, event.threadID, event.messageID);
    }
  }
};
