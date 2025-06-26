module.exports = {
  config: {
    name: "topexp",
    version: "1.2",
    author: "Mr.Smokey[Asif Mahmud]",
    role: 0,
    shortDescription: {
      en: "Top 10 Exp users",
      bn: "Top 10 অভিজ্ঞতা ইউজার"
    },
    longDescription: {
      en: "Shows top 10 users with highest experience points.",
      bn: "শীর্ষ ১০ জন ইউজার যারা সবচেয়ে বেশি অভিজ্ঞতা পেয়েছে তাদের তালিকা দেখায়।"
    },
    category: "group",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  langs: {
    en: {
      noExpUsers: "There are no users with experience points.",
      headerText: "\ud83c\udfc6 Top 10 EXP Users \ud83c\udfc6"
    },
    bn: {
      noExpUsers: "কোনো ইউজারের অভিজ্ঞতা পয়েন্ট নেই।",
      headerText: "\ud83c\udfc6 শীর্ষ ১০ অভিজ্ঞতা ইউজার \ud83c\udfc6"
    }
  },

  onStart: async function ({ api, args, message, event, usersData, getLang }) {
    try {
      const allUsers = await usersData.getAll();
      const usersWithExp = allUsers.filter(user => user.exp && user.exp > 0);

      if (usersWithExp.length < 1) {
        return message.reply(getLang("noExpUsers"));
      }

      const topExp = usersWithExp.sort((a, b) => b.exp - a.exp).slice(0, 10);
      const topUsersList = topExp.map((user, index) => `${index + 1}. ${user.name || "Unknown"}: ${user.exp} EXP`);

      const threadLang = (await api.getThreadInfo(event.threadID)).data?.lang || "en";
      const lang = ["bn", "en"].includes(threadLang) ? threadLang : "en";
      const headerText = this.langs[lang].headerText;

      const messageText = `${headerText}:
${topUsersList.join("\n")}`;

      message.reply(messageText);
    } catch (err) {
      console.error("[topexp error]", err);
      return message.reply("❌ Something went wrong while fetching EXP data.");
    }
  }
};
