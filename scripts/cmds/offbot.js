module.exports = {
  config: {
    name: "offbot",
    version: "1.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 45,
    role: 2,
    shortDescription: "📴 Bot bondho korun",
    longDescription: "Ei command diye bot ke shutdown kora jay.",
    category: "owner",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const shutdownMessage = `╔════ஜ۩۞۩ஜ═══╗\n\n📴 𝗠𝗿.𝗦𝗺𝗼𝗸𝗲𝘆 𝗕𝗼𝘁 𝗢𝗳𝗳 𝗠𝗼𝗱𝗲\n🚫 𝗦𝗲𝗿𝘃𝗲𝗿 𝗔𝗿𝗰𝗵𝗶𝘃𝗲 𝗦𝗬𝗦𝗧𝗘𝗠 𝗧𝗲𝗿𝗺𝗶𝗻𝗮𝘁𝗲𝗱\n\n📢 𝗚𝗼𝗼𝗱 𝗡𝗶𝗴𝗵𝘁, 𝗕𝗼𝘁 𝗕𝗼𝘀𝘀!\n\n╚════ஜ۩۞۩ஜ═══╝`;

      await api.sendMessage(shutdownMessage, event.threadID, () => process.exit(0));
    } catch (error) {
      console.error("[❌ BOT OFF ERROR]", error);
      return api.sendMessage("❌ Bot off korar somoy somossa hoise.", event.threadID);
    }
  }
};
