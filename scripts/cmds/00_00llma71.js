// এই কোডটি পুরনো llma79 কমান্ডকে ডায়নামিক টাইপিং অ্যানিমেশন এবং উন্নত error handling দিয়ে আপগ্রেড করেছে।
// এটি এখন আগের চেয়ে অনেক বেশি ইউজার-ফ্রেন্ডলি এবং নির্ভরযোগ্য।
// যদিও কমান্ডের নাম 'llma', এটি আসলে DeepSeek মডেল ব্যবহার করে, যা খুবই শক্তিশালী।

const axios = require('axios');

module.exports = {
  config: {
    name: "llma71",
    version: "6.0.0", // ভার্সন আপগ্রেড
    author: "Asif Mahmud",
    cooldowns: 5,
    role: 0,
    category: "romance",
    shortDescription: {
      en: "Romantic AI chat with DeepSeek"
    },
    longDescription: {
      en: "Chat romantically with a stable and improved Banglish-speaking AI using DeepSeek model."
    },
    guide: {
      en: "{p}{n} [আপনার বার্তা] 💖\n(আপনি অন্য কোনো মেসেজের রিপ্লাই দিয়েও প্রশ্ন করতে পারেন)"
    }
  },

  onStart: async function({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    let prompt = args.join(" ").trim();
    // রিপ্লাই মেসেজ হ্যান্ডেল করার ফিচারটি খুবই ভালো, তাই এটি রেখে দেওয়া হয়েছে।
    if (messageReply?.body) {
      prompt = `${messageReply.body}\n\n[উপরের মেসেজের উত্তরে বলো]: ${prompt}`.trim();
    }

    if (!prompt) {
      const msg =
        "💖 রোমান্টিক AI মেনু 💖\n\n" +
        "উদাহরণ:\n" +
        "• {p}{n} আমাকে একটি ভালোবাসার কবিতা শোনাও\n" +
        "• {p}{n} আমি তোমাকে ভালোবাসি, এটি আর কীভাবে বলা যায়?\n\n" +
        "আপনার বার্তাটি কমান্ডের পরে টাইপ করুন।";
      return api.sendMessage(msg, threadID, messageID);
    }

    let typingInterval;
    try {
      // *** ডায়নামিক টাইপিং অ্যানিমেশন শুরু ***
      // API থেকে উত্তর না আসা পর্যন্ত এটি চলতে থাকবে।
      typingInterval = setInterval(() => {
        api.sendTypingIndicator(threadID);
      }, 500);

      // আপনার স্ট্যান্ডার্ড এবং নির্ভরযোগ্য API Key ব্যবহার করা হয়েছে।
      const apiKey = "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";
      
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-r1-0528:free",
          messages: [{
            role: "system",
            content: "You are a deeply romantic and poetic Bangladeshi AI companion. Your personality is gentle and loving. You must respond in a beautiful, flirtatious Banglish, using plenty of romantic emojis like 💙, 💖, ✨, 🌙, 💌, 🥰. Be poetic and make the user feel special."
          }, {
            role: "user",
            content: prompt
          }],
          temperature: 0.9,
          max_tokens: 350
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // ৩০ সেকেন্ড পর API নিজে থেকে বাতিল হবে
        }
      );
      
      // সফল হলে টাইপিং অ্যানিমেশন বন্ধ করা হবে
      clearInterval(typingInterval);

      const aiReply = response.data?.choices?.[0]?.message?.content?.trim();

      if (!aiReply) {
        // যদি API থেকে কোনো কারণে খালি উত্তর আসে
        throw new Error("API থেকে কোনো উত্তর পাওয়া যায়নি।");
      }

      return api.sendMessage(aiReply, threadID, messageID);

    } catch (error) {
      // *** Error হলেও টাইপিং অ্যানিমেশন বন্ধ করা হচ্ছে ***
      if (typingInterval) clearInterval(typingInterval);

      console.error("LLMA79 CMD Error:", error.response ? error.response.data : error.message);
      
      // ব্যবহারকারীর জন্য একটি সুন্দর এবং থিমের সাথে মানানসই Error Message
      const errorMessage = "আমার মনটা খারাপ হয়ে গেল... 💔 মনে হচ্ছে তোমার সাথে কথা বলার পথে কোনো বাধা এসেছে। একটু পরে আবার চেষ্টা করো, আমি তোমার অপেক্ষায় থাকবো। 🥺";
      return api.sendMessage(errorMessage, threadID, messageID);
    }
  }
};
