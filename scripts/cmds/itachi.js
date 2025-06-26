const axios = require("axios");

module.exports.config = {
  name: "elisa",
  aliases: ["itachi", "Itachi", "Uchiha"],
  version: "2.0.0",
  role: 0,
  author: "Mr.Smokey [Asif Mahmud]",
  description: "AI ChatBot: Itachi with SimSimi-style replies and Banglish support",
  guide: { en: "{pn} [message] | {pn} teach [question] - [answer] | {pn} list" },
  category: "ChatBots",
  coolDowns: 5,
};

module.exports.onReply = async function ({ api, event }) {
  try {
    if (event.type === "message_reply") {
      const reply = event.body;
      if (!isNaN(reply)) return;

      const { data } = await axios.get(`https://elisa-ai-api.vercel.app/sim?ask=${encodeURIComponent(reply)}`);
      const res = data.respond || "😓 Sorry, no response found.";

      await api.sendMessage(res, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          link: res,
        });
      }, event.messageID);
    }
  } catch (e) {
    console.error("Reply error:", e.message);
  }
};

module.exports.onChat = async function ({ event, api }) {
  if (event.body && ["itachi", "uchiha", "it"].includes(event.body.toLowerCase())) {
    const greetings = [
      "𝗜𝘁𝗮𝗰𝗵𝗶 বলে অসম্মান করচ্ছিছ,😰😿",
      "দূরে যা, তোর কোনো কাজ নাই, শুধু 𝗜𝘁𝗮𝗰𝗵𝗶 𝗜𝘁𝗮𝗰𝗵𝗶 করিস 😉😋🤣",
      "𝗛𝗲𝘆 𝗯𝗯𝘆 𝗜 𝗮𝗺 𝗵𝗲𝗿𝗲🌟",
      "𝗜 𝗮𝗺 𝗻𝗼𝘁 𝗵𝗲𝗿𝗼 𝗶 𝗮𝗺 𝘃𝗶𝗹𝗹𝗶𝗮𝗻💀👑",
      "𝗛𝗲𝘆 𝗯𝗲𝗽 𝗶𝘁𝗮𝗰𝗵𝗶 𝘂𝗰𝗵𝗶𝗵𝗮 𝗶𝘀 𝗵𝗲𝗿𝗲🌊",
      "𝗬𝗲𝘀 𝘀𝗶𝗿 𝗵𝗼𝘄 𝗰𝗮𝗻 𝗶 𝗵𝗲𝗹𝗽 𝘆𝗼𝘂??🌟🍂",
      "বলো আমার ফুলটুসি____😽💙",
      "আজও কারো হতে পারলাম নাহ___😌💙",
      "𝗜 𝗮𝗺 𝗜𝘁𝗮𝗰𝗵𝗶",
      "𝗜𝘁𝗮𝗰𝗵𝗶 বললে চাকরি থাকবে না____😰😰☠",
      "এত 𝗜𝘁𝗮𝗰𝗵𝗶 𝗜𝘁𝗮𝗰𝗵𝗶 করস কেন কি হইছে বল___😾😾🔪🔪",
      "দূরে গিয়ে মর এত 𝗜𝘁𝗮𝗰𝗵𝗶 না করে___😾😾🔪🔪"
    ];
    const selected = greetings[Math.floor(Math.random() * greetings.length)];
    api.sendMessage({ body: selected }, event.threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        link: selected,
      });
    }, event.messageID);
  }
};

module.exports.onStart = async function ({ api, args, event }) {
  try {
    const msg = args.join(" ").trim();
    if (!msg) return api.sendMessage("🧠 লিখুন: elisa [message]", event.threadID, event.messageID);

    const command = args[0].toLowerCase();

    if (command === "teach") {
      const input = msg.slice(5).trim();
      const parts = input.split("-");
      if (parts.length === 2) {
        const question = parts[0].trim();
        const answer = parts[1].trim();
        await axios.get(`https://elisa-ai-api.vercel.app/teach?ask=${question}&ans=${answer}`);
        return api.sendMessage(`✅ শেখানো হয়েছে:
❓: ${question}
💡: ${answer}`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("📘 লিখুন: elisa teach প্রশ্ন - উত্তর", event.threadID, event.messageID);
      }
    }

    if (command === "list") {
      const res = await axios.get("https://elisa-ai-api.vercel.app/info");
      return api.sendMessage(
        `🧠 মোট তথ্য:
🔸 প্রশ্ন: ${res.data.totalKeys}
🔹 উত্তর: ${res.data.totalResponses}`,
        event.threadID,
        event.messageID
      );
    }

    // General chatbot message
    const response = await axios.get(`https://elisa-ai-api.vercel.app/sim?ask=${encodeURIComponent(msg)}`);
    const answer = response.data.respond || "😓 উত্তর পাওয়া যায়নি";
    api.sendMessage(answer, event.threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        link: answer,
      });
    }, event.messageID);

  } catch (e) {
    console.error("[Elisa ERROR]:", e.message);
    return api.sendMessage("❌ ত্রুটি ঘটেছে! দয়া করে পরে চেষ্টা করুন।", event.threadID, event.messageID);
  }
};
