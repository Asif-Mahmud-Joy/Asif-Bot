const axios = require("axios");

module.exports = {
  config: {
    name: "ocr",
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Extract text from image using OCR",
      bn: "🖼️ ছবির ভেতরের লেখা পড়ে ফেলুন"
    },
    longDescription: {
      en: "Reply to an image or paste a direct image link to extract text using OCR.",
      bn: "এই কমান্ড দিয়ে আপনি কোনো ছবির মধ্যে থাকা লেখা বের করে নিতে পারবেন। শুধু ছবিতে রিপ্লাই দিন অথবা ইমেজ লিংক পেস্ট করুন।"
    },
    category: "utility",
    guide: {
      en: "{pn} reply to an image",
      bn: "{pn} একটি ছবিতে রিপ্লাই দিন"
    }
  },

  onStart: async function ({ event, api, args }) {
    try {
      let imageUrl = null;

      if (event.messageReply && event.messageReply.attachments.length > 0 && event.messageReply.attachments[0].type === 'photo') {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (args.length > 0) {
        imageUrl = args[0];
      } else {
        return api.sendMessage("📸 দয়া করে একটি ছবিতে রিপ্লাই দিন অথবা ইমেজ লিংক দিন।", event.threadID);
      }

      const imgUploadRes = await axios.get(`https://milanbhandari.imageapi.repl.co/imgur?link=${encodeURIComponent(imageUrl)}`);
      const hostedImageURL = imgUploadRes?.data?.image;

      if (!hostedImageURL) throw new Error("Image upload failed");

      const ocrRes = await axios.get(`https://milanbhandari.imageapi.repl.co/ocr?url=${encodeURIComponent(hostedImageURL)}`);

      if (!ocrRes.data.text || ocrRes.data.text.trim() === "") {
        return api.sendMessage("😔 কোনো লেখা পাওয়া যায়নি ছবির মধ্যে।", event.threadID);
      }

      api.sendMessage(`📄 ছবির লেখা:
----------------------\n${ocrRes.data.text}`.trim(), event.threadID);

    } catch (err) {
      console.error("[❌ OCR COMMAND ERROR]", err);
      api.sendMessage("❌ OCR চালানোর সময় সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", event.threadID);
    }
  }
};
