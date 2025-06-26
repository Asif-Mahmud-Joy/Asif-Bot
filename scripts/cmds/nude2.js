const axios = require("axios");

module.exports = {
  config: {
    name: "nude",
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    role: 2,
    countDown: 10,
    shortDescription: "🔞 NSFW pic send kore (admin only)",
    longDescription: "Ei command use kore ekta random NSFW image send kora hoy. Admin chara use kora jabe na.",
    category: "adult",
    guide: {
      en: "{pn} — Get a random NSFW pic",
      bn: "{pn} — Random NSFW pic paben"
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;

    // ✅ Permission check (only allowed users can use this)
    const allowedIDs = ["100085332887575", senderID]; // Replace or expand as needed
    if (!allowedIDs.includes(senderID)) {
      return api.sendMessage("❌ Sorry! Ei command apni use korte parben na.", threadID, messageID);
    }

    try {
      const res = await axios.get("https://xapi.myanimelistapi.repl.co/nsfw");
      if (!res.data || !res.data.url) {
        return api.sendMessage("❌ Image load korte somossa hoise.", threadID, messageID);
      }

      const imageResponse = await axios.get(res.data.url, { responseType: 'stream' });

      await api.sendMessage({
        body: `🔞 𝗥𝗮𝗻𝗱𝗼𝗺 𝗡𝗦𝗙𝗪 𝗜𝗺𝗮𝗴𝗲\n𝗧𝘆𝗽𝗲: ${res.data.type || "unknown"}`,
        attachment: imageResponse.data
      }, threadID, messageID);

    } catch (err) {
      console.error("[nude command error]", err);
      return api.sendMessage("❌ API error ba image pawa jai nai.", threadID, messageID);
    }
  }
};
