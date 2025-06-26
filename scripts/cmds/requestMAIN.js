const fs = require("fs");
const path = require("path");
const { config } = global.GoatBot;

const pendingIDsPath = path.join(__dirname, "assist_json", "pending_main.json");
const approvedIDsPath = path.join(__dirname, "assist_json", "approved_main.json");

module.exports = {
  config: {
    name: "requestmain",
    version: "1.2",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    category: "Utility",
    role: 0,
    guide: {
      en: "{pn} Your <message for admin>"
    }
  },

  onStart: async function ({ api, args, event }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);
    const threadID = event.threadID;
    const senderID = event.senderID;
    let threadInfo;

    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch (e) {
      return api.sendMessage("❌ Error fetching thread info.", threadID);
    }

    // Ensure assist_json folder exists
    const assistDir = path.join(__dirname, "assist_json");
    if (!fs.existsSync(assistDir)) fs.mkdirSync(assistDir);

    // Ensure files exist
    if (!fs.existsSync(pendingIDsPath)) fs.writeFileSync(pendingIDsPath, "[]");
    if (!fs.existsSync(approvedIDsPath)) fs.writeFileSync(approvedIDsPath, "[]");

    const approvedIDs = JSON.parse(fs.readFileSync(approvedIDsPath));
    if (approvedIDs.includes(threadID)) {
      return api.sendMessage(
        `╔════ஜ۩۞۩ஜ═══╗\n\n✅ This thread is already approved to use all main commands.\n\nℹ️ Type: ${p}support to join the support box if needed.\n\n╚════ஜ۩۞۩ஜ═══╝`,
        threadID
      );
    }

    const pendingIDs = JSON.parse(fs.readFileSync(pendingIDsPath));
    if (pendingIDs.includes(threadID)) {
      return api.sendMessage(
        `╔════ஜ۩۞۩ஜ═══╗\n\n⏳ Your approval request is already pending.\n📞 Contact admin XNIL for fast approval:\n🔗 https://www.facebook.com/xnilxhowdhury143\n\nℹ️ Type: ${p}support to join support box.\n\n╚════ஜ۩۞۩ஜ═══╝`,
        threadID
      );
    }

    const userMessage = args.join(" ");
    if (!userMessage) {
      return api.sendMessage(
        `╔════ஜ۩۞۩ஜ═══╗\n\n⚠️ Please include a message for the admin.\n\n📌 Example: ${p}requestmain I want to use the bot.\n\n╚════ஜ۩۞۩ஜ═══╝`,
        threadID
      );
    }

    pendingIDs.push(threadID);
    fs.writeFileSync(pendingIDsPath, JSON.stringify(pendingIDs, null, 2));

    const requesterName = await getUserName(api, senderID);

    const adminMsg = `╔════ஜ۩۞۩ஜ═══╗\n\n🔔 MAIN BOT ACCESS REQUEST\n\n🆔 Thread ID: ${threadID}\n🏷 Type: ${threadInfo.isGroup ? "Group" : "User"}\n${threadInfo.isGroup ? `👥 Group Name: ${threadInfo.name}` : ""}\n👤 Requester: ${requesterName} (${senderID})\n\n📝 Message: ${userMessage}\n\n╚════ஜ۩۞۩ஜ═══╝`;

    for (const adminID of config.DEV || []) {
      try {
        await api.sendMessage(adminMsg, adminID);
      } catch (e) {
        console.error("Failed to notify admin:", adminID, e);
      }
    }

    const userNotify = `╔════ஜ۩۞۩ஜ═══╗\n\n✅ Your request to use main commands has been sent to admin.\n\n📝 Message: ${userMessage}\n\n⏳ Please wait for approval.\n💬 Type: ${p}support to join the support box.\n\n╚════ஜ۩۞۩ஜ═══╝`;
    api.sendMessage(userNotify, threadID);
  }
};

async function getUserName(api, userID) {
  try {
    const user = await api.getUserInfo(userID);
    return user[userID]?.name || "Unknown User";
  } catch (e) {
    return "Unknown User";
  }
}
