// Banglish: Ei script user er text diye AI-generated image toiri kore, working version with no setup needed

const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "draw",
    aliases: ["aiimg"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Text theke AI generated image banay"
    },
    longDescription: {
      en: "Text prompt diye AI diye chobi toiri kore"
    },
    category: "Ai",
    guide: {
      en: "{pn} <prompt>"
    }
  },

  langs: {
    en: {
      syntaxError: "⚠️ Prompt daw. Example: draw a dragon in the sky",
      error: "❗ Kisu problem hoise, pore try koro."
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply(getLang("syntaxError"));

    try {
      const apiURL = `https://api.itsrose.life/image/prompt?prompt=${encodeURIComponent(prompt)}&model=realistic`;

      const res = await axios.get(apiURL, {
        headers: {
          Authorization: "Bearer free"
        }
      });

      const image = res.data.url;

      const stream = await getStreamFromURL(image);
      return message.reply({
        body: `🖼️ Prompt: ${prompt}`,
        attachment: stream
      });
    } catch (err) {
      console.error("Draw command error:", err);
      return message.reply(getLang("error"));
    }
  }
};
