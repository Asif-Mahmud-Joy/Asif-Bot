// এই কোডটি পুরনো romanticopenai কমান্ডের দুর্বলতাগুলো সমাধান করে একটি ডায়নামিক এবং নির্ভরযোগ্য সংস্করণ তৈরি করেছে।
// প্রধান উন্নতি হলো ডায়নামিক টাইপিং অ্যানিমেশন, যা API কলের সঠিক সময় পর্যন্ত চলে।
// Error handling এবং কোডের গঠন আরও উন্নত করা হয়েছে।

const axios = require('axios');

// API কলের মূল ফাংশন
// এটিকে আরও শক্তিশালী করা হয়েছে যাতে এটি error হলে সম্পূর্ণ তথ্য দেয়।
async function openRouterAPI(prompt) {
  // আপনার প্রথম অনুরোধে দেওয়া নির্ভরযোগ্য এবং স্ট্যান্ডার্ড API Key ব্যবহার করা হয়েছে।
  const apiKey = "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";
  const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

  // AI-এর পার্সোনালিটি এখানে সেট করা হয়েছে
  const systemPrompt = "You are a deeply romantic and poetic Bangladeshi AI companion. Your personality is gentle and loving. You must respond in a beautiful, flirtatious Banglish, using plenty of romantic emojis like 💙, 💖, ✨, 🌙, 💌, 🥰. Be poetic and make the user feel special.";

  try {
    const response = await axios.post(apiUrl, {
      model: "deepseek/deepseek-r1-0528:free",
      messages: [{
        role: "system",
        content: systemPrompt
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
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    // এখানে error-টিকে পুনরায় throw করা হচ্ছে যাতে onStart ফাংশন এটি ধরতে পারে।
    console.error("API Error in openRouterAPI:", error.response ? error.response.data : error.message);
    throw new Error("API থেকে উত্তর পেতে সমস্যা হয়েছে।");
  }
}

module.exports = {
  config: {
    name: "llma2",
    version: "2.0", // ভার্সন আপগ্রেড
    author: "Asif Mahmud",
    cooldowns: 5,
    role: 0,
    category: "romance",
    shortDescription: {
      en: "Romantic AI chat with DeepSeek 💕"
    },
    longDescription: {
      en: "Chat romantically with a stable and improved AI using DeepSeek model 💖"
    },
    guide: {
      en: "{p}{n} [আপনার বার্তা] 💌\n(আপনি অন্য কোনো মেসেজের রিপ্লাই দিয়েও প্রশ্ন করতে পারেন)"
    }
  },

  onStart: async function ({ api, event, args }) {
    const {
      messageID,
      threadID,
      messageReply
    } = event;
    let prompt = args.join(' ').trim();

    // রিপ্লাই মেসেজ হ্যান্ডেল করার ফিচারটি খুবই কাজের, তাই এটি রাখা হয়েছে।
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

      const aiResponse = await openRouterAPI(prompt);

      // সফলভাবে উত্তর পাওয়ার পর টাইপিং অ্যানিমেশন বন্ধ করা হচ্ছে
      clearInterval(typingInterval);

      // উত্তর পাঠানো হচ্ছে
      return api.sendMessage(aiResponse, threadID, messageID);

    } catch (error) {
      // *** error হলেও টাইপিং অ্যানিমেশন বন্ধ করা হচ্ছে ***
      if (typingInterval) clearInterval(typingInterval);

      // ব্যবহারকারীর জন্য একটি সুন্দর error বার্তা
      const errorMessage = "আমার হৃদয়টা ভেঙে গেল... 💔 মনে হচ্ছে তোমার সাথে কথা বলার পথে কোনো বাধা এসেছে। একটু পরে আবার চেষ্টা করো, আমি তোমার অপেক্ষায় থাকবো। 🥺";
      return api.sendMessage(errorMessage, threadID, messageID);
    }
  }
};
