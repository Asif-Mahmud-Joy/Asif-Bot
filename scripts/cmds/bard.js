const axios = require("axios");
const fs = require("fs");
const gtts = require("gtts");
const path = require("path");

module.exports = {
  config: {
    name: "bard",
    aliases: ["ai", "ask"],
    version: "1.0",
    author: "Asif",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Advanced AI with image understanding, voice response, and image search"
    },
    longDescription: {
      en: "Bard AI with multimodal capabilities including text/image queries, voice responses, and Pinterest image search"
    },
    category: "ai",
    guide: {
      en: "{pn} [query] or reply to an image"
    }
  },

  onStart: async function({ api, args, event }) {
    const { threadID, messageID, type, messageReply } = event;
    
    // Improved error handling
    try {
      // Handle image or text input
      let query;
      if (type === "message_reply" && messageReply.attachments?.[0]?.type === "photo") {
        const imageUrl = messageReply.attachments[0].url;
        query = await this.convertImageToText(imageUrl);
        if (!query) {
          return api.sendMessage("❌ Failed to process the image. Please try again with a clearer image.", threadID, messageID);
        }
      } else {
        query = args.join(" ");
        if (!query) {
          return api.sendMessage("Please provide a question or attach an image.", threadID, messageID);
        }
      }

      api.sendMessage("🔍 Processing your request...", threadID, messageID);

      // Get AI response (with fallback to OpenRouter)
      const aiResponse = await this.getAIResponse(query);
      
      // Get Pinterest images
      const pinterestImages = await this.getPinterestImages(query);
      
      // Format and send responses
      await this.sendResponses(api, threadID, query, aiResponse, pinterestImages);

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("⚠️ An error occurred. Please try again later.", threadID, messageID);
    }
  },

  // Helper methods
  convertImageToText: async function(imageUrl) {
    try {
      const response = await axios.get(
        `https://bard-ai.arjhilbard.repl.co/api/other/img2text?input=${encodeURIComponent(imageUrl)}`
      );
      return response.data.extractedText;
    } catch (error) {
      console.error("Image to text error:", error);
      return null;
    }
  },

  getAIResponse: async function(query) {
    try {
      // Try Bard API first
      const bardResponse = await axios.get(
        `https://bard-ai.arjhilbard.repl.co/bard?ask=${encodeURIComponent(query)}`,
        { timeout: 30000 }
      );
      return bardResponse.data.message;
    } catch (error) {
      console.log("Falling back to OpenRouter...");
      // Fallback to OpenRouter
      const openRouterResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "moonshotai/kimi-dev-72b:free",
          messages: [{ role: "user", content: query }]
        },
        {
          headers: {
            "Authorization": "Bearer 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",
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );
      return openRouterResponse.data.choices[0].message.content;
    }
  },

  getPinterestImages: async function(query) {
    try {
      const response = await axios.get(
        `https://api-all-1.arjhilbard.repl.co/pinterest?search=${encodeURIComponent(query)}`,
        { timeout: 15000 }
      );
      return response.data.data.slice(0, 6); // Limit to 6 images
    } catch (error) {
      console.error("Pinterest error:", error);
      return [];
    }
  },

  sendResponses: async function(api, threadID, query, textResponse, imageUrls) {
    // Format text response
    const formattedResponse = this.formatText(`📝 AI Response:\n\n${textResponse}`);
    
    // Send text response
    await api.sendMessage(formattedResponse, threadID);

    // Generate and send voice response
    await this.sendVoiceResponse(api, threadID, textResponse);

    // Send Pinterest images if available
    if (imageUrls.length > 0) {
      await this.sendPinterestImages(api, threadID, query, imageUrls);
    }
  },

  formatText: function(text) {
    const fontMap = {
      a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", 
      i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", 
      q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", 
      y: "𝗒", z: "𝗓", A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", 
      G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", 
      O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", 
      W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
    };

    return text.split('').map(char => fontMap[char] || char).join('');
  },

  sendVoiceResponse: async function(api, threadID, text) {
    try {
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
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
    } catch (error) {
      console.error("Voice error:", error);
    }
  },

  sendPinterestImages: async function(api, threadID, query, imageUrls) {
    try {
      const cacheDir = path.join(__dirname, 'cache');
      const imagePaths = [];

      // Download images in parallel
      await Promise.all(imageUrls.map(async (url, i) => {
        try {
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          const imagePath = path.join(cacheDir, `pinterest_${i}.jpg`);
          fs.writeFileSync(imagePath, response.data);
          imagePaths.push(imagePath);
        } catch (error) {
          console.error(`Error downloading image ${i}:`, error);
        }
      }));

      if (imagePaths.length > 0) {
        await api.sendMessage({
          body: `📷 Image Results for: ${query}`,
          attachment: imagePaths.map(path => fs.createReadStream(path))
        }, threadID);
      }
    } catch (error) {
      console.error("Image sending error:", error);
    }
  }
};
