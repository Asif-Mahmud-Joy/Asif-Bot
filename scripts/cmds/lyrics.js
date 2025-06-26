const axios = require('axios');

module.exports = {
  config: {
    name: "lyrics",
    aliases: ["lyrics", "lyric"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 3,
    role: 0,
    shortDescription: "🎶 Ganer Lyrics khujo",
    longDescription: "🎤 Gaan er naam diye lyrics khujo easily",
    category: "media",
    guide: "{pn} <gaan er naam>"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) return api.sendMessage("⚠️ Gaaner naam dao!", event.threadID);

    try {
      const { data } = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`);

      if (!data || !data.lyrics) {
        return api.sendMessage("❌ Lyrics khuja jai nai!", event.threadID);
      }

      const title = data.title || "Unknown Title";
      const author = data.author || "Unknown Artist";
      const lyrics = data.lyrics.length > 3800 ? data.lyrics.substring(0, 3800) + "...\n\n⚠️ Lyrics full dekhar jonno gaaner naam shoho Google e khujo." : data.lyrics;

      const msg = `🎶 Title: ${title}\n🎤 Artist: ${author}\n\n📄 Lyrics:\n${lyrics}`;
      api.sendMessage(msg, event.threadID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ Lyrics anar somoy error hoise. Porer try koro.", event.threadID);
    }
  }
};
