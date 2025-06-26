const axios = require("axios");

module.exports = {
  config: {
    name: "dice",
    aliases: [],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "have fun",
    longDescription: {
      en: "Dice game with bet system"
    },
    category: "game",
    guide: {
      en: "{pn} <dice(1-6)> <amount>"
    },
  },

  onStart: async function ({ api, event, args, usersData, message }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);
    const userData = await usersData.get(event.senderID);
    const dice = parseInt(args[0]);
    const betAmount = parseInt(args[1]);

    //✅ Input validation
    if (isNaN(dice) || dice < 1 || dice > 6) {
      return message.reply(`❌ Invalid dice number.
Use like this:
${p}dice 3 1000`);
    }
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply(`❌ Invalid bet amount.
Use like this:
${p}dice 3 1000`);
    }
    if (userData.money < betAmount) {
      return message.reply("❌ You don't have enough balance to bet.");
    }

    try {
      //🎲 Working public dice API
      const response = await axios.get(`https://api.jastin.xyz/dice?guess=${dice}&amount=${betAmount}`);
      const {
        message: resultMessage,
        image,
        win,
        winAmount
      } = response.data;

      if (win) {
        userData.money += winAmount;
      } else {
        userData.money -= betAmount;
      }
      await usersData.set(event.senderID, userData);

      //🖼️ Show result
      message.reply({
        body: resultMessage,
        attachment: await global.utils.getStreamFromURL(image)
      });

    } catch (error) {
      console.error("Dice command error:", error);
      message.reply("😵‍💫 Error! Server e problem ba API down.");
    }
  },
};
