const axios = require('axios');

module.exports = {
  config: {
    name: "history",
    aliases: ["historical"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 8,
    role: 0,
    shortDescription: "search and know about history",
    longDescription: "Get short and reliable info about any historical topic using Wikipedia API.",
    category: "info",
    guide: {
      en: "{pn} <search query>",
      bn: "{pn} <search query> diye kono itihash search korun."
    }
  },

  onStart: async function ({ api, args, event }) {
    const query = args.join(" ").trim();

    if (!query) {
      return api.sendMessage("📚 Please provide a topic to search! \nตัวอย่าง: history anglo Nepal war", event.threadID, event.messageID);
    }

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

    try {
      const res = await axios.get(url);

      if (res?.data?.extract && res?.data?.title) {
        const { title, extract, thumbnail, content_urls } = res.data;

        const message = `📖 *${title}*

${extract}

🌐 Read more: ${content_urls?.desktop?.page || 'N/A'}`;

        if (thumbnail?.source) {
          const imgRes = await axios.get(thumbnail.source, { responseType: 'arraybuffer' });
          return api.sendMessage({
            body: message,
            attachment: Buffer.from(imgRes.data, 'binary')
          }, event.threadID, event.messageID);
        } else {
          return api.sendMessage(message, event.threadID, event.messageID);
        }
      } else {
        return api.sendMessage(`😓 Sorry, kono result khuje pai nai for "${query}". Try something else.`, event.threadID, event.messageID);
      }

    } catch (err) {
      console.error("[History command error]", err);
      return api.sendMessage("😞 Kichu problem hoise Wikipedia theke info anar somoy. Try again later.", event.threadID, event.messageID);
    }
  }
};
