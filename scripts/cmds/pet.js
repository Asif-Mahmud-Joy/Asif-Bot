const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pet",
    version: "1.2",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Pet someone with animated image.",
      bn: "Kawke pet korar chobi (animation)"
    },
    longDescription: {
      en: "Generate a fun animated pet image of the user you mention or reply to.",
      bn: "Reply ba mention kora user-er ekta pet animation image banay."
    },
    category: "fun",
    guide: {
      en: "{pn} [blank | reply | mention | uid]",
      bn: "{pn} [mention/reply/uid] diye chalu korun"
    }
  },

  onStart: async function ({ event, api, args }) {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;
    let targetID = senderID;

    // Identify the target ID
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (args.join(" ").includes("@")) {
      targetID = Object.keys(mentions)[0];
    } else if (args[0]) {
      targetID = args[0];
    }

    const imgPath = path.join(__dirname, "cache", `pet-${targetID}.gif`);

    try {
      await api.sendMessage("🐶 Processing pet image...", threadID, messageID);

      const res = await axios.get(`https://milanbhandari.imageapi.repl.co/pet?uid=${targetID}`, {
        responseType: "stream"
      });

      await fs.ensureDir(path.join(__dirname, "cache"));
      const writer = fs.createWriteStream(imgPath);
      res.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `🐾 Here's your pet animation!`,
          attachment: fs.createReadStream(imgPath)
        }, threadID, () => fs.unlinkSync(imgPath));
      });

      writer.on("error", (err) => {
        console.error("Stream error:", err);
        api.sendMessage("❌ File write failed.", threadID);
      });
    } catch (err) {
      console.error("API error:", err);
      api.sendMessage("😵 Sorry! Couldn't fetch the pet animation.", threadID);
    }
  }
};
