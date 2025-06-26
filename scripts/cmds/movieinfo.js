const axios = require("axios");

module.exports = {
  config: {
    name: "movieinfo",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Get movie info from IMDb"
    },
    longDescription: {
      en: "Get movie information like title, actors, genres, director, and plot from IMDb."
    },
    category: "media",
    guide: {
      en: "{pn} movie name"
    },
  },

  onStart: async function ({ event, message, args }) {
    const query = args.join(" ");
    if (!query) {
      return message.reply("🎬 Please enter a movie name. Example: /movieinfo Inception");
    }

    try {
      await message.reply("🔍 Searching for movie info... Please wait.");

      const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(query)}`);

      if (!res.data || res.data.error) {
        return message.reply("❌ Movie not found. Try another name.");
      }

      const {
        title = "Unknown",
        year = "N/A",
        runtime = "N/A",
        genres = "N/A",
        director = "N/A",
        actors = "N/A",
        plot = "N/A",
        poster = null
      } = res.data;

      const msg = `🎬 𝗧𝗶𝘁𝗹𝗲: ${title}
🗓️ 𝗬𝗲𝗮𝗿: ${year}
⏱️ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲: ${runtime}
🎭 𝗚𝗲𝗻𝗿𝗲𝘀: ${genres}
🎬 𝗗𝗶𝗿𝗲𝗰𝘁𝗼𝗿: ${director}
🎭 𝗔𝗰𝘁𝗼𝗿𝘀: ${actors}
📖 𝗣𝗹𝗼𝘁: ${plot}`;

      const form = {
        body: msg
      };

      if (poster && poster !== "N/A") {
        form.attachment = await global.utils.getStreamFromURL(poster);
      }

      await message.reply(form);
    } catch (e) {
      console.error("[movieinfo error]", e.message);
      return message.reply("❌ Somossa hoyeche. Movie ta paowa jachchhe na ba API kaj korche na.");
    }
  }
};
