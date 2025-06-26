// এই কোডটি পুরনো join24 কমান্ডের পারফরম্যান্স সমস্যা সমাধান করে এবং নতুন ফিচার যোগ করে তৈরি করা হয়েছে।
// সবচেয়ে বড় পরিবর্তন হলো, এখন আর প্রতিটি গ্রুপের জন্য আলাদা API কল করা হয় না, ফলে কমান্ডটি প্রায় তাৎক্ষণিকভাবে চলে।
// একটি নতুন Helper ফাংশন কোডকে পরিষ্কার রেখেছে এবং 'reset' কমান্ডের মতো নতুন ফিচার যোগ করা হয়েছে।

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// Helper ফাংশন: কোডের পুনরাবৃত্তি কমাতে এটি তৈরি করা হয়েছে।
// এটি সুন্দরভাবে পেজ তৈরি করে, বার্তা পাঠায় এবং onReply সেট করে।
async function displayPage(api, event, replyData) {
  const {
    groupList,
    page,
    pageSize,
    isSearch = false,
    author
  } = replyData;
  const totalPages = Math.ceil(groupList.length / pageSize);

  // যদি কোনো গ্রুপ না পাওয়া যায়
  if (groupList.length === 0) {
    const message = isSearch ?
      "এই নামে কোনো গ্রুপ খুঁজে পাওয়া যায়নি। 🙁" :
      "দুঃখিত, আমি অ্যাডমিন আছি এমন কোনো গ্রুপ খুঁজে পাওয়া যায়নি।";
    return api.sendMessage(message, event.threadID, event.messageID);
  }

  // বর্তমান পেজের জন্য গ্রুপের তালিকা তৈরি
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageList = groupList.slice(start, end);

  const formattedList = pageList
    .map((g, i) => `${start + i + 1}. ${g.threadName}\n   - ID: ${g.threadID}`)
    .join("\n\n");

  const header = isSearch ? "🔎 সার্চ রেজাল্ট:" : "私が管理者であるグループのリスト 🤖";
  const footerCmds = isSearch ?
    "reset - পুরো তালিকা দেখতে\n[number] - গ্রুপে যোগ দিতে" :
    "search [নাম] - গ্রুপ খুঁজতে\n[number] - গ্রুপে যোগ দিতে";

  const msg =
    `${header}\n\n${formattedList}\n\n` +
    `পেজ ${page} এর ${totalPages}\n` +
    `──────────────────\n` +
    `কমান্ড:\n` +
    `next - পরের পেজ\n` +
    `prev - আগের পেজ\n` +
    `${footerCmds}`;

  const sentMessage = await api.sendMessage(msg, event.threadID, event.messageID);
  global.GoatBot.onReply.set(sentMessage.messageID, {
    commandName: "join24",
    messageID: sentMessage.messageID,
    author: author,
    originalGroupList: replyData.originalGroupList || groupList,
    currentGroupList: groupList,
    page: page,
    pageSize: pageSize,
  });
}

module.exports = {
  config: {
    name: "join24",
    version: "5.0", // পারফরম্যান্স আপগ্রেডের জন্য ভার্সন আপডেট
    author: "Asif Mahmud",
    cooldowns: 5,
    role: 2, // শুধুমাত্র অ্যাডমিনরা ব্যবহার করতে পারবে
    shortDescription: "Join groups where bot is admin",
    longDescription: "View and join other groups where the bot has admin access. Highly optimized version.",
    category: "system", // সিস্টেম ক্যাটাগরিতে রাখা হলো
    guide: {
      en: "{p}join24"
    },
  },

  onStart: async function ({ api, event }) {
    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const botID = api.getCurrentUserID();

      // *** পারফরম্যান্স অপটিমাইজেশন: getThreadList থেকে সরাসরি adminIDs চেক করা হচ্ছে ***
      // এটি শত শত অপ্রয়োজনীয় API কল বন্ধ করে দেয়।
      const threads = await api.getThreadList(500, null, ["INBOX"]);
      const adminGroups = threads.filter(
        (t) =>
        t.isGroup &&
        t.threadID !== event.threadID &&
        t.adminIDs &&
        t.adminIDs.some((admin) => admin.id === botID)
      );

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await displayPage(api, event, {
        groupList: adminGroups,
        page: 1,
        pageSize: 5,
        author: event.senderID,
      });

    } catch (err) {
      console.error("Error in join24 onStart:", err);
      api.sendMessage("❌ কমান্ডটি প্রসেস করার সময় একটি ত্রুটি ঘটেছে।", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const input = event.body.trim().toLowerCase();
    let {
      originalGroupList,
      currentGroupList,
      page,
      pageSize
    } = Reply;
    let newPage = page;
    let newGroupList = currentGroupList;
    let isSearch = false;

    if (input === "next") {
      const totalPages = Math.ceil(currentGroupList.length / pageSize);
      newPage = page >= totalPages ? 1 : page + 1;
    } else if (input === "prev") {
      const totalPages = Math.ceil(currentGroupList.length / pageSize);
      newPage = page <= 1 ? totalPages : page - 1;
    } else if (input.startsWith("search ")) {
      const searchTerm = input.slice(7).trim();
      if (!searchTerm) {
        return api.sendMessage("অনুগ্রহ করে সার্চ করার জন্য কিছু লিখুন।", event.threadID, event.messageID);
      }
      newGroupList = originalGroupList.filter((g) =>
        g.threadName.toLowerCase().includes(searchTerm)
      );
      newPage = 1;
      isSearch = true;
    } else if (input === "reset" || input === "all") {
      newGroupList = originalGroupList;
      newPage = 1;
    } else if (!isNaN(input) && Number(input) > 0) {
      const selectionIndex = parseInt(input, 10);
      const groupIndex = (page - 1) * pageSize + (selectionIndex - (page - 1) * pageSize) - 1;

      if (groupIndex >= 0 && groupIndex < currentGroupList.length) {
        const group = currentGroupList[groupIndex];
        try {
          await api.addUserToGroup(event.senderID, group.threadID);
          return api.sendMessage(`✅ সফলভাবে "${group.threadName}" গ্রুপে যোগ দেওয়া হয়েছে।`, event.threadID, event.messageID);
        } catch (err) {
          return api.sendMessage(
            `❌ "${group.threadName}" গ্রুপে যোগ দিতে সমস্যা হচ্ছে। সম্ভবত আপনি ইতিমধ্যে গ্রুপে আছেন অথবা বটটির অ্যাডমিন ক্ষমতা নেই।`,
            event.threadID,
            event.messageID
          );
        }
      } else {
        return api.sendMessage("❌ ভুল নম্বর। অনুগ্রহ করে তালিকা থেকে একটি সঠিক নম্বর দিন।", event.threadID, event.messageID);
      }
    } else {
      // যদি কোনো কমান্ড না মেলে, তবে কিছুই করা হবে না।
      return;
    }
    
    // পুরোনো রিপ্লাই মেসেজটি আনসেন্ড করে দেওয়া হচ্ছে
    api.unsendMessage(Reply.messageID).catch(err => console.log("Could not unsend message in join24 reply."));

    await displayPage(api, event, {
      groupList: newGroupList,
      page: newPage,
      pageSize: pageSize,
      isSearch: isSearch || (newGroupList.length !== originalGroupList.length), // সার্চ বা রিসেটের জন্য
      author: event.senderID,
      originalGroupList: originalGroupList,
    });
  },
};
