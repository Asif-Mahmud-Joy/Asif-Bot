const fs = require('fs');
const request = require('request');
const path = require('path');
const moment = require("moment-timezone");

module.exports.config = {
  name: "adminnoti",
  version: "1.1.0",
  permission: 2,
  credits: "Asif",
  description: "Broadcast message from admin with reply system",
  prefix: true,
  category: "admin",
  usages: "[msg]",
  cooldowns: 5
};

let atmDir = [];

const getAtm = (attachments, body) => new Promise((resolve) => {
  let msg = { body }, files = [], count = 0;

  if (attachments.length === 0) return resolve(msg);

  attachments.forEach((att, i) => {
    try {
      const url = att.url;
      const ext = path.extname(att.filename || ".jpg");
      const filePath = `${__dirname}/cache/${Date.now()}_${i}${ext}`;
      atmDir.push(filePath);

      request(url)
        .pipe(fs.createWriteStream(filePath))
        .on("close", () => {
          files.push(fs.createReadStream(filePath));
          count++;
          if (count === attachments.length) {
            msg.attachment = files;
            resolve(msg);
          }
        });
    } catch (err) {
      console.error("Attachment download failed:", err);
      resolve(msg); // still return msg even if something fails
    }
  });
});

module.exports.handleReply = async function ({ api, event, handleReply, Users, Threads }) {
  const { threadID, messageID, senderID, body, attachments } = event;
  const name = await Users.getNameUser(senderID);
  const threadName = (await Threads.getInfo(threadID)).threadName || "Unknown";
  const time = moment.tz("Asia/Manila").format("DD/MM/YYYY - HH:mm:ss");

  switch (handleReply.type) {
    case "sendnoti": {
      let msg = `📩 ${name} replied to your announce\n\n🕒 Time: ${time}\n💬 Reply: ${body}\n\n🧵 Group: ${threadName}`;
      if (attachments.length > 0) msg = await getAtm(attachments, msg);
      api.sendMessage(msg, handleReply.threadID, (err, info) => {
        cleanup();
        global.client.handleReply.push({
          name: this.config.name,
          type: "reply",
          messageID: info.messageID,
          messID: messageID,
          threadID
        });
      });
      break;
    }

    case "reply": {
      let msg = `🔁 Admin ${name} replied:\n\n💬 ${body}\n\nReply again to continue.`;
      if (attachments.length > 0) msg = await getAtm(attachments, msg);
      api.sendMessage(msg, handleReply.threadID, (err, info) => {
        cleanup();
        global.client.handleReply.push({
          name: this.config.name,
          type: "sendnoti",
          messageID: info.messageID,
          threadID
        });
      }, handleReply.messID);
      break;
    }
  }
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID, messageReply } = event;
  const allThread = global.data.allThreadID || [];

  if (!args[0]) return api.sendMessage("⚠️ Please provide a message to broadcast.", threadID);

  const time = moment.tz("Asia/Manila").format("DD/MM/YYYY - HH:mm:ss");
  const senderName = await Users.getNameUser(senderID);
  let content = `📢 Message from admin:\n\n🕒 Time: ${time}\n👤 Admin: ${senderName}\n💬 Message: ${args.join(" ")}\n\n✉️ Reply to this message to respond.`;

  if (event.type === "message_reply" && messageReply?.attachments.length > 0)
    content = await getAtm(messageReply.attachments, content);

  let sent = 0, failed = 0;
  const handleReplyArr = [];

  for (const tid of allThread) {
    try {
      await new Promise((res) => {
        api.sendMessage(content, tid, (err, info) => {
          if (err) failed++;
          else {
            sent++;
            handleReplyArr.push({
              name: this.config.name,
              type: "sendnoti",
              messageID: info.messageID,
              messID: messageID,
              threadID: tid
            });
          }
          res();
        });
      });
    } catch (err) {
      failed++;
    }
  }

  global.client.handleReply.push(...handleReplyArr);
  cleanup();
  return api.sendMessage(`✅ Sent to ${sent} thread(s), ❌ Failed: ${failed}`, threadID);
};

function cleanup() {
  for (const file of atmDir) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  atmDir = [];
}
