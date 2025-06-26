const os = require("os");

module.exports = {
  config: {
    name: "ping",
    aliases: ["ms"],
    version: "1.1-ultra",
    author: "✨ [Asif Mahmud] ✨",
    role: 0,
    shortDescription: {
      en: "Check bot's ping and system health",
      bn: "বটের পিং এবং সিস্টেম অবস্থা চেক করুন"
    },
    longDescription: {
      en: "Displays current bot response ping and system performance info.",
      bn: "বর্তমান বট পিং এবং সিস্টেম পারফরম্যান্স তথ্য দেখায়।"
    },
    category: "system",
    guide: {
      en: "Use {p}ping to check bot's ping & system status.",
      bn: "ব্যবহার করুন {p}ping বটের পিং ও সিস্টেম অবস্থা দেখার জন্য।"
    }
  },

  onStart: async function ({ api, event }) {
    const timeStart = Date.now();
    await api.sendMessage("⏱ Checking bot's ping...", event.threadID);
    const ping = Date.now() - timeStart;

    // System Info
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);
    const platform = os.platform();
    const uptime = (os.uptime() / 60).toFixed(2);

    const msg = `📶 Bot Ping: ${ping}ms
🧠 RAM Usage: ${usedMem}MB / ${totalMem}MB
🛠 OS: ${platform}
⏳ Uptime: ${uptime} mins`;

    api.sendMessage(msg, event.threadID);
  }
};
