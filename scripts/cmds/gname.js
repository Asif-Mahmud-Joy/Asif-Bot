const axios = require("axios");

module.exports = {
  config: {
    name: "gname",
    aliases: ["gendername"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Predict gender from name",
    longDescription: "Predict someone's gender based on their name using genderize.io API",
    category: "fun",
    guide: {
      en: "{pn} [name]",
    },
  },

  onStart: async function ({ message, args, api, event }) {
    const name = args.join(" ").trim();
    if (!name)
      return api.sendMessage("❌ Please provide a name to predict gender.", event.threadID, event.messageID);

    try {
      const res = await axios.get(`https://api.genderize.io?name=${encodeURIComponent(name)}`);
      const { gender, probability, count } = res.data;

      if (!gender)
        return api.sendMessage("😕 Gender could not be determined for this name.", event.threadID, event.messageID);

      const percent = Math.round(probability * 100);
      api.sendMessage(
        `🔍 Gender Prediction Result:
━━━━━━━━━━━━━━━
👤 Name: ${name}
🚻 Gender: ${gender.toUpperCase()}
📊 Probability: ${percent}% (Based on ${count} data points)`,
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error("[Gender API Error]", error);
      api.sendMessage("❌ Somossa hoise gender predict korar somoy. Try again later.", event.threadID, event.messageID);
    }
  },
};
