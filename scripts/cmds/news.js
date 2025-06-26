const axios = require("axios");

module.exports = {
  config: {
    name: "news",
    version: "2.0.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Lấy tin tức mới nhất",
      en: "Get the latest news",
      bn: "সর্বশেষ খবর দেখাও"
    },
    longDescription: {
      vi: "Lệnh này lấy các tin tức mới nhất từ một API đáng tin cậy.",
      en: "This command fetches the latest news from a reliable API.",
      bn: "এই কমান্ডটি একটি বিশ্বস্ত API থেকে সর্বশেষ সংবাদ নিয়ে আসে।"
    },
    category: "utility",
    guide: {
      vi: "{pn}",
      en: "{pn}",
      bn: "{pn}"
    }
  },

  langs: {
    vi: {},
    en: {},
    bn: {},
  },

  onStart: async function ({ api, event }) {
    try {
      const { data } = await axios.get("https://inshortsapi.vercel.app/news?category=all");

      if (!data?.data || !Array.isArray(data.data) || data.data.length === 0) {
        return api.sendMessage("😶 No news available right now. Try again later.", event.threadID, event.messageID);
      }

      const topNews = data.data.slice(0, 5); // Get top 5 news
      let msg = "📰 Top News Headlines:\n\n";
      for (const article of topNews) {
        msg += `📌 ${article.title}\n🌐 ${article.source_name}\n🔗 ${article.url}\n\n`;
      }

      return api.sendMessage(msg.trim(), event.threadID, event.messageID);
    } catch (err) {
      console.error("❌ NEWS CMD ERROR:", err.message);
      return api.sendMessage("🚫 API theke news ana jayna. Try later or contact support.", event.threadID, event.messageID);
    }
  }
};
