const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "zom",
    aliases: [],
    author: "Mr.Smokey [Asif Mahmud]",
    version: "1.0",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: "Zombie filter",
      bn: "জোম্বি ফিল্টার",
      bnglish: "Jombi filter"
    },
    longDescription: {
      en: "Applies a zombie effect to an image",
      bn: "একটি ছবিতে জোম্বি ইফেক্ট লাগান",
      bnglish: "Ekti chobi te zombie effect lagao"
    },
    category: "fun",
    guide: {
      en: "{p}{n} [reply to image or provide image URL]",
      bn: "{p}{n} [ছবির রিপ্লাই দিন বা একটি ছবি URL দিন]",
      bnglish: "{p}{n} [chobir reply din ba ekta chobi URL din]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    let imageUrl;

    if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
      const attachment = event.messageReply.attachments[0];
      if (attachment.type === "photo") {
        imageUrl = attachment.url;
      } else {
        return api.sendMessage("⚠️ দয়া করে একটি ছবির রিপ্লাই দিন।", threadID, messageID);
      }
    } else if (args.length > 0) {
      imageUrl = args.join(" ");
    } else {
      return api.sendMessage("⚠️ একটি ছবি রিপ্লাই করুন বা একটি ছবি URL দিন।", threadID, messageID);
    }

    try {
      api.sendMessage("🧟‍♀️ জোম্বি ফিল্টার প্রয়োগ করা হচ্ছে...", threadID, messageID);

      const response = await axios.get("https://free-api.ainz-sama101.repl.co/canvas/toZombie", {
        params: { url: encodeURI(imageUrl) }
      });

      const resultUrl = response.data.result.image_data;
      const imagePath = __dirname + "/cache/zombie.png";
      const imageData = (await axios.get(resultUrl, { responseType: "arraybuffer" })).data;

      fs.writeFileSync(imagePath, Buffer.from(imageData));

      return api.sendMessage(
        { attachment: fs.createReadStream(imagePath) },
        threadID,
        () => fs.unlinkSync(imagePath),
        messageID
      );
    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ সমস্যা হয়েছে: " + error.message, threadID, messageID);
    }
  }
};
