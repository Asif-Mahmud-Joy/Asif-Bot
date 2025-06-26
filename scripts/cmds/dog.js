// Banglish: Ei command ta random dog image pathay, updated with working API and optimized code

const axios = require('axios');
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "dog",
    aliases: ["doggo"],
    version: "2.0", // ✅ Updated
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Dog image pathay",
    longDescription: "Random dog image pathanor command",
    category: "fun",
    guide: {
      en: "{pn}"
    },
  },

  onStart: async function ({ message, api, event }) {
    try {
      // Banglish: API theke random dog image nicchi
      const res = await axios.get('https://random.dog/woof.json');
      const url = res.data.url;

      // Banglish: File extension ber korchi
      const ext = path.extname(url);
      const filePath = path.join(__dirname, `dog${ext}`);

      // Banglish: File download & pathanor por delete kora hocche
      const response = await axios.get(url, { responseType: 'stream' });
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });

      writer.on("error", (err) => {
        console.error("Download error:", err);
        message.reply("🐶 Dog image nite giye somossa hoise!");
      });
    } catch (err) {
      console.error("API error:", err);
      message.reply("❌ API theke dog image ana jache na.");
    }
  }
};
