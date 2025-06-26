// ✅ This is a clean version of your VIP API with necessary structure
// ✅ Only essential modules and methods retained, rest removed as requested

const header = `👑 𝗔𝗦𝗜𝗙 𝗩𝗜𝗣 𝗨𝗦𝗘𝗥𝗦 👑`;
const fs = require("fs");

const vipFilePath = "vip.json";
const changelogFilePath = "changelog.json";

function loadJSON(path) {
  try {
    const data = fs.readFileSync(path);
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error loading file ${path}:`, err);
    return {};
  }
}

function saveJSON(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error saving file ${path}:`, err);
  }
}

module.exports = {
  config: {
    name: "vip",
    version: "1.5-pro",
    author: "Mr.Smokey[Asif Mahmud]",
    role: 2,
    category: "Config",
    guide: {
      en: `VIP Commands:
!vip add <uid>
!vip rm <uid>
!vip list
!vip changelog`,
      bn: `VIP কমান্ড:
!vip add <uid>
!vip rm <uid>
!vip list
!vip changelog`
    },
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const subcommand = args[0];
    const vipData = loadJSON(vipFilePath);

    if (!subcommand) {
      return message.reply(`${header}\n⚠️ কমান্ড দাও!`);
    }

    switch (subcommand) {
      case "add": {
        const uid = args[1];
        if (!uid) return message.reply(`${header}\n🔢 UID দাও!`);

        const user = await usersData.get(uid);
        if (!user) return message.reply(`${header}\n❌ ইউজার পাওয়া যায় নাই!`);

        vipData[uid] = { addedAt: new Date().toISOString() };
        saveJSON(vipFilePath, vipData);

        message.reply(`${header}\n✅ ${user.name} (${uid}) VIP হইছে!`);
        api.sendMessage(`${header}\n🎉 ${user.name}, আপনি VIP হয়েছেন!`, uid);

        for (const vid of Object.keys(vipData)) {
          if (vid !== uid) {
            const vuser = await usersData.get(vid);
            if (vuser) {
              api.sendMessage(`${header}\n📢 ${user.name} (${uid}) আমাদের নতুন VIP!`, vid);
            }
          }
        }
        break;
      }

      case "rm": {
        const uid = args[1];
        if (!uid || !vipData[uid]) return message.reply(`${header}\n❌ UID ঠিক নাই!`);

        const user = await usersData.get(uid);
        delete vipData[uid];
        saveJSON(vipFilePath, vipData);

        message.reply(`${header}\n❌ ${user?.name || uid} VIP থেকে বাদ হইছে!`);
        api.sendMessage(`${header}\n😢 ${user?.name || uid}, আপনার VIP শেষ!`, uid);

        for (const vid of Object.keys(vipData)) {
          const vuser = await usersData.get(vid);
          if (vuser) {
            api.sendMessage(`${header}\n📣 ${user?.name || uid} আর VIP নাই!`, vid);
          }
        }
        break;
      }

      case "list": {
        const list = await Promise.all(Object.keys(vipData).map(async uid => {
          const user = await usersData.get(uid);
          return `👑 ${user?.name || "Unknown"} (${uid})`;
        }));

        message.reply(`${header}\n📋 VIP লিস্ট:\n\n${list.join("\n") || "কেউ VIP নাই!"}`);
        break;
      }

      case "changelog": {
        const log = loadJSON(changelogFilePath);
        const show = Object.entries(log).filter(([v]) => parseFloat(v) >= 1.0);
        const result = show.map(([v, desc]) => `🔸 ভার্সন ${v}: ${desc}`).join("\n");

        message.reply(`${header}\n📌 বর্তমান ভার্সন: ${module.exports.config.version}\n\n${result || "কোন আপডেট নাই!"}`);
        break;
      }

      default:
        message.reply(`${header}\n❓ কমান্ড ঠিকমতো দাও ভাই!`);
    }
  }
};
