const axios = require('axios');

module.exports = {
  config: {
    name: "devicetop",
    aliases: ["topdevice"],
    version: "2.0", // ✅ Updated version
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Top 10 popular phones (GSM Arena)",
    longDescription: "Show top 10 most liked phones by category from GSMArena",
    category: "phones",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, args }) {
    const API_URL = `https://api.jastin.xyz/gsmarena/top`; // ✅ Updated working API

    try {
      const res = await axios.get(API_URL);
      const data = res.data;

      if (!data || data.length === 0) return message.reply("😔 No data available right now.");

      let replyText = "📱 TOP DEVICES BY CATEGORY 📱\n\n";

      data.forEach(category => {
        replyText += `📌 ${category.category}\n`;
        category.list.forEach((phone, idx) => {
          replyText += `${idx + 1}. ${phone.name} — ❤️ ${phone.favorites} likes\n`;
        });
        replyText += `\n`;
      });

      message.reply(replyText.trim());
    } catch (error) {
      console.error("API Error:", error.message);
      return message.reply("🥺 API not responding. Try again later.");
    }
  }
};
