const fs = require("fs");
const path = require("path");
const { config } = global.GoatBot;

const pendingIDsPath = path.join(__dirname, "assist_json", "pending_ids.json");
const approvedIDsPath = path.join(__dirname, "assist_json", "approved_ids.json");

module.exports = {
  config: {
    name: "requestnsfw",
    version: "1.2",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    category: "Utility",
    role: 0,
    guide: {
      en: "{pn} Your <message for admin>"
    }
  },

  onStart: async function ({ api, args, event, threadsData }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);
    const threadID = event.threadID;
    const senderID = event.senderID;
    const threadInfo = await api.getThreadInfo(threadID);

    const userMessage = args.join(" ");
    if (!userMessage) {
      return api.sendMessage(
        `⚠️ Please add a message for admin.\n\nExample: ${p}requestnsfw I want NSFW access`,
        threadID
      );
    }

    // Ensure pending & approved files exist
    if (!fs.existsSync(pendingIDsPath)) fs.writeFileSync(pendingIDsPath, "[]");
    if (!fs.existsSync(approvedIDsPath)) fs.writeFileSync(approvedIDsPath, "[]");

    const approvedIDs = JSON.parse(fs.readFileSync(approvedIDsPath));
    const pendingIDs = JSON.parse(fs.readFileSync(pendingIDsPath));

    // Already approved
    if (approvedIDs.includes(threadID)) {
      return api.sendMessage(
        `✅ This thread is already approved for NSFW commands.\n\nFor help, type: ${p}support`,
        threadID
      );
    }

    // Already pending
    if (pendingIDs.includes(threadID)) {
      return api.sendMessage(
        `⌛ Your request is already pending.\nContact admin (XNiL): https://www.facebook.com/xnilxhowdhury143\nOr join support using: ${p}support`,
        threadID
      );
    }

    // Add to pending
    pendingIDs.push(threadID);
    fs.writeFileSync(pendingIDsPath, JSON.stringify(pendingIDs, null, 2));

    const threadType = threadInfo.isGroup ? "Group" : "User";
    const requesterName = await getUserName(api, senderID);
    const msgToAdmin =
      `🔔 NSFW Access Request\n\nThread ID: ${threadID}\nType: ${threadType}\n` +
      (threadInfo.isGroup ? `Group Name: ${threadInfo.name}\n` : "") +
      `User ID: ${senderID}\nName: ${requesterName}\n\nMessage: ${userMessage}`;

    for (const adminID of config.DEV) {
      api.sendMessage(msgToAdmin, adminID);
    }

    return api.sendMessage(
      `✅ Your NSFW access request has been sent to admin.\nMessage: ${userMessage}\nPlease wait for approval or join support: ${p}support`,
      threadID
    );
  }
};

async function getUserName(api, userID) {
  const userInfo = await api.getUserInfo(userID);
  return userInfo[userID]?.name || "Unknown";
}
