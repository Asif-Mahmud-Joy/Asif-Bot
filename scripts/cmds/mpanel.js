const axios = require('axios');
const fs = require("fs");

module.exports = {
  config: {
    name: "mpanel",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "Anime manga panel generate",
    longDescription: "Apnar poshonder anime character diye manga style panel toiri korun.",
    category: "image",
    guide: {
      en: "{p}{n} character name or id | main text | sub text",
      bn: "{p}{n} character name or ID | main lekha | sub lekha"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    const info = args.join(" ");
    if (!info.includes("|")) {
      return message.reply("📝 Format thik moto din:\n{pn} Character Name or ID | Main Text | Sub Text");
    }

    const parts = info.split("|").map(p => p.trim());
    const characterInput = parts[0];
    const mainText = parts[1] || "";
    const subText = parts[2] || "";

    let characterID = characterInput;
    let isNameSearch = isNaN(characterInput);

    try {
      await message.reply("⏳ Manga panel toiri hocche... Please wait senpai... ✨");

      if (isNameSearch) {
        const searchRes = await axios.get(`https://mmd.smart-api.net/api/searchAvt?key=${encodeURIComponent(characterInput)}`);

        if (!searchRes.data?.result?.ID) {
          return message.reply("❌ Character khuje paoya jai nai. Onugroho kore thik nam din.");
        }

        characterID = searchRes.data.result.ID;
      }

      // ✅ Use new working API (Tested)
      const finalImageURL = `https://mmd.smart-api.net/api/avtWibu5?id=${characterID}&tenchinh=${encodeURIComponent(mainText)}&tenphu=${encodeURIComponent(subText)}&apikey=free1`;

      const form = {
        body: "✅ Manga panel toiri hoyeche senpai! 😻",
        attachment: await global.utils.getStreamFromURL(finalImageURL)
      };

      await message.reply(form);

    } catch (err) {
      console.error("[mpanel error]", err);
      return message.reply("😿 Somossa hoyeche. Poroborti te abar try korun or check the character name.");
    }
  }
};
