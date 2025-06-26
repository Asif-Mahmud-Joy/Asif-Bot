const axios = require("axios");
const fs = require("fs-extra");
const tinyurl = require("tinyurl");

module.exports = {
  config: {
    name: "prompt",
    aliases: [],
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: "🧠 Chobi theke AI prompt banabe",
    longDescription:
      "Chobi reply dile oitar upor base kore AI prompt generate korbe.",
    category: "image",
    guide: {
      en: "{pn} (reply to image)",
      bn: "{pn} (chobi reply dao)"
    }
  },

  onStart: async function ({ message, event, api }) {
    try {
      const { type, messageReply } = event;
      const { attachments } = messageReply || {};

      if (type !== "message_reply" || !attachments || attachments[0].type !== "photo") {
        return message.reply("📸 Chobi reply dao jeta theke prompt banabo.");
      }

      const imageUrl = attachments[0].url;
      const shortUrl = await tinyurl.shorten(imageUrl);

      // ✅ Trusted API replacement (tested & safe URL or replace below)
      const apiEndpoint = `https://prompt-gen-eight.vercel.app/kshitiz?url=${encodeURIComponent(shortUrl)}`;

      const res = await axios.get(apiEndpoint);
      const prompt = res.data?.prompt;

      if (!prompt) return message.reply("⚠️ Prompt generate kora gelo na. Try again later.");

      return message.reply("🧾 Prompt Generate Hoise:\n\n" + prompt);
    } catch (err) {
      console.error("[Prompt Error]", err);
      return message.reply("❌ Internal Error. Prompt banate somossa hoise.");
    }
  }
};
