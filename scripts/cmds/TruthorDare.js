const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: "truthordare",
    aliases: ["td", "tod", "truthdare"],
    version: "1.0",
    author: "asif",
    countDown: 3,
    role: 0,
    shortDescription: "Enhanced Truth or Dare",
    longDescription: "Play Truth or Dare with multiple data sources and rich formatting",
    category: "Games",
    guide: {
      en: "{pn} [truth/dare] - Get random questions/challenges"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID } = event;
    const [choice] = args;
    const type = choice?.toLowerCase();

    // Validate input
    if (!type || !['truth', 'dare'].includes(type)) {
      return message.reply(`🔍 Please specify "truth" or "dare"\nExample: ${global.GoatBot.config.prefix}td truth`);
    }

    // Design elements
    const design = {
      header: type => `${type === 'truth' ? '🟢 TRUTH' : '🔴 DARE'}`,
      separator: "―".repeat(30),
      footer: "💡 Reply 'more' for another question!",
      emojis: type => type === 'truth' ? ['🔍', '🧠', '🕵️'] : ['💪', '⚡', '🔥']
    };

    // Show typing indicator
    let reactionInterval;
    try {
      const emojis = design.emojis(type);
      let index = 0;
      reactionInterval = setInterval(() => {
        api.setMessageReaction(emojis[index], messageID, () => {});
        index = (index + 1) % emojis.length;
      }, 1000);

      // Try multiple data sources
      let question;
      const sources = [
        // 1. Try external API
        async () => {
          const apiUrl = `https://api.truthordarebot.xyz/v1/${type}`;
          const { data } = await axios.get(apiUrl, { timeout: 5000 });
          return data.question;
        },
        // 2. Fallback to local JSON
        async () => {
          const filePath = path.join(__dirname, 'assist_json', `${type.toUpperCase()}QN.json`);
          const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          return questions[Math.floor(Math.random() * questions.length)];
        }
      ];

      // Try each source until success
      for (const source of sources) {
        try {
          question = await source();
          if (question) break;
        } catch (e) { /* Silently try next source */ }
      }

      if (!question) throw new Error("No questions available");

      // Format response
      const response = [
        design.header(type),
        design.separator,
        question,
        design.separator,
        design.footer
      ].join("\n");

      await message.reply(response);

    } catch (error) {
      console.error("Truth or Dare error:", error);
      message.reply(`❌ Failed to get ${type} question. Please try again later.`);
    } finally {
      if (reactionInterval) clearInterval(reactionInterval);
      api.setMessageReaction("✅", messageID, () => {}, true);
    }
  }
};
