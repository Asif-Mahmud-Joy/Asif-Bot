const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "datetime",
    aliases: ["bdtime", "datetimebd"],
    version: "1.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 1,
    role: 0,
    shortDescription: "🇧🇩 Show current date and time in Bangladesh",
    longDescription: "Displays current date and time in Bangladesh (Gregorian).",
    category: "utility",
    guide: "{pn}datetime"
  },

  onStart: async function ({ message }) {
    try {
      // Bangladesh time
      const bdTime = moment.tz("Asia/Dhaka");
      const bdDateTime = bdTime.format("dddd, DD MMMM YYYY");
      const bdClock = bdTime.format("hh:mm:ss A");

      const msg = `🕒 *Bangladesh Time Info*

` +
                  `🇧🇩 *Bangladesh*
` +
                  `   🗓️ *Date:* ${bdDateTime}
` +
                  `   🕘 *Time:* ${bdClock}`;

      message.reply(msg);
    } catch (err) {
      console.error(err);
      message.reply("❌ | Error fetching date & time data. Try again later.");
    }
  }
};
