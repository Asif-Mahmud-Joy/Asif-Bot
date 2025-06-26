const fs = require("fs");
const axios = require("axios");
const googleTTS = require("google-tts-api");
const path = require("path");

// Banglish থেকে কিছু সাধারণ বাংলা শব্দ রূপান্তর করার হেল্পার ফাংশন
function convertBanglishToBangla(text) {
  const dictionary = {
    ami: "আমি",
    tumi: "তুমি",
    bhalo: "ভালো",
    kemon: "কেমন",
    achi: "আছি",
    jani: "জানি",
    kotha: "কথা",
    bolo: "বলো",
    kichu: "কিছু",
    na: "না",
    chai: "চাই",
    amar: "আমার",
    tomar: "তোমার",
    bhai: "ভাই",
    dada: "দাদা",
    dadai: "দাদাই",
    bondhu: "বন্ধু",
    valo: "ভালো",
    korbo: "করবো",
    koro: "করো",
    ekhane: "এখানে",
    ekhono: "এখনো"
  };
  const words = text.split(/\s+/);
  return words
    .map(word => dictionary[word.toLowerCase()] || word)
    .join(" ");
}

// ভাষা ডিটেকশন ফাংশন (বাংলা অক্ষর আছে কিনা চেক করে)
function detectLanguage(text) {
  const banglaRegex = /[\u0980-\u09FF]/;
  if (banglaRegex.test(text)) return "bn";

  // অন্য ভাষার জন্য একটু সহজ detect (en, ru, ko, ja, tl)
  const langCodes = ["ru", "en", "ko", "ja", "tl"];
  const firstWord = text.trim().split(/\s+/)[0].toLowerCase();

  if (langCodes.includes(firstWord)) {
    return firstWord;
  }
  return "en"; // ডিফল্ট ইংরেজি
}

module.exports = {
  config: {
    name: "say",
    aliases: ["speak", "kotha", "bol"],
    version: "3.1",
    author: "Asif Mahmud",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Convert text (Bangla, Banglish & multi-language) to voice",
      bn: "বাংলা, বাংলা-ইংরেজি ও বহু ভাষার টেক্সটকে ভয়েসে রূপান্তর করুন"
    },
    longDescription: {
      en: "Bot will speak your Bangla, Banglish or multi-language text using Google TTS with language detection and reply support.",
      bn: "বট আপনার বাংলা, বাংলা-ইংরেজি বা বহু ভাষার টেক্সট Google TTS ব্যবহার করে বলবে।"
    },
    category: "media",
    guide: {
      en: "{pn} <lang code (optional)> <your text>",
      bn: "{pn} <ভাষার কোড (ঐচ্ছিক)> <আপনার টেক্সট>"
    }
  },

  onStart: async function({ args, message, event }) {
    try {
      let text = "";
      // reply message থাকলে সেটাকে নেবে, নাহলে args থেকে নেবে
      if (event.type === "message_reply" && event.messageReply && event.messageReply.body) {
        text = event.messageReply.body;
      } else {
        text = args.join(" ");
      }

      if (!text) return message.reply("⚠️ দয়া করে একটি বার্তা লিখুন!");

      // language detect + lang code strip
      let lang = detectLanguage(text);
      if (["ru", "en", "ko", "ja", "tl"].includes(lang)) {
        // যদি ভাষা কোড detect হয়, টেক্সট থেকে সেই কোডটি বাদ দিবে
        const splitText = text.trim().split(/\s+/);
        splitText.shift();
        text = splitText.join(" ");
      }

      // Banglish থেকে বাংলা কনভার্শন শুধু বাংলা ভাষার জন্য
      if (lang === "bn") {
        text = convertBanglishToBangla(text);
      }

      // google-tts-api দিয়ে TTS URL তৈরি
      const url = googleTTS.getAudioUrl(text, {
        lang,
        slow: false,
        host: "https://translate.google.com",
      });

      // ফাইলের path
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filepath = path.join(cacheDir, `say_${event.threadID}_${event.messageID}.mp3`);

      // MP3 ডাউনলোড
      const res = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(filepath, Buffer.from(res.data, "binary"));

      // মেসেজ রেসপন্স
      await message.reply({
        body: `🔊 বললাম: ${text}`,
        attachment: fs.createReadStream(filepath)
      });

      // ফাইল ডিলিট
      fs.unlink(filepath, err => {
        if (err) console.error("Failed to delete TTS file:", err);
      });
    } catch (error) {
      console.error("❌ Say command error:", error);
      return message.reply("❌ ভয়েস বানাতে সমস্যা হয়েছে! আবার চেষ্টা করুন।");
    }
  }
};
