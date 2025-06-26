const axios = require('axios');

module.exports = {
  config: {
    name: "musicinfo",
    aliases: ["itunesinfo", "songinfo"],
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Get song info from iTunes",
      bn: "iTunes theke ganer tothho paw",
    },
    longDescription: {
      en: "Search for music and get detailed information using iTunes API.",
      bn: "iTunes API diye gan khuje tar detailed info paw",
    },
    category: "study",
    guide: {
      en: "{pn} <song name>",
      bn: "{pn} <ganer naam>"
    }
  },

  onStart: async function ({ message, args }) {
    const query = args.join(" ");
    if (!query) return message.reply("⚠️ Song name ditor ba na likhle kaj hobena!");

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`;

    try {
      const response = await axios.get(url);
      const results = response.data.results;

      if (!results.length) return message.reply("❌ Kono result paowa jay nai!");

      const data = results[0];

      const name = data.trackName || "Unknown";
      const artist = data.artistName || "Unknown";
      const album = data.collectionName || "Unknown";
      const releaseDate = data.releaseDate ? new Date(data.releaseDate).toDateString() : "Unknown";
      const price = data.trackPrice ? `$${data.trackPrice}` : "Free / N/A";
      const length = data.trackTimeMillis ? `${Math.floor(data.trackTimeMillis / 60000)}:${Math.floor((data.trackTimeMillis % 60000) / 1000).toString().padStart(2, '0')} min` : "Unknown";
      const genre = data.primaryGenreName || "Unknown";
      const urlTrack = data.trackViewUrl || "N/A";
      const thumbnail = data.artworkUrl100 || null;

      const msg = {
        body:
          `🎵 ===「 Music Info 」===\n` +
          `🎶 Name: ${name}\n` +
          `🧑‍🎤 Artist: ${artist}\n` +
          `💿 Album: ${album}\n` +
          `📅 Release Date: ${releaseDate}\n` +
          `💲 Price: ${price}\n` +
          `⏱️ Length: ${length}\n` +
          `🎧 Genre: ${genre}\n` +
          `🔗 URL: ${urlTrack}`
      };

      if (thumbnail) {
        const stream = await global.utils.getStreamFromURL(thumbnail);
        msg.attachment = stream;
      }

      message.reply(msg);
    } catch (err) {
      console.error("iTunes API Error:", err);
      message.reply("😢 Sorry bhai, kichu ekta vul hoise. Try korte paro abar.");
    }
  }
};
