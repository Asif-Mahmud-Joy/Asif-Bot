// Banglish: Ei command text ke base64 diye online encrypt/decrypt kore

const axios = require("axios");

module.exports = {
  config: {
    name: "encrypt",
    aliases: ["enc", "dec"],
    version: "2.1",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 3,
    role: 0,
    shortDescription: "🔐 Base64 Encrypt/Decrypt text",
    longDescription: "Online API diye simple base64 encode/decode",
    category: "utility",
    guide: {
      en: "{pn} enc <text>\n{pn} dec <base64 text>"
    }
  },

  onStart: async function ({ message, args }) {
    const type = args[0];
    const text = args.slice(1).join(" ");

    if (!["enc", "dec"].includes(type) || !text)
      return message.reply("📌 Use:\n• enc <text>\n• dec <base64>");

    try {
      const url = type === "enc"
        ? `https://api.codersvault.live/api/encode?text=${encodeURIComponent(text)}`
        : `https://api.codersvault.live/api/decode?text=${encodeURIComponent(text)}`;

      const res = await axios.get(url);
      const result = res.data?.result;

      if (!result) return message.reply("❌ API response e kichu nai.");

      return message.reply(
        type === "enc"
          ? `🔐 Encrypted:\n${result}`
          : `🔓 Decrypted:\n${result}`
      );
    } catch (e) {
      return message.reply("❌ API error hoyeche. Server e problem.");
    }
  }
};
