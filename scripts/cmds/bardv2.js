const axios = require("axios");
const fs = require("fs");
const gtts = require("gtts");
const path = require("path");

module.exports = {
  config: {
    name: "bardv2",
    version: "2.0",
    usePrefix: true,
    hasPermission: 0,
    credits: "Asif",
    description: "Advanced Bard AI with image understanding and voice response",
    commandCategory: "AI",
    usages: "[question] or reply to an image",
    cooldowns: 5,
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, type, messageReply, body } = event;
    
    try {
      // Determine if the query is from an image or text
      let question = "";
      if (type === "message_reply" && messageReply.attachments?.[0]?.type === "photo") {
        const imageURL = messageReply.attachments[0].url;
        question = await this.convertImageToText(imageURL);
        if (!question) {
          return api.sendMessage(
            "❌ Failed to process the image. Please try again with a clearer image.",
            threadID,
            messageID
          );
        }
      } else {
        question = body.slice(7).trim(); // Adjusted for "bardv2 " prefix
        if (!question) {
          return api.sendMessage("Please provide a question or reply to an image", threadID, messageID);
        }
      }

      api.sendMessage("🔍 Processing your request...", threadID, messageID);

      // Try Bard AI first, fallback to OpenRouter if needed
      let respond;
      try {
        const bardRes = await axios.get(
          `https://bard-ai.arjhilbard.repl.co/bard?ask=${encodeURIComponent(question)}`,
          { timeout: 15000 }
        );
        respond = bardRes.data.message;
      } catch (bardError) {
        console.log("Bard AI failed, trying OpenRouter...");
        const openRouterRes = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "moonshotai/kimi-dev-72b:free",
            messages: [{ role: "user", content: question }]
          },
          {
            headers: {
              "Authorization": "Bearer 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",
              "Content-Type": "application/json"
            },
            timeout: 20000
          }
        );
        respond = openRouterRes.data.choices[0].message.content;
      }

      // Format and send responses
      const textAnswer = `📝  (𝗔𝗜 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘)\n\n${respond}`;
      
      // Send text response first
      await api.sendMessage(textAnswer, threadID);
      
      // Generate and send voice response
      await this.sendVoiceResponse(api, threadID, respond);

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ An error occurred while processing your request.", threadID, messageID);
    }
  },

  convertImageToText: async function(imageURL) {
    try {
      const response = await axios.get(
        `https://bard-ai.arjhilbard.repl.co/api/other/img2text?input=${encodeURIComponent(imageURL)}`,
        { timeout: 15000 }
      );
      return response.data.extractedText;
    } catch (error) {
      console.error("Image to text conversion error:", error);
      return null;
    }
  },

  sendVoiceResponse: async function(api, threadID, text) {
    try {
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const voicePath = path.join(cacheDir, 'voice.mp3');
      
      await new Promise((resolve, reject) => {
        const voice = new gtts(text, 'en');
        voice.save(voicePath, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      await api.sendMessage({
        body: "🔊 Voice Response:",
        attachment: fs.createReadStream(voicePath)
      }, threadID);

      // Clean up the voice file after sending
      fs.unlink(voicePath, (err) => {
        if (err) console.error("Error deleting voice file:", err);
      });

    } catch (error) {
      console.error("Voice response error:", error);
      api.sendMessage("⚠️ Couldn't generate voice response, but here's the text answer.", threadID);
    }
  }
};
