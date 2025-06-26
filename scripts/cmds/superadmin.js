const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
  config: {
    name: "superadmin",
    aliases: ["superadminonly", "owner"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 3,
    shortDescription: "🔒 Enable/Disable SuperAdmin-only mode",
    longDescription: "Toggle the bot to respond to only SuperAdmins/Owners or all users.",
    category: "owner",
    guide: "{pn} on | off"
  },

  onStart: function ({ args, message }) {
    if (!args[0]) {
      return message.reply("🛠️ Use this command like: superadmin on/off");
    }

    const input = args[0].toLowerCase();

    if (input === "on") {
      config.adminOnly = true;
      fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
      message.reply("✅ SuperAdmin mode ON: Bot will now respond only to owners.");
    } else if (input === "off") {
      config.adminOnly = false;
      fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
      message.reply("🔓 SuperAdmin mode OFF: Bot is open to all users now.");
    } else {
      message.reply("❌ Invalid option. Use 'on' or 'off'");
    }
  }
};
