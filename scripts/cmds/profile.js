module.exports = {
  config: {
    name: "profile2",
    aliases: ["pfp"],
    version: "1.2",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: "Get profile picture",
    longDescription: "Download someone's profile picture (own, reply, or tagged)",
    category: "image",
    guide: {
      en: "{pn} [@mention | reply] - Get someone's profile picture\n{pn} - Get your own profile picture"
    }
  },

  langs: {
    bn: {
      noValidTarget: "⚠️ Tag den, reply korun, othoba nijer pfp pete command den."
    },
    en: {
      noValidTarget: "⚠️ Please tag someone, reply to their message, or just run the command to get your own profile picture."
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    try {
      const { senderID, type, messageReply, mentions } = event;
      let targetID = senderID;

      if (type === "message_reply" && messageReply?.senderID) {
        targetID = messageReply.senderID;
      } else if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
      }

      const avatarUrl = await usersData.getAvatarUrl(targetID);

      if (!avatarUrl) {
        return message.reply(getLang("noValidTarget"));
      }

      return message.reply({
        body: `📷 Profile Picture:`,
        attachment: await global.utils.getStreamFromURL(avatarUrl)
      });

    } catch (err) {
      console.error("[profile command error]", err);
      message.reply("❌ Something went wrong while fetching the profile picture.");
    }
  }
};
