const checkShortCut = async (nickname, uid, usersData) => {
  try {
    if (!nickname) return "No nickname set.";

    if (/\{userName\}/gi.test(nickname)) {
      const name = await usersData.getName(uid);
      nickname = nickname.replace(/\{userName\}/gi, name);
    }

    if (/\{userID\}/gi.test(nickname)) {
      nickname = nickname.replace(/\{userID\}/gi, uid);
    }

    return nickname;
  } catch (e) {
    return "⚠️ Error parsing nickname.";
  }
};

module.exports = {
  config: {
    name: "nncheck",
    aliases: ["checknickname"],
    version: "1.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: "Check and reply with nickname",
    longDescription: "Check and reply with the nickname of a mentioned user or your own nickname",
    category: "box chat",
    guide: {
      en: "{pn} @user: Check nickname of the mentioned user\n{pn}: Check your own nickname"
    }
  },

  langs: {
    error: "⚠️ An error has occurred, please try again later.",
    noNickname: "No nickname set.",
    notFound: "User not found in this group.",
    yourNickname: "🧑‍💻 Your Nickname: %1",
    theirNickname: "👤 Nickname of %1: %2"
  },

  onStart: async function ({ message, event, api, usersData, getLang }) {
    try {
      const mentions = Object.keys(event.mentions);
      const uid = mentions.length ? mentions[0] : event.senderID;
      const threadInfo = await api.getThreadInfo(event.threadID);
      const participant = threadInfo.participantIDs.find(id => id === uid);

      if (!participant) return message.reply(getLang("notFound"));

      const rawNickname = threadInfo.nicknames[participant] || getLang("noNickname");
      const nickname = await checkShortCut(rawNickname, uid, usersData);

      if (mentions.length) {
        message.reply(getLang("theirNickname", event.mentions[uid], nickname));
      } else {
        message.reply(getLang("yourNickname", nickname));
      }
    } catch (err) {
      console.error(err);
      message.reply(getLang("error"));
    }
  }
};
