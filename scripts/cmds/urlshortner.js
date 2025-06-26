const axios = require("axios");

module.exports = {
  config: {
    name: "short",
    version: "1.1",
    author: "Mr.Smokey [Asif Mahmud]",
    role: 0,
    shortDescription: {
      en: "Shorten a URL using TinyUtils",
      bn: "URL ছোট করো TinyUtils দিয়ে",
      bd: "Link choto koro TinyUtils diye"
    },
    longDescription: {
      en: "This command allows you to shorten a URL using TinyUtils.",
      bn: "এই কমান্ডটি ব্যবহার করে তুমি যেকোনো URL ছোট করতে পারো।",
      bd: "Ei command diye link choto kora jai."
    },
    category: "utility",
    guide: {
      en: "{pn} <url>",
      bn: "{pn} <url> লিখে URL ছোট করো",
      bd: "{pn} <url> diye link choto koro"
    },
  },

  onStart: async function ({ args, message }) {
    const apiKey = "127f0ad7536d10f10f877b643cad33aa932ae";

    const formatUrl = (url) => {
      if (!url.startsWith("https://") && !url.startsWith("http://")) {
        return "https://" + url;
      }
      return url;
    };

    const getErrorFromCode = (code) => {
      const errors = {
        1: "🔁 এই URL আগে থেকেই ছোট করা হয়েছে।",
        2: "❌ এটি একটি সঠিক URL নয়।",
        3: "⚠️ এই নামটি আগেই নেওয়া হয়েছে।",
        4: "🚫 API কী ভুল।",
        5: "🧩 URL-এ অবৈধ ক্যারেক্টার আছে।",
        6: "🚷 URL ব্লক করা ডোমেইন থেকে।"
      };
      return errors[code] || "❓ অজানা একটি সমস্যা হয়েছে।";
    };

    const shortenUrl = async (apiKey, longUrl) => {
      try {
        const apiUrl = `https://cutt.ly/api/api.php?key=${apiKey}&short=${longUrl}`;
        const res = await axios.get(apiUrl);

        if (res.data.url.status === 7) {
          return message.reply(`✅ Short link: ${res.data.url.shortLink}`);
        } else {
          return message.reply(getErrorFromCode(res.data.url.status));
        }
      } catch (err) {
        return message.reply(`❗সার্ভার সমস্যাঃ ${err.message}`);
      }
    };

    if (args.length >= 1) {
      return shortenUrl(apiKey, formatUrl(args[0]));
    } else {
      return message.reply("ℹ️ দয়া করে একটি URL দিন অথবা কোনো মেসেজ reply করুন যাতে একটি URL আছে।");
    }
  }
};
