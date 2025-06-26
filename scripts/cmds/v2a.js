const fs = require("fs");

module.exports = {
  config: {
    name: "v2a",
    aliases: ["video2audio"],
    description: "Convert Video to Audio",
    version: "1.5",
    author: "Mr.Smokey[Asif Mahmud]",
    countDown: 60,
    longDescription: {
      vi: "Chuyển đổi video sang âm thanh",
      en: "Reply to a video to extract audio",
      bn: "ভিডিও রিপ্লাই দিন, আমি অডিও বানিয়ে দিবো!"
    },
    category: "media",
    guide: {
      vi: "{pn}: trả lời video để chuyển thành âm thanh",
      en: "{pn}: reply to a video to convert to audio",
      bn: "{pn}: ভিডিও রিপ্লাই দিন, আমি অডিও বানাবো"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const lang = message.getLang?.() || "bn";
    const texts = {
      vi: {
        replyVideo: "Vui lòng trả lời một video để chuyển thành âm thanh.",
        notVideo: "Nội dung trả lời phải là video."
      },
      en: {
        replyVideo: "Please reply to a video message to convert it to audio.",
        notVideo: "The replied content must be a video."
      },
      bn: {
        replyVideo: "📌 ভাই, একটা ভিডিও রিপ্লাই দেন, আমি অডিও বানায় দিমু!",
        notVideo: "⚠️ ভাই, রিপ্লাই করা কনটেন্টটা ভিডিও হতে হবে!"
      }
    };
    const t = texts[lang] || texts.en;

    try {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage(t.replyVideo, event.threadID, event.messageID);
      }

      const att = event.messageReply.attachments[0];
      if (att.type !== "video") {
        return api.sendMessage(t.notVideo, event.threadID, event.messageID);
      }

      const { data } = await axios.get(att.url, {
        method: 'GET',
        responseType: 'arraybuffer'
      });

      const filePath = __dirname + "/assets/vdtoau.m4a";
      fs.writeFileSync(filePath, Buffer.from(data, 'utf-8'));

      const audioReadStream = fs.createReadStream(filePath);
      const msg = { body: "🎵 Here's your audio from the video:", attachment: [audioReadStream] };
      api.sendMessage(msg, event.threadID, event.messageID);
    } catch (e) {
      console.error("[v2a Error]", e);
      api.sendMessage("❌ An unexpected error occurred while converting the video.", event.threadID);
    }
  },
};
