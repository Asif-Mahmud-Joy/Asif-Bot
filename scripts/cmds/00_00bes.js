// এই কোডটি পুরনো এবং নষ্ট API বদলে নতুন এবং শক্তিশালী OpenRouter AI দিয়ে তৈরি করা হয়েছে।
// আপনার দেওয়া Banglish যোগ করার অনুরোধটিও পূরণ করা হয়েছে।
// আপনাকে শুধু এই সম্পূর্ণ কোডটি কপি করে আপনার bes.js ফাইলে পেস্ট করতে হবে।

const axios = require('axios');

module.exports = {
    config: {
        name: 'besh', // নাম 'besh' রাখা হয়েছে আপনার অনুরোধ অনুযায়ী
        version: '2.0', // ভার্সন আপগ্রেড করা হয়েছে
        author: 'Asif', // Author আপডেট করা হয়েছে
        role: 0,
        category: 'AI-Chat',
        shortDescription: {
            en: 'Chat with a friendly AI assistant named Besh.'
        },
        longDescription: {
            en: 'This command uses a powerful AI model to provide helpful and friendly responses, often in Banglish.'
        },
        guide: {
            en: '{pn} [your question]' // ব্যবহারবিধি সহজ করা হয়েছে
        },
    },

    onStart: async function ({ api, event, args, usersData }) {
        // ব্যবহারকারীর প্রশ্ন একসাথে যুক্ত করা
        const query = args.join(" ");

        // যদি ব্যবহারকারী কোনো প্রশ্ন না করে, তবে তাকে একটি বার্তা দেখানো হবে
        if (!query) {
            return api.sendMessage("🤖 Besh বলছি! আমাকে কিছু জিজ্ঞেস করুন। مثلاً: '{p}besh ঢাকার সেরা বিরিয়ানির দোকান কোনটি?'", event.threadID, event.messageID);
        }

        try {
            // ব্যবহারকারীর নাম নেওয়া হচ্ছে
            const { name } = await usersData.get(event.senderID);
            const userName = name || "বন্ধু"; // যদি নাম না পাওয়া যায়, তবে 'বন্ধু' ব্যবহার করা হবে

            // ব্যবহারকারীকে জানানো হচ্ছে যে উত্তর তৈরি হচ্ছে
            api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
            
            // OpenRouter API-এর জন্য প্রয়োজনীয় তথ্য
            const openRouterApiKey = "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"; // আপনার দেওয়া API কী
            const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

            // AI-কে নির্দেশনা দেওয়া হচ্ছে যেন সে বন্ধুর মতো উত্তর দেয়
            const systemPrompt = `You are a friendly and helpful AI assistant named 'Besh'. Your personality is cheerful and you often use casual Banglish (Bengali words written in English letters) in your responses, like a friend from Bangladesh would talk. Your goal is to be helpful and conversational. The user's name is ${userName}.`;

            const response = await axios.post(
                apiUrl,
                {
                    model: "deepseek/deepseek-r1-0528:free", // বিনামূল্যে ব্যবহারযোগ্য একটি ভালো মডেল
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: query }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${openRouterApiKey}`,
                        'Content-Type': 'application/json',
                        // OpenRouter-এর জন্য এই হেডারগুলো যোগ করা ভালো
                        'HTTP-Referer': 'https://your-site-url.com', 
                        'X-Title': 'Your-Bot-Name'
                    }
                }
            );

            // API থেকে পাওয়া উত্তরটি বের করে আনা
            if (response.data && response.data.choices && response.data.choices[0].message && response.data.choices[0].message.content) {
                const aiResponse = response.data.choices[0].message.content.trim();
                
                // সফলভাবে উত্তর পাঠানো হচ্ছে
                api.sendMessage(`🤖 Besh:\n\n${aiResponse}`, event.threadID, event.messageID);
                api.setMessageReaction("✅", event.messageID, (err) => {}, true);

            } else {
                // যদি API থেকে সঠিক উত্তর না আসে
                throw new Error("API থেকে কোনো উত্তর পাওয়া যায়নি।");
            }

        } catch (error) {
            console.error(`❌ | Besh AI Error: ${error.message}`);
            
            let errorMessage = "❌ | দুঃখিত বন্ধু, একটি সমস্যা হয়েছে।";
            // যদি API থেকে কোনো নির্দিষ্ট error message আসে, সেটাও দেখানো যেতে পারে
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage += `\nError: ${error.response.data.error.message}`;
            }
            
            api.sendMessage(errorMessage, event.threadID, event.messageID);
            api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        }
    },
};
