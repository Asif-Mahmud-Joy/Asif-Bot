// This is a complete, "Ultra Pro Max" GoatBot command for the Kimi-Dev AI model.
// It uses the API key and model specified in your request to create a powerful AI chat command.
// Simply create a 'kimi.js' file in your commands folder and paste this code.

const axios = require('axios');

module.exports = {
  config: {
    name: "kimi",
    version: "1.0.0",
    author: "Asif",
    cooldowns: 10,
    role: 0,
    category: "ai",
    shortDescription: { en: "Chat with the Kimi-Dev AI." },
    longDescription: { en: "Engage in conversation with the powerful Kimi-Dev-72B model from Moonshot AI via OpenRouter." },
    guide: {
      en: "{p}{n} [your question or prompt]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    const { threadID, messageID } = event;

    if (!prompt) {
      return message.reply("Please provide a question for the Kimi-Dev AI.\n\nExample: {p}kimi write a python function to reverse a string");
    }

    let typingIndicator;
    try {
      // Provide immediate feedback that the command is running
      await message.react("⏳");
      typingIndicator = api.sendTypingIndicator(threadID);

      const apiKey = "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";
      
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "moonshotai/kimi-dev-72b:free",
          messages: [
            { role: "user", content: prompt }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000', // Optional but recommended
            'X-Title': 'GoatBot Kimi Command'     // Optional but recommended
          },
          timeout: 60000 // 60-second timeout for long responses
        }
      );

      // Stop the typing indicator and update reaction
      api.clearInterval(typingIndicator);
      await message.react("✅");

      const aiResponse = response.data.choices[0].message.content.trim();

      // Send the AI's response
      return message.reply(aiResponse);

    } catch (error) {
      // Ensure typing indicator and reaction are handled on error
      if (typingIndicator) api.clearInterval(typingIndicator);
      await message.react("❌");

      console.error("Kimi AI Error:", error.response ? JSON.stringify(error.response.data, null, 2) : error.message);

      let errorMessage = "An error occurred while communicating with the Kimi-Dev AI.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage += `\nDetails: ${error.response.data.error.message}`;
      } else {
        errorMessage += " The service may be busy or down. Please try again later.";
      }
      
      return message.reply(errorMessage);
    }
  }
};
