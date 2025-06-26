// এই কোডটি পুরনো shadow কমান্ডের অদক্ষতা এবং দুর্বলতাগুলো সমাধান করে তৈরি করা হয়েছে।
// এটি এখন একটি পূর্ণাঙ্গ সিস্টেম ইনফরমেশন কমান্ড, যা ডায়নামিক তথ্য (Uptime, RAM) দেখায়।
// মূল কার্যকারিতা onStart-এ منتقل করা হয়েছে এবং onChat ট্রিগারটিও আরও দক্ষতার সাথে রাখা হয়েছে।

const axios = require("axios");

// ডায়নামিক তথ্য এবং ভিডিও পাঠানোর মূল ফাংশন
async function sendSystemInfo(api, event) {
  try {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    // --- ডায়নামিক সিস্টেম তথ্য সংগ্রহ ---

    // 1. Uptime கணக்கிடுதல்
    const uptimeInSeconds = process.uptime();
    const days = Math.floor(uptimeInSeconds / (3600 * 24));
    const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);
    const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    // 2. RAM ব্যবহার கணக்கிடுதல்
    const ramUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + " MB";

    // 3. গ্রুপের সংখ্যা গণনা
    const threads = await api.getThreadList(200, null, ["INBOX"]);
    const groupCount = threads.filter(t => t.isGroup).length;
    const userCount = (await api.getAllUserID()).length;


    // তথ্যের মেসেজ তৈরি
    const systemInfoBody = `
» BOT OWNER : 𝗔𝗦𝗜𝗙 𝗠𝗔𝗛𝗠𝗨𝗗
» BOT NAME : 𝗔𝗧𝗢𝗠𝗜𝗖 
» BOT VERSION : V-4.0
» BOT PREFIX : [ ${global.GoatBot.config.prefix} ]
» BOT UPTIME : ${uptimeFormatted}
» TOTAL GROUPS : [ ${groupCount} ]
» TOTAL USERS : [ ${userCount} ]
» CPU USAGE : SOON
» RAM USAGE : ${ramUsage}

● MADE BY 𝗔𝗦𝗜𝗙 ●
    `;

    // ভিডিও ডাউনলোড করার চেষ্টা
    let videoAttachment;
    try {
      const videoUrl = "https://files.catbox.moe/pm6rfq.mp4";
      const response = await axios.get(videoUrl, {
        responseType: "stream"
      });
      videoAttachment = response.data;
    } catch (videoError) {
      console.error("SHADOW CMD - VIDEO ERROR:", videoError.message);
      videoAttachment = null; // ভিডিও ডাউনলোড না হলে null সেট করা হলো
    }

    const messagePayload = {
      body: systemInfoBody,
    };

    if (videoAttachment) {
      messagePayload.attachment = videoAttachment;
    } else {
      // যদি ভিডিও না পাওয়া যায়, তবে ব্যবহারকারীকে জানানো
      messagePayload.body += "\n\n(দুঃখিত, সিস্টেম ভিডিওটি এই মুহূর্তে লোড করা যাচ্ছে না।)";
    }

    await api.sendMessage(messagePayload, event.threadID, event.messageID);
    api.setMessageReaction("✅", event.messageID, () => {}, true);

  } catch (err) {
    console.error("SHADOW CMD - GENERAL ERROR:", err);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    api.sendMessage("❌ সিস্টেমের তথ্য দেখাতে একটি সমস্যা হয়েছে।", event.threadID);
  }
}


module.exports = {
  config: {
    name: "shadow",
    version: "5.0", // ভার্সন আপগ্রেড
    author: "Asif Mahmud",
    cooldowns: 10, // পুনরায় ব্যবহার করার জন্য ডিলে বাড়ানো হয়েছে
    role: 0,
    shortDescription: "Shows dynamic system info",
    longDescription: "Shows dynamic bot information like uptime, RAM usage, etc., with a video.",
    category: "system",
    guide: {
      en: "{p}shadow (or type 'atomic')"
    },
  },

  // {p}shadow কমান্ডের জন্য onStart ফাংশন
  onStart: async function ({ api, event }) {
    await sendSystemInfo(api, event);
  },

  // 'atomic' ট্রিগারের জন্য onChat ফাংশন
  onChat: async function ({ api, event }) {
    // শুধু 'atomic' লিখলেই কাজ করবে, অন্যথায় কিছুই করবে না
    if (event.body?.toLowerCase().trim() === "atomic") {
      await sendSystemInfo(api, event);
    }
  },
};
