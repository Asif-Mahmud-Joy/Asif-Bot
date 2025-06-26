const axios = require("axios");

module.exports = {
  config: {
    name: "pickuplines",
    aliases: ["pickupline"],
    version: "1.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get random pickup lines",
      bn: "Random pick-up line paw jabe"
    },
    longDescription: {
      en: "Get random pickup lines to flirt smartly!",
      bn: "Majedaar pick-up line paw jabe bondhu der ke hasanor jonno."
    },
    category: "fun",
    guide: {
      en: "{p}pickuplines",
      bn: "{p}pickuplines"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const response = await axios.get("https://api.popcat.xyz/pickuplines");
      const pickupline = response.data.pickupline || "Sorry, kono pick-up line paoa jai nai.";

      const message = `💘 Pick-Up Line for You:

❝ ${pickupline} ❞`;
      return api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
      console.error("[PickupLine Error]", error.message);
      return api.sendMessage(
        "❌ Sorry! API theke data ana jai nai. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
