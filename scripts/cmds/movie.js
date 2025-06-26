const axios = require("axios");

module.exports = {
  config: {
    name: "movie",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get movie information",
      bn: "Movie somporke totho janun"
    },
    longDescription: {
      en: "Get movie info such as title, year, actors, genres, plot, etc.",
      bn: "Movie title, year, actor, genre, plot er totho pawar jonne"
    },
    category: "information",
    guide: {
      en: "{pn} movie name",
      bn: "{pn} movie er nam"
    }
  },

  onStart: async function ({ message, args }) {
    const query = args.join(" ");
    if (!query) {
      return message.reply("🎬 Movie er nam likhun. Udahoron: /movie Avatar");
    }

    try {
      await message.reply("🔎 Movie khuja hocche... ⏳");

      const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(query)}`);
      const data = res.data;

      if (!data || data.error) {
        return message.reply("❌ Movie pawa jai nai. Onno kichu try korun.");
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
      } = data;

      const response = `🎬 *Title:* ${title}
🗓️ *Year:* ${year}
⏱️ *Runtime:* ${runtime}
🎭 *Genres:* ${genres}
🎬 *Director:* ${director}
⭐ *Actors:* ${actors}
📖 *Plot:* ${plot}`;

      const replyData = { body: response };

      if (poster && poster !== "N/A") {
        replyData.attachment = await global.utils.getStreamFromURL(poster);
      }

      await message.reply(replyData);

    } catch (error) {
      console.error("[movie command error]", error.message);
      return message.reply("🚫 Somossa hoyeche. Movie info pawya jacche na.");
    }
  }
};
