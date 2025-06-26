// ✅ Fixed, Updated & Upgraded Version (v2.0.1)
const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "fluxai",
    version: "2.0.1",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    longDescription: {
      en: "Generate AI images based on your prompt."
    },
    category: "image",
    guide: {
      en: "{pn} <prompt>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ").trim();

    if (!prompt) return message.reply("🔴 Prompt dao bhai, ki image banamu? 🤨");

    message.reply("🕐 Creating your image, wait a moment...", async (err, info) => {
      if (err) return console.error(err);

      try {
        const url = `https://global-redwans-apis.onrender.com/api/flux?p=${encodeURIComponent(prompt)}&mode=flux`;
        const res = await axios.get(url);
        const html = res?.data?.html;

        const match = html?.match(/https:\/\/aicdn\.picsart\.com\/[a-zA-Z0-9-]+\.jpg/);

        if (!match) return message.reply("❌ Image generate korte problem hocche. Try again later.");

        const imgStream = await getStreamFromURL(match[0], "generated_flux_image.jpg");

        return message.reply({
          body: "✅ Flux image ready! Generated successfully. ✨",
          attachment: imgStream
        });

      } catch (e) {
        console.error(e);
        return message.reply("🔥 Error hoyeche. Check koren connection/API status abar try koren.");
      }
    });
  }
};
