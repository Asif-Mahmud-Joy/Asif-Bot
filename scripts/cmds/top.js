module.exports = {
  config: {
    name: "top",
    version: "1.1",
    author: "Mr.Smokey[Asif Mahmud]",
    role: 0,
    shortDescription: {
      en: "Top 15 Rich Users",
      bn: "শীর্ষ ১৫ জন ধনী ব্যবহারকারী",
      ban: "Top 15 Dhoni Userder Talika"
    },
    longDescription: {
      en: "Shows the top 15 richest users based on their money.",
      bn: "টাকার পরিমাণ অনুযায়ী শীর্ষ ১৫ জন ধনী ব্যবহারকারীদের তালিকা প্রদর্শন করে।",
      ban: "Takar poriman onujayi top 15 userder dekhanor jonno."
    },
    category: "group",
    guide: {
      en: "{pn} - Displays the top 15 richest users",
      bn: "{pn} - শীর্ষ ১৫ জন ধনী ব্যবহারকারীর তালিকা দেখাবে",
      ban: "{pn} - Top 15 Dhoni user dekhanor command"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    try {
      const allUsers = await usersData.getAll();

      if (!Array.isArray(allUsers) || allUsers.length === 0) {
        return message.reply("No user data found. Kono user data pawa jai nai.");
      }

      const validUsers = allUsers.filter(user => user.name && typeof user.money === 'number');

      const topUsers = validUsers.sort((a, b) => b.money - a.money).slice(0, 15);

      const topUsersList = topUsers.map((user, index) => `${index + 1}. ${user.name}: ${user.money.toLocaleString()}`);

      const messageText = `\u{1F3C6} Top 15 Richest Users:\nশীর্ষ ১৫ জন ধনী ব্যবহারকারী:\nTop 15 Dhoni Userder Talika:\n\n${topUsersList.join('\n')}`;

      return message.reply(messageText);
    } catch (error) {
      console.error("Error fetching top users:", error);
      return message.reply("❌ An error occurred while fetching the top users. Samossa hoise data nite giye.");
    }
  }
};
