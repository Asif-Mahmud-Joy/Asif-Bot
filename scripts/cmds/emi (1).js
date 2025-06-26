const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "emi",
    aliases: ["emigen", "emimg"],
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    version: "2.1-UltraPro",
    cooldowns: 10,
    role: 0,
    shortDescription: "🖼️ Prompt diye image banan",
    longDescription: "AI prompt use kore image generate korun",
    category: "image",
    guide: {
      en: "{pn} <prompt>",
      bn: "{pn} <আপনার ইমেজ এর বর্ণনা>"
    },
  },

  onStart: async function ({ message, args, api, event }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("⚠️ | Prompt den: উদাহরণ: emi sunset on a beach");

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      // ✅ Ultra Working Free API (No key needed)
      const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      const cachePath = path.join(__dirname, "cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

      const filePath = path.join(cachePath, `${Date.now()}_image.png`);
      fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));

      const imgStream = fs.createReadStream(filePath);
      message.reply({
        body: `📸 | Image for prompt: ${prompt}`,
        attachment: imgStream
      });

    } catch (err) {
      console.error("ImageGen Error:", err.message);
      message.reply("❌ | Image generate kora gelo na. Pore abar try korun.");
    }
  }
};
