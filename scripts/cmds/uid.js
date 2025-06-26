const fs = require("fs-extra");
const request = require("request");
const { findUid } = global.utils;

const regExCheckURL = /^(http|https):\/\/[^ "]+$/;
// Put your own token here or set FB_GRAPH_TOKEN environment variable
const FB_GRAPH_TOKEN = process.env.FB_GRAPH_TOKEN || "6628568379|c1e620fa708a1d5696fb991c1bde5662";

module.exports = {
  config: {
    name: "uid",
    version: "1.4",
    author: "Asif",
    countDown: 5,
    role: 0,
    description: {
      vi: "Xem user id facebook của người dùng cùng avatar",
      en: "View facebook user id of user with profile picture"
    },
    category: "info",
    guide: {
      vi:
        "   {pn}: xem id facebook của bạn\n" +
        "   {pn} @tag: xem id facebook của người được tag\n" +
        "   {pn} <link profile>: xem id facebook của link profile\n" +
        "   Phản hồi tin nhắn của người khác kèm lệnh để xem id facebook của họ",
      en:
        "   {pn}: view your facebook user id\n" +
        "   {pn} @tag: view facebook user id of tagged people\n" +
        "   {pn} <profile link>: view facebook user id of profile link\n" +
        "   Reply to someone's message with the command to view their facebook user id"
    }
  },

  langs: {
    vi: {
      syntaxError: "Vui lòng tag người muốn xem uid hoặc để trống để xem uid của bản thân",
      errorResolve: "Không thể lấy uid từ link hoặc tên người dùng"
    },
    en: {
      syntaxError: "Please tag the person you want to view uid or leave blank to view your own uid",
      errorResolve: "Cannot resolve uid from link or username"
    }
  },

  onStart: async function({ event, message, args, getLang, api }) {
    try {
      let uidList = [];

      // If reply to message → use that sender's ID
      if (event.messageReply) {
        uidList.push(event.messageReply.senderID);
      }
      // If no args → use sender's ID
      else if (!args[0]) {
        uidList.push(event.senderID);
      }
      // If mentions → get all mentioned UIDs
      else if (Object.keys(event.mentions).length > 0) {
        uidList = Object.keys(event.mentions);
      }
      // Otherwise try to resolve UID(s) from args (URLs or usernames)
      else {
        for (const arg of args) {
          if (regExCheckURL.test(arg)) {
            try {
              const resolvedUid = await findUid(arg);
              uidList.push(resolvedUid);
            } catch {
              // skip invalid URLs
            }
          } else {
            try {
              const resolvedUid = await findUid(arg);
              uidList.push(resolvedUid);
            } catch {
              // skip invalid usernames
            }
          }
        }

        if (uidList.length === 0) {
          return message.reply(getLang("syntaxError"));
        }
      }

      // For each UID, download avatar and send info
      for (const uid of uidList) {
        const imgPath = __dirname + `/cache/uid_${uid}.png`;

        // Download Facebook profile picture via Graph API
        await new Promise((resolve, reject) => {
          request(
            encodeURI(
              `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=${FB_GRAPH_TOKEN}`
            )
          )
            .pipe(fs.createWriteStream(imgPath))
            .on("close", resolve)
            .on("error", reject);
        });

        const msgBody = `=== [ FACEBOOK UID ] ====\nID: ${uid}\nm.me/${uid}\nhttps://facebook.com/profile.php?id=${uid}`;

        await api.sendMessage(
          {
            body: msgBody,
            attachment: fs.createReadStream(imgPath)
          },
          event.threadID,
          () => fs.unlinkSync(imgPath),
          event.messageID
        );
      }
    } catch (error) {
      console.error(error);
      return message.reply(getLang("syntaxError") + "\n" + error.message);
    }
  }
};
