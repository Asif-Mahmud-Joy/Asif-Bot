const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "admin",
    version: "3.0",
    author: "Asif",
    countDown: 5,
    role: 0,
    description: "Add/remove bot admin",
    category: "admin",
    guide: {
      en: "{pn} [add | -a] <uid | @tag | reply>\n{pn} [remove | rm | delete] <uid | @tag | reply>\n{pn} [list | all]"
    }
  },

  langs: {
    en: {
      added: "✅ Added %1 user(s) as admin:\n\n%2",
      alreadyAdmin: "⚠️ These %1 user(s) are already admin:\n\n%2",
      removed: "✅ Removed admin role from %1 user(s):\n\n%2",
      notAdmin: "⚠️ These %1 user(s) were not admin:\n\n%2",
      list: "👑 Bot Admin List:\n\n%1",
      missing: "⚠️ Please tag, reply, or provide UID!",
      noPermission: "⛔ You don't have permission to use this command."
    }
  },

  onStart: async function ({ args, message, event, usersData, role, getLang }) {
    const configPath = global.client.dirConfig;
    const config = require(configPath);
    const adminList = config.adminBot || [];

    if (role != 2)
      return message.reply(getLang("noPermission"));

    const input = args[0];
    const mentionIDs = Object.keys(event.mentions);
    let uids = [];

    if (mentionIDs.length > 0)
      uids = mentionIDs;
    else if (event.messageReply)
      uids = [event.messageReply.senderID];
    else
      uids = args.slice(1).filter(arg => /^\d+$/.test(arg));

    if (!input || (["add", "-a", "remove", "rm", "delete"].includes(input) && uids.length == 0))
      return message.reply(getLang("missing"));

    switch (input) {
      case "add":
      case "-a": {
        const added = [], already = [];

        for (const uid of uids) {
          if (adminList.includes(uid)) already.push(uid);
          else adminList.push(uid), added.push(uid);
        }

        config.adminBot = adminList;
        writeFileSync(configPath, JSON.stringify(config, null, 2));

        const nameList = await Promise.all(added.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));
        const alreadyList = await Promise.all(already.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));

        return message.reply(
          (added.length ? getLang("added", added.length, nameList.join("\n")) + "\n" : "") +
          (already.length ? getLang("alreadyAdmin", already.length, alreadyList.join("\n")) : "")
        );
      }

      case "remove":
      case "rm":
      case "delete": {
        const removed = [], notAdmin = [];

        for (const uid of uids) {
          if (adminList.includes(uid)) {
            adminList.splice(adminList.indexOf(uid), 1);
            removed.push(uid);
          } else {
            notAdmin.push(uid);
          }
        }

        config.adminBot = adminList;
        writeFileSync(configPath, JSON.stringify(config, null, 2));

        const removedNames = await Promise.all(removed.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));
        const notAdminNames = await Promise.all(notAdmin.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));

        return message.reply(
          (removed.length ? getLang("removed", removed.length, removedNames.join("\n")) + "\n" : "") +
          (notAdmin.length ? getLang("notAdmin", notAdmin.length, notAdminNames.join("\n")) : "")
        );
      }

      case "list":
      case "all": {
        const names = await Promise.all(adminList.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));
        return message.reply(getLang("list", names.join("\n")));
      }

      default:
        return message.reply(getLang("missing"));
    }
  }
};
