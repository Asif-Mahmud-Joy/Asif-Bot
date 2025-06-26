const axios = require('axios');

module.exports = {
  config: {
    name: "quranverse",
    aliases: ["verse", "quran", "ayah"],
    version: "1.0",
    author: "Asif", // Proper credit to Asif
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Get Quran verses with translations and audio"
    },
    longDescription: {
      en: "Fetch Quran verses with multiple translations and optional audio recitation"
    },
    category: "islam",
    guide: {
      en: "{pn} [random] - Get random verse\n{pn} audio - Get verse with recitation\n{pn} [surah]:[verse] - Get specific verse\n{pn} lang [code] - Set translation language (en/ur/ar/bn)"
    }
  },

  langs: {
    en: "English",
    ur: "Urdu",
    ar: "Arabic",
    bn: "Bengali"
  },

  onStart: async function ({ api, event, args, message, getLang }) {
    try {
      // Parse command arguments
      const action = args[0]?.toLowerCase();
      const wantsAudio = action === 'audio';
      const wantsRandom = !action || action === 'random';
      const wantsLanguage = action === 'lang' && args[1];
      const wantsSpecific = /^\d+:\d+$/.test(action);

      // Handle language setting
      if (wantsLanguage) {
        const langCode = args[1].toLowerCase();
        if (this.langs[langCode]) {
          global.quranLanguage = langCode;
          return message.reply(`Translation language set to ${this.langs[langCode]}`);
        }
        return message.reply(`Invalid language. Available: ${Object.keys(this.langs).join(', ')}`);
      }

      // Get current language or default to English
      const language = global.quranLanguage || 'en';

      // Fetch surah list
      const surahsResponse = await axios.get("https://quranapi.pages.dev/api/surah.json");
      if (!surahsResponse.data) throw new Error("Couldn't fetch surah list");

      const surahs = surahsResponse.data;

      // Determine surah and verse
      let surahNumber, verseNumber;
      
      if (wantsSpecific) {
        [surahNumber, verseNumber] = action.split(':').map(Number);
      } else {
        surahNumber = surahs[Math.floor(Math.random() * surahs.length)].number;
        const surahDetail = await axios.get(`https://quranapi.pages.dev/api/${surahNumber}.json`);
        if (!surahDetail.data) throw new Error("Couldn't fetch surah details");
        verseNumber = Math.floor(Math.random() * surahDetail.data.english.length) + 1;
      }

      // Fetch verse data
      const verseResponse = await axios.get(`https://quranapi.pages.dev/api/${surahNumber}/${verseNumber}.json`);
      if (!verseResponse.data) throw new Error("Couldn't fetch verse details");

      const verseData = verseResponse.data;
      const translation = verseData[language] || verseData.english;

      // Build message
      let messageText = `📖 ${verseData.surahName} (${verseData.surahNameTranslation})\n`;
      messageText += `Surah ${surahNumber}:${verseNumber} | ${verseData.revelationPlace}\n\n`;
      messageText += `${verseData.arabic1}\n\n`;
      messageText += `*${this.langs[language]} Translation:*\n${translation}\n\n`;

      // Add audio options if requested
      if (wantsAudio && verseData.audio) {
        const reciters = Object.values(verseData.audio);
        messageText += `🎧 Available Reciters:\n`;
        reciters.forEach((reciter, i) => {
          messageText += `${i+1}. ${reciter.reciter}\n`;
        });
        messageText += `\nReply with number to hear recitation`;

        // Store audio options for reply handling
        global.audioOptions = {
          reciters: reciters,
          verseInfo: `${verseData.surahName} ${surahNumber}:${verseNumber}`
        };
      }

      await message.reply(messageText);

    } catch (error) {
      console.error(error);
      await message.reply("❌ An error occurred while fetching Quran verse. Please try again later.");
    }
  },

  onReply: async function ({ api, event, message, Reply, args }) {
    try {
      if (!global.audioOptions || !args[0]) return;

      const selectedNumber = parseInt(args[0]);
      const { reciters, verseInfo } = global.audioOptions;

      if (isNaN(selectedNumber)) return;
      if (selectedNumber < 1 || selectedNumber > reciters.length) {
        return message.reply("❌ Invalid selection. Please reply with a number from the list.");
      }

      const selectedReciter = reciters[selectedNumber - 1];
      await message.reply({
        body: `🎧 Playing ${verseInfo} - ${selectedReciter.reciter}`,
        attachment: await global.utils.getStreamFromURL(selectedReciter.url)
      });

      // Clean up
      delete global.audioOptions;

    } catch (error) {
      console.error(error);
      await message.reply("❌ Failed to play the recitation. Please try again.");
    }
  }
};
