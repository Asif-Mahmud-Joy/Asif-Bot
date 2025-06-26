const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "wl",
    version: "2.0",
    author: "Mr.Smokey{Asif Mahmud}",
    countDown: 5,
    role: 2,
    longDescription: {
      en: "Add, remove, edit whiteListIds",
      bn: "সাদা তালিকার আইডি যুক্ত, মুছে ফেলা এবং সম্পাদনা করুন"
    },
    category: "owner",
    guide: {
      en:
        "   {pn} [add | -a] <uid | @tag>: Add admin role for user" +
        "\n   {pn} [remove | -r] <uid | @tag>: Remove admin role of user" +
        "\n   {pn} [list | -l]: List all admins" +
        "\n   {pn} [on | off]: enable and disable whiteList mode",
      bn:
        "   {pn} [add | -a] <uid | @tag>: ব্যবহারকারীকে এডমিন রোলে যুক্ত করুন" +
        "\n   {pn} [remove | -r] <uid | @tag>: এডমিন রোল থেকে সরান" +
        "\n   {pn} [list | -l]: সব এডমিনের তালিকা দেখুন" +
        "\n   {pn} [on | off]: সাদা তালিকা মোড চালু/বন্ধ করুন"
    }
  },

  langs: {
    en: {
      added: "✅ | Added whiteList role for %1 users:\n%2",
      alreadyAdmin: "\n⚠ | %1 users already have whiteList role:\n%2",
      missingIdAdd: "⚠ | Please enter ID or tag user to add in whiteListIds",
      removed: "✅ | Removed whiteList role of %1 users:\n%2",
      notAdmin: "⚠ | %1 users don't have whiteListIds role:\n%2",
      missingIdRemove: "⚠ | Please enter ID or tag user to remove whiteListIds",
      listAdmin: "👑 | List of whiteListIds:\n%1",
      enable: "✅ Turned on",
      disable: "✅ Turned off"
    },
    bn: {
      added: "✅ | %1 জন ব্যবহারকারী সাদা তালিকায় যুক্ত হয়েছে:\n%2",
      alreadyAdmin: "\n⚠ | %1 জন ইতোমধ্যে সাদা তালিকায় রয়েছে:\n%2",
      missingIdAdd: "⚠ | অনুগ্রহ করে যোগ করতে ID দিন বা কাউকে ট্যাগ করুন",
      removed: "✅ | %1 জন ব্যবহারকারী সাদা তালিকা থেকে সরানো হয়েছে:\n%2",
      notAdmin: "⚠ | %1 জন সাদা তালিকায় নেই:\n%2",
      missingIdRemove: "⚠ | সরাতে ID দিন বা কাউকে ট্যাগ করুন",
      listAdmin: "👑 | সাদা তালিকায় রয়েছে:\n%1",
      enable: "✅ চালু করা হয়েছে",
      disable: "✅ বন্ধ করা হয়েছে"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang, api }) {
    const lang = config.language || "en";
    const t = module.exports.langs[lang];

    switch (args[0]) {
      case "add":
      case "-a": {
        if (!args[1]) return message.reply(t.missingIdAdd);

        let uids = [];
        if (Object.keys(event.mentions).length > 0)
          uids = Object.keys(event.mentions);
        else if (event.messageReply)
          uids.push(event.messageReply.senderID);
        else
          uids = args.filter(arg => !isNaN(arg));

        const notAdminIds = [];
        const adminIds = [];
        for (const uid of uids) {
          if (config.whiteListMode.whiteListIds.includes(uid))
            adminIds.push(uid);
          else
            notAdminIds.push(uid);
        }

        config.whiteListMode.whiteListIds.push(...notAdminIds);
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        const getNames = await Promise.all(
          uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
        );

        return message.reply(
          (notAdminIds.length > 0
            ? t.added.replace("%1", notAdminIds.length).replace("%2", getNames.filter(({ uid }) => notAdminIds.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n"))
            : "") +
            (adminIds.length > 0
              ? t.alreadyAdmin.replace("%1", adminIds.length).replace("%2", getNames.filter(({ uid }) => adminIds.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n"))
              : "")
        );
      }

      case "remove":
      case "-r": {
        if (!args[1]) return message.reply(t.missingIdRemove);

        let uids = [];
        if (Object.keys(event.mentions).length > 0)
          uids = Object.keys(event.mentions);
        else if (event.messageReply)
          uids.push(event.messageReply.senderID);
        else
          uids = args.filter(arg => !isNaN(arg));

        const notAdminIds = [];
        const adminIds = [];
        for (const uid of uids) {
          if (config.whiteListMode.whiteListIds.includes(uid))
            adminIds.push(uid);
          else
            notAdminIds.push(uid);
        }

        for (const uid of adminIds)
          config.whiteListMode.whiteListIds.splice(config.whiteListMode.whiteListIds.indexOf(uid), 1);

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        const getNames = await Promise.all(
          uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
        );

        return message.reply(
          (adminIds.length > 0
            ? t.removed.replace("%1", adminIds.length).replace("%2", getNames.filter(({ uid }) => adminIds.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n"))
            : "") +
            (notAdminIds.length > 0
              ? t.notAdmin.replace("%1", notAdminIds.length).replace("%2", getNames.filter(({ uid }) => notAdminIds.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n"))
              : "")
        );
      }

      case "list":
      case "-l": {
        const getNames = await Promise.all(
          config.whiteListMode.whiteListIds.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`))
        );
        return message.reply(t.listAdmin.replace("%1", getNames.join("\n")));
      }

      case "on": {
        config.whiteListMode.enable = true;
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(t.enable);
      }

      case "off": {
        config.whiteListMode.enable = false;
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(t.disable);
      }

      default:
        return message.reply("❌ Invalid command format.");
    }
  }
};
