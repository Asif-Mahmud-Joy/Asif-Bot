module.exports = {
  config: {
    name: "membercount",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Đếm thành viên nhóm",
      en: "Count group members",
      bn: "গ্রুপে কয়জন সদস্য আছে দেখাও"
    },
    longDescription: {
      vi: "Xem số lượng thành viên trong nhóm",
      en: "View the number of members in the group",
      bn: "গ্রুপের মোট সদস্য সংখ্যা দেখাও"
    },
    category: "box chat",
    guide: {
      vi: "{pn}: dùng để xem số lượng thành viên trong nhóm",
      en: "{pn}: used to view the number of members in the group",
      bn: "{pn}: গ্রুপের সদস্য সংখ্যা দেখতে ব্যবহার করুন"
    }
  },

  langs: {
    vi: {
      count: "Số lượng thành viên trong nhóm là:",
    },
    en: {
      count: "Number of members in the group:",
    },
    bn: {
      count: "গ্রুপে মোট সদস্য আছে:"  
    }
  },

  onStart: async function ({ threadsData, message, event, getLang, languageCode }) {
    const { threadID } = event;
    try {
      const threadData = await threadsData.get(threadID);
      const members = threadData?.members || [];
      const memberCount = members.length;
      message.reply(`${getLang("count")} ${memberCount}`);
    } catch (error) {
      console.error("Error fetching member count:", error);
      message.reply("❌ | Member count fetch korte somossa hoise.");
    }
  },

  onChat: async ({ threadsData, event, api }) => {
    const { senderID, threadID } = event;
    try {
      const threadData = await threadsData.get(threadID);
      let members = threadData?.members || [];

      const alreadyExists = members.some(m => m.userID === senderID);
      if (!alreadyExists) {
        const userInfo = await api.getUserInfo(senderID);
        const name = userInfo[senderID]?.name || "Unknown";

        members.push({ userID: senderID, name });
        await threadsData.set(threadID, members, "members");
      }
    } catch (e) {
      console.error("Error updating member data:", e);
    }
  }
};
