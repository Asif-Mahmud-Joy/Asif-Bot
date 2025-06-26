const axios = require("axios");

module.exports = {
  config: {
    name: "spy",
    version: "1.1",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 60,
    role: 0,
    shortDescription: "User info + avatar",
    longDescription: "Get user info (name, gender, avatar, etc) by mention, reply, or UID.",
    category: "image",
    guide: "{pn} [mention/reply/uid/profile-link]"
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    try {
      const senderID = event.senderID;
      let targetUID;

      // Check for UID in args or mention
      if (args[0]) {
        if (/^\d+$/.test(args[0])) {
          targetUID = args[0];
        } else {
          const match = args[0].match(/profile\.php\?id=(\d+)/);
          if (match) targetUID = match[1];
        }
      }

      if (!targetUID) {
        targetUID = event.type === "message_reply"
          ? event.messageReply.senderID
          : Object.keys(event.mentions)[0] || senderID;
      }

      const userInfo = await api.getUserInfo(targetUID);
      const user = userInfo[targetUID];

      if (!user) return message.reply("❌ User info paoya jay nai.");

      const avatarUrl = `https://graph.facebook.com/${targetUID}/picture?width=512&height=512`;
      let genderText = user.gender === 1 ? "👧 Girl" : user.gender === 2 ? "👦 Boy" : "❓ Unknown";

      const info = `🔍 USER INFO
━━━━━━━━━━━━━━━
👤 Name: ${user.name}
🔗 Profile: https://facebook.com/${targetUID}
⚥ Gender: ${genderText}
🤝 Is Friend: ${user.isFriend ? "Yes" : "No"}
🎂 Birthday Today: ${user.isBirthday ? "Yes" : "No"}`;

      const imgStream = await global.utils.getStreamFromURL(avatarUrl);
      message.reply({ body: info, attachment: imgStream });

    } catch (e) {
      console.error(e);
      message.reply("❌ User data load korte somossa hoise. Try again later.");
    }
  }
};
