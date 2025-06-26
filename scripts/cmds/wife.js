module.exports = {
  config: {
    name: "wife",
    version: "1.1",
    author: "Mr.Smokey{Asif Mahmud}",
    countDown: 5,
    role: 0,
    shortDescription: "auto reply to special message",
    longDescription: "Responds when someone says 'Asif's wifey' with a customized message.",
    category: "no prefix",
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    const trigger = "asif's wifey";
    if (event.body && event.body.toLowerCase() === trigger) {
      return message.reply({
        body:
          "╭───────────────⊹⊱❖⊰⊹───────────────╮\n" +
          "         💞 𝐀𝐬𝐢𝐟'𝐬 𝐖𝐢𝐟𝐞𝐲 💞\n" +
          "╰───────────────⊹⊱❖⊰⊹───────────────╯\n\n" +
          "💫 Hey hey! Dekho ke aise cute cute ashe —\n" +
          "🦋 Mr. Smokey'r sundor little princess ✨\n\n" +
          "───────────────✧───────────────\n" +
          "🤖 Bot: 𝐒𝐦𝐨𝐤𝐞𝐲𝐁𝐨𝐭 🔥",

        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/tPzzqVl.mp4")
      });
    }
  }
};
