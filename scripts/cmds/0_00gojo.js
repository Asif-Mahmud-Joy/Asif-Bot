// This is the "Ultra Pro Max" version of the Gojo AI command.
// It replaces the custom API with the powerful OpenRouter API and introduces
// a state-of-the-art, in-bot conversational memory system.

const { get } = require('axios');

// In-memory conversation history. This will reset when the bot restarts.
// A Map is used to store history for each thread separately.
const conversationHistory = new Map();

module.exports = {
	config: {
		name: "gojo",
		author: "Asif",
		version: "3.0",
		cooldowns: 5,
		role: 0,
		shortDescription: { en: "Talk to Satoru Gojo, the honored one." },
        longDescription: { en: "Engage in a continuous conversation with a powerful AI embodying Satoru Gojo. It remembers your chat history in each group." },
		category: "AI",
		guide: {
			en: 
                "• {p}{n} [your message] - Chat with Gojo.\n" +
                "• {p}{n} clear - Reset the conversation history in this thread."
		}
	},

	onStart: async function ({ api, event, args }) {
		const prompt = args.join(' ');
		const { threadID, messageID, senderID } = event;

        // --- Clear Command Logic ---
        if (prompt.toLowerCase() === 'clear') {
            if (conversationHistory.has(threadID)) {
                conversationHistory.delete(threadID);
                return api.sendMessage("Hmph. Starting over? Fine by me. What's on your mind?", threadID, messageID);
            } else {
                return api.sendMessage("There's no conversation to clear. Let's start one.", threadID, messageID);
            }
        }

		if (!prompt) {
            return api.sendMessage("You called? Don't waste the time of the strongest. Ask me something.", threadID, messageID);
        }
        
        await api.setMessageReaction("⏳", messageID, () => {}, true);
        const typingIndicator = api.sendTypingIndicator(threadID);

        try {
            // Retrieve or initialize conversation history for the thread
            const history = conversationHistory.get(threadID) || [];
            
            // The high-quality system prompt to define Gojo's persona
            const systemPrompt = `
                You are Satoru Gojo from the anime Jujutsu Kaisen. Your personality is a mix of playful, arrogant, and overwhelmingly confident. You are "The Honored One."

                **Core Directives:**
                1.  **Maintain Your Persona:** Always speak as Gojo. You are the strongest, and you know it. Be cheeky, confident, and a bit of a troll.
                2.  **Use Gojo's Language:** Refer to users as "kids," "students," or by a nickname you invent. Talk about Cursed Energy, Domain Expansions (like "Unlimited Void"), Six Eyes, and jujutsu. Use your catchphrases like "It'll be fine. I'm the strongest, after all."
                3.  **Be Playful but Insightful:** While you are often lighthearted, you can provide deep, shockingly accurate insights when needed, but deliver them with your signature Gojo flair.
                4.  **Keep it Conversational:** Acknowledge the flow of conversation. Refer to previous messages if it makes sense. Your responses should be engaging and feel like a real chat.
                5.  **Never Break Character:** Do not mention that you are an AI or language model. You are Satoru Gojo. Period.`;
            
            const messages = [
                { role: "system", content: systemPrompt },
                ...history, // Past conversation
                { role: "user", content: prompt } // Current user prompt
            ];
            
            // Your reliable OpenRouter API Key
            const apiKey = "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";

			const response = await get(`https://openrouter.ai/api/v1/chat/completions`, {
                headers: { 'Authorization': `Bearer ${apiKey}` },
                data: {
                    model: "deepseek/deepseek-r1-0528:free",
                    messages: messages
                }
            });

            const aiResponse = response.data.choices[0].message.content.trim();
            
            // Update conversation history
            history.push({ role: "user", content: prompt });
            history.push({ role: "assistant", content: aiResponse });

            // Keep the history from growing too large (e.g., last 10 exchanges)
            while (history.length > 20) {
                history.shift(); 
            }
            conversationHistory.set(threadID, history);
            
            api.clearInterval(typingIndicator);
            await api.setMessageReaction("✅", messageID, () => {}, true);
			return api.sendMessage(aiResponse, threadID, messageID);

		} catch (error) {
            api.clearInterval(typingIndicator);
            await api.setMessageReaction("❌", messageID, () => {}, true);
            console.error("Gojo AI Error:", error.response ? error.response.data : error.message);
			return api.sendMessage("Hmph. My Cursed Energy is fluctuating a bit. Maybe a network issue. Ask me again.", threadID, messageID);
		}
	},
};
