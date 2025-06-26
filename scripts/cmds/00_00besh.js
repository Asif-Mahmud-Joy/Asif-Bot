// এই কোডটি পুরনো এবং অবিশ্বস্ত API বদলে নতুন এবং শক্তিশালী OpenRouter AI দিয়ে তৈরি করা হয়েছে।
// আপনার দেওয়া "flirty gossip bestie" পার্সোনালিটি এবং অন্যান্য ফিচার হুবহু রাখা হয়েছে।
// শুধু এই কোডটি কপি করে আপনার besh24.js ফাইলে পেস্ট করলেই হবে।

const axios = require("axios");

module.exports = {
  config: {
    name: "besh24",
    author: "Asif Mahmud", // Author আপডেট করা হয়েছে
    version: "6.0", // ভার্সন আপগ্রেড করা হয়েছে
    cooldowns: 5,
    role: 0,
    shortDescription: "Chat with a flirty AI bestie.",
    longDescription: "Chat with your gossip bestie Besh, now powered by a more stable and powerful AI.",
    category: "ai",
    guide: "{p}besh24 <your text>"
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ").trim();

    // যদি ব্যবহারকারী কোনো প্রশ্ন না করে, তবে আগের মতোই একটি সুন্দর লাইন পাঠানো হবে।
    // এই ফিচারটি খুবই সুন্দর, তাই এটি রেখে দেওয়া হয়েছে।
    if (!input || input.length < 2) {
      const lines = [
        "oii-🥺🥹-ek🥄 chamoch bhalobasha diba-🤏🏻🙂",
        "janu-😇💕-ekta chumu debe-💋🥰",
        "babu-🌙✨-rater shopne dekha dibe-😴💖",
        "jaan-🌹🥰-ek fota hasi pathabe-😊✉️",
        "tumi-🌟😌-amar bhalobashar karon-🥰🎶",
        "love-😍🔥-tumi chhara nishash ta theme jai-😮‍💨💖",
        "love-❤️🥺-chokhe chokh rakhle hariye jabo-😍🌟",
        "😌-ami shudhu tomar kotha vabbo-💭🌟"
      ];
      const resp = lines[Math.floor(Math.random() * lines.length)];
      return api.sendMessage(resp, event.threadID, event.messageID);
    }

    try {
      // ব্যবহারকারীকে জানানো হচ্ছে যে উত্তর তৈরি হচ্ছে
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      // OpenRouter API-এর জন্য প্রয়োজনীয় তথ্য
      const openRouterApiKey = "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"; // আপনার দেওয়া নির্ভরযোগ্য API কী
      const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

      // AI-এর জন্য নির্দেশনা (Personality) হুবহু একই রাখা হয়েছে
      const systemPrompt = `You're Besh - a flirty Bangladeshi gossip bestie. Respond in Banglish with plenty of emojis. Be playful, dramatic, and a bit over-the-top! Your current time is ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

      const response = await axios.post(
        apiUrl,
        {
          model: "deepseek/deepseek-r1-0528:free", // একটি শক্তিশালী এবং ফ্রি মডেল
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input }
          ],
          // এই প্যারামিটারগুলো AI-এর উত্তরকে আরও ক্রিয়েটিভ করে তোলে
          max_tokens: 200, // উত্তর একটু বড় করার জন্য বাড়ানো হয়েছে
          temperature: 0.9, // আরও নাটকীয় উত্তরের জন্য সামান্য বাড়ানো হয়েছে
          presence_penalty: 0.5,
          frequency_penalty: 0.5
        },
        {
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // API থেকে পাওয়া উত্তরটি বের করে আনা
      const reply = response.data.choices[0].message.content;
      
      // সফলভাবে উত্তর পাঠানো হচ্ছে
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      return api.sendMessage(reply, event.threadID, event.messageID);

    } catch (err) {
      console.error("API error:", err.response ? err.response.data : err.message);
      
      // Error হলে ব্যবহারকারীকে একটি বন্ধুত্বপূর্ণ বার্তা দেওয়া হবে
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      const errorResponse = `ওহো! 😥 Besh এখন একটু বিজি আছে। মনে হচ্ছে সার্ভারে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করো প্লিজ। 💖`;
      return api.sendMessage(errorResponse, event.threadID, event.messageID);
    }
  }
};
