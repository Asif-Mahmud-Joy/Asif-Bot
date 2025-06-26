module.exports.config = {
  name: "spamkick",
  version: "2.0.0",
  role: 0,
  author: "Mr.Smokey [Asif Mahmud]",
  usePrefix: true,
  description: {
    en: "Auto-kick spammer from group"
  },
  category: "group",
  guide: { en: "{pn} on/off" },
  countDown: 5
};

const SPAM_LIMIT = 4; // Maximum messages allowed
const TIME_FRAME = 80000; // 80 seconds

module.exports.onChat = async ({ api, event, usersData, commandName }) => {
  const { senderID, threadID } = event;

  if (!global.antispam) global.antispam = new Map();
  const thread = global.antispam.get(threadID) || { users: {} };

  const user = thread.users[senderID] || { count: 0, time: Date.now() };
  user.count++;

  const timePassed = Date.now() - user.time;
  if (timePassed > TIME_FRAME) {
    user.count = 1;
    user.time = Date.now();
  } else if (user.count > SPAM_LIMIT) {
    if (global.GoatBot.config.adminBot.includes(senderID)) return;

    api.removeUserFromGroup(senderID, threadID, async (err) => {
      if (!err) {
        const userName = await usersData.getName(senderID);
        api.sendMessage({
          body: `${userName} ke spam korar jonne group theke remove kora holo.\nReact ei message e dile abar add korbo.`,
        }, threadID, (err, info) => {
          if (!err) {
            global.GoatBot.onReaction.set(info.messageID, {
              commandName,
              uid: senderID,
              messageID: info.messageID
            });
          }
        });
      }
    });
    user.count = 1;
    user.time = Date.now();
  }

  thread.users[senderID] = user;
  global.antispam.set(threadID, thread);
};

module.exports.onReaction = async ({ api, event, Reaction, threadsData, usersData, role }) => {
  const { uid, messageID } = Reaction;
  if (role < 1) return;

  const { adminIDs, approvalMode } = await threadsData.get(event.threadID);
  const botID = api.getCurrentUserID();
  let msg = "";

  try {
    await api.addUserToGroup(uid, event.threadID);
    if (approvalMode && !adminIDs.includes(botID)) {
      msg = `${await usersData.getName(uid)} ke approval list e add kora holo.`;
    } else {
      msg = `${await usersData.getName(uid)} ke group e add kora holo.`;
    }
    await api.unsendMessage(messageID);
  } catch (err) {
    msg = `${await usersData.getName(uid)} ke abar add kora gelo na.`;
  }

  api.sendMessage(msg, event.threadID);
};

module.exports.onStart = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  if (!global.antispam) global.antispam = new Map();

  switch ((args[0] || '').toLowerCase()) {
    case "on":
      global.antispam.set(threadID, { users: {} });
      return api.sendMessage("✅ SpamKick ON kora holo ei group e.", threadID, messageID);
    case "off":
      if (global.antispam.has(threadID)) {
        global.antispam.delete(threadID);
        return api.sendMessage("❌ SpamKick OFF kora holo ei group e.", threadID, messageID);
      }
      return api.sendMessage("⚠️ SpamKick already off ache ei group e.", threadID, messageID);
    default:
      return api.sendMessage("📌 Use koren: spamkick on/off", threadID, messageID);
  }
};
