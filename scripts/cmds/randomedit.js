const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const https = require("https");

module.exports = {
  config: {
    name: "randomedit",
    aliases: [],
    version: "2.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Send a random TikTok-style edit",
      bn: "একটি র‍্যান্ডম টিকটক এডিট পাঠান",
      banglish: "Ekta random TikTok edit pathan"
    },
    longDescription: {
      en: "Sends a random aesthetic edit video from a working API",
      bn: "একটি কাজ করা API থেকে একটি র‍্যান্ডম এডিট ভিডিও পাঠায়",
      banglish: "Ekta kaj kora API theke random edit video pathay"
    },
    category: "media",
    guide: {
      en: "{pn}",
      bn: "{pn}",
      banglish: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const cachePath = path.join(__dirname, "cache");
    const filePath = path.join(cachePath, "randomedit.mp4");

    try {
      await fs.ensureDir(cachePath);
      api.sendMessage("⏳ ভিডিও লোড হচ্ছে... দয়া করে অপেক্ষা করুন...", event.threadID);

      // API থেকে ভিডিও লিস্ট আনা
      const res = await axios.get("https://raw.githubusercontent.com/Kshitiz265/hosted-videos/main/edit-list.json");
      const videoList = res.data.videos;
      if (!videoList || !videoList.length) {
        return api.sendMessage("❌ ভিডিও লিস্ট পাওয়া যায়নি। পরে আবার চেষ্টা করুন।", event.threadID);
      }

      // র‍্যান্ডম ভিডিও সিলেক্ট
      const randomVideo = videoList[Math.floor(Math.random() * videoList.length)];
      if (!randomVideo.url) {
        return api.sendMessage("❌ ভিডিও URL পাওয়া যায়নি। পরে আবার চেষ্টা করুন।", event.threadID);
      }

      // ভিডিও ডাউনলোড ও স্টোর করা
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https.get(randomVideo.url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to get video. Status code: ${response.statusCode}`));
            return;
          }
          response.pipe(file);
          file.on("finish", () => {
            file.close(resolve);
          });
          file.on("error", (err) => {
            fs.unlink(filePath).catch(() => {});
            reject(err);
          });
        }).on("error", (err) => {
          reject(err);
        });
      });

      // ভিডিও পাঠানো
      await api.sendMessage({
        body: "🎬 Random TikTok-style Edit",
        attachment: fs.createReadStream(filePath)
      }, event.threadID);

      // ভিডিও ফাইল ডিলিট
      await fs.unlink(filePath);

    } catch (err) {
      console.error("RandomEdit Error:", err);
      api.sendMessage("❌ ভিডিও আনা বা পাঠাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", event.threadID);
    }
  }
};
