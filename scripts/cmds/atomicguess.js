const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "animeguess",
    aliases: ["guessanime"],
    version: "1.0",
    author: "mahi karigori by Asif",
    role: 0,
    shortDescription: "Anime character guessing game",
    longDescription: "Guess the anime character for rewards",
    category: "game",
    guide: {
      en: "{p}animeguess"
    }
  },

  onStart: async function ({ message }) {
    try {
      // Fetch a random anime character
      const response = await axios.get('https://global-prime-mahis-apis.vercel.app');
      const characters = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      const character = characters[Math.floor(Math.random() * characters.length)];

      // Download character image
      const imagePath = path.join(__dirname, 'character.jpg');
      const imageRes = await axios.get(character.image, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, imageRes.data);

      // Send game message
      const gameMsg = 
        `Guess this anime character!\n\n` +
        `Traits: ${character.traits}\n` +
        `Tags: ${character.tags}\n\n` +
        `You have 30 seconds to answer!`;

      const sentMsg = await message.reply({ 
        body: gameMsg, 
        attachment: fs.createReadStream(imagePath) 
      });

      // Set game state
      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: this.config.name,
        correctAnswer: [character.fullName, character.firstName],
        imagePath: imagePath
      });

      // Set timeout
      setTimeout(async () => {
        if (global.GoatBot.onReply.has(sentMsg.messageID)) {
          await message.reply(
            `Time's up! The answer was: ${character.fullName}`
          );
          fs.unlinkSync(imagePath);
          global.GoatBot.onReply.delete(sentMsg.messageID);
        }
      }, 30000);

    } catch (err) {
      console.error("Error:", err);
      message.reply("An error occurred. Please try again.");
    }
  },

  onReply: async function ({ message, event, Reply, usersData }) {
    try {
      const userAnswer = event.body.trim().toLowerCase();
      const correctAnswers = Reply.correctAnswer.map(ans => ans.toLowerCase());

      if (correctAnswers.includes(userAnswer)) {
        const reward = 1000;
        const currentMoney = await usersData.get(event.senderID, "money") || 0;
        await usersData.set(event.senderID, { money: currentMoney + reward });
        
        await message.reply(
          `Correct! You won ${reward} coins.\n` +
          `Character: ${Reply.correctAnswer[0]}\n` +
          `Your new balance: ${currentMoney + reward} coins`
        );
      } else {
        await message.reply(
          `Wrong! The correct answer was: ${Reply.correctAnswer[0]}`
        );
      }

      // Cleanup
      fs.unlinkSync(Reply.imagePath);
      global.GoatBot.onReply.delete(Reply.messageID);

    } catch (err) {
      console.error("Error:", err);
    }
  }
};
