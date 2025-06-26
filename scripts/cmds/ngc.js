const axios = require("axios");

module.exports = {
  config: {
    name: "ngc",
    version: "1.2",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: "Get PUBG player info",
    longDescription: {
      en: "Retrieve PUBG player info from a public working API with photo and bio."
    },
    category: "info",
    guide: {
      en: "{pn} <player name> - Get info\n{pn} list - Show all available player names"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const playerName = args.join(" ");
      const prefix = global.GoatBot?.config?.prefix || "!";

      if (!playerName)
        return message.reply(
          `❌ Player name de bro!\n🔎 Full player list pete likho:\n${prefix}ngc list`
        );

      if (playerName.toLowerCase() === "list") {
        return message.reply(
          `───────────────\n📜 Available Player List:\n───────────────\n1. Mortal\n2. Dynamo\n3. Scout\n4. Jonathan\n5. Mavi\n6. ZGod\n7. Owais\n8. ClutchGod\n9. Snax\n10. Kronten\n───────────────\n🧾 Format:\n${prefix}ngc <player name>`
        );
      }

      const { data } = await axios.get(`https://api.popcat.xyz/pubg?user=${encodeURIComponent(playerName)}`);

      if (!data || !data.username) throw new Error("Invalid data or player not found");

      const info = `📱 Player Info for: ${data.username}
──────────────────
🏅 Rank: ${data.rank || "Unknown"}
🥇 Wins: ${data.wins || "N/A"}
🔫 K/D: ${data.kd || "N/A"}
🎯 Headshots: ${data.headshots || "N/A"}
🚀 Top 10s: ${data.top10 || "N/A"}`;

      return message.reply({ body: info });

    } catch (err) {
      console.error("❌ NGC ERROR:", err.message);
      return message.reply("😵 Player khuja jaina bro, thik name use kor or try again later.");
    }
  }
};
