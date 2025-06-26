const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "1.1.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    role: 0,
    countDown: 10,
    shortDescription: {
      en: "Search Pinterest and fetch images",
      bn: "Pinterest theke image khojen"
    },
    longDescription: {
      en: "Search for images on Pinterest using a keyword and get up to 20 results.",
      bn: "Pinterest e kichu likhe search korun ebong maximum 20 ta image nin."
    },
    category: "media",
    guide: {
      en: "{pn} <search query> - <number of images>\nExample: {pn} cat - 5",
      bn: "{pn} <search query> - <number of images>\nUdaharan: {pn} cat - 5"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const keySearch = args.join(" ");
      if (!keySearch.includes("-")) {
        return api.sendMessage(
          `🖼️ Please provide a search query and number of images\n\nExample:\n{p}pin cat - 5`,
          event.threadID,
          event.messageID
        );
      }

      const keySearchs = keySearch.split("-")[0].trim();
      let numberSearch = parseInt(keySearch.split("-").pop()) || 6;
      if (numberSearch > 20) numberSearch = 20;

      const apiUrl = `https://api-samir.onrender.com/pinterest?search=${encodeURIComponent(keySearchs)}&count=${numberSearch}`;

      const res = await axios.get(apiUrl);
      const data = res.data.data || [];

      if (!data.length) {
        return api.sendMessage("❌ No image found for your search query.", event.threadID);
      }

      const imgData = [];
      const cacheDir = path.join(__dirname, "cache_pin");
      await fs.ensureDir(cacheDir);

      for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
        try {
          const imgRes = await axios.get(data[i], {
            responseType: "arraybuffer",
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          });
          const imgPath = path.join(cacheDir, `${i + 1}.jpg`);
          fs.writeFileSync(imgPath, imgRes.data);
          imgData.push(fs.createReadStream(imgPath));
        } catch (err) {
          console.error(`Download error for image ${i + 1}:`, err.message);
        }
      }

      await api.sendMessage({
        body: `📌 Result for: ${keySearchs}\n📷 Images: ${imgData.length}`,
        attachment: imgData
      }, event.threadID, event.messageID);

      await fs.remove(cacheDir);

    } catch (error) {
      console.error("[Pinterest Error]", error);
      return api.sendMessage(`❌ Error: ${error.message}`, event.threadID);
    }
  }
};
