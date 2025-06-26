const axios = require('axios');

module.exports = {
  config: {
    name: "dance",
    version: "1.0", //vai ata amr asif mahmud banano atr cradit churi koris na ^_~
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "💃 Anime dance gif/video",
    longDescription: "Sends a random anime dance gif or short video from multiple sources.",
    category: "anime",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    // List of fallback dance GIFs (including the ones you requested)
    const fallbackDances = [
      "https://i.waifu.pics/PCTp3I3.gif", // Default one you wanted
      "https://media.tenor.com/WNVZq-4Z1JAAAAAd/anime-dance-dancer-girl.gif", // From your first link
      "https://media.tenor.com/2W1xuNxH0QwAAAAC/pocketmine-chika.gif", // Second link
      "https://media.tenor.com/3f4nB0ZQ9YQAAAAd/zero-two-dance.gif", // Third link
      "https://media.tenor.com/6zFqRw6eBvQAAAAC/anime-dance.gif", // Fourth link
      "https://media.tenor.com/4UJ5y7Zjw4kAAAAd/miku-hatsune-dance.gif", // Fifth link
      "https://media.tenor.com/rJd6rQY0Q5kAAAAC/kakashi-dance.gif", // Sixth link
      "https://media.tenor.com/9fYg1L0X1lUAAAAC/anime-dance.gif", // Seventh link
      "https://media.tenor.com/7Xb3h3j3J3IAAAAC/madoka-magica.gif", // Eighth link
      "https://media.tenor.com/5j7zWzWZw9AAAAAC/dance-anime.gif" // Ninth link
    ];

    try {
      // First try the waifu.pics API
      const apiResponse = await axios.get('https://api.waifu.pics/sfw/dance');
      const danceUrl = apiResponse.data.url;

      const form = {
        body: `🕺 *Let's Dance!* 💃 (From API)`,
        attachment: await global.utils.getStreamFromURL(danceUrl)
      };

      await message.reply(form);
      
    } catch (err) {
      console.error("[DANCE CMD] API failed, using fallback GIFs:", err);
      
      // Select a random GIF from the fallback list
      const randomDance = fallbackDances[Math.floor(Math.random() * fallbackDances.length)];
      
      const fallbackForm = {
        body: `💃 *Dance Time!* 🕺 (Fallback GIF)`,
        attachment: await global.utils.getStreamFromURL(randomDance)
      };
      
      message.reply(fallbackForm);
    }
  }
};
