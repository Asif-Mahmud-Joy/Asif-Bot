const axios = require("axios");

module.exports.config = {
  name: "tempmail",
  aliases: ["tm"],
  version: "2.0",
  role: 0,
  countdown: 5,
  author: "Mr.Smokey [Asif Mahmud]",
  usePrefix: true,
  description: "Create and check temporary email inbox",
  category: "media",
};

const TEMPMAIL_API = "https://tempmail-api-z2my.onrender.com/api";

module.exports.onStart = async ({ api, event, args }) => {
  try {
    if (args[0] === "inbox") {
      if (!args[1]) {
        return api.sendMessage("❌ Please provide an email address to check inbox.", event.threadID);
      }

      const email = args[1];
      const inboxUrl = `${TEMPMAIL_API}/inbox/${encodeURIComponent(email)}`;
      const inboxResponse = await axios.get(inboxUrl);

      if (!inboxResponse.data.success || inboxResponse.data.messages.length === 0) {
        return api.sendMessage(`📭 No messages found for ${email}.", event.threadID);
      }

      let inboxText = `📬 Inbox of ${email}:
\n`;
      for (const msg of inboxResponse.data.messages) {
        inboxText += `📩 From: ${msg.from}\n📝 Subject: ${msg.subject || 'No subject'}\n📨 Body: ${msg.body.replace(/<[^>]*>/g, '')}\n---------------------\n`;
      }

      return api.sendMessage(inboxText, event.threadID);
    } else {
      const genUrl = `${TEMPMAIL_API}/generate`;
      const tempMailResponse = await axios.get(genUrl);

      if (!tempMailResponse.data.success || !tempMailResponse.data.email) {
        return api.sendMessage("❌ Failed to generate a temporary email.", event.threadID);
      }

      const email = tempMailResponse.data.email;
      return api.sendMessage(`📥 Your temporary email: ${email}\nUse: /tempmail inbox ${email} to check inbox.`, event.threadID);
    }
  } catch (err) {
    console.error("TempMail Error:", err?.response?.data || err.message);
    return api.sendMessage("⚠️ Something went wrong. Try again later.", event.threadID);
  }
};
