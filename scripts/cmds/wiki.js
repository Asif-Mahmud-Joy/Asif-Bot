const axios = require('axios');
const fs = require("fs-extra");
const wiki = require("wikijs").default;

module.exports = {
  config: {
    name: "wiki",
    aliases: ["wiki"],
    version: "2.1",
    author: "Mr.Smokey{Asif Mahmud}",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Search on Wikipedia",
      bn: "উইকিপিডিয়া থেকে খুঁজুন"
    },
    longDescription: {
      en: "Get summary information from Wikipedia using keywords.",
      bn: "কীওয়ার্ড ব্যবহার করে উইকিপিডিয়া থেকে সারাংশ তথ্য পান।"
    },
    category: "study",
    guide: {
      vi: "{pn} text",
      en: "{pn} text",
      bn: "{pn} বিষয়বস্তু"
    }
  },

  langs: {
    en: {
      missingInput: "❌ | Please enter a topic to search.",
      notFound: "❌ | Page not found for:",
    },
    bn: {
      missingInput: "❌ | অনুগ্রহ করে একটি বিষয়ে অনুসন্ধান করুন।",
      notFound: "❌ | এই বিষয়ে কোনো পৃষ্ঠা পাওয়া যায়নি:"
    }
  },

  onStart: async function ({ api, event, args, message, getLang }) {
    let content = args.join(" ");
    let url = 'https://en.wikipedia.org/w/api.php';

    if (!content) return message.reply(getLang("missingInput"));

    // Language override (currently only English and Bangla Wikipedia supported in API)
    if (args[0] === "en") {
      url = 'https://en.wikipedia.org/w/api.php';
      content = args.slice(1).join(" ");
    } else if (args[0] === "bn") {
      url = 'https://bn.wikipedia.org/w/api.php';
      content = args.slice(1).join(" ");
    }

    if (!content) return message.reply(getLang("missingInput"));

    return wiki({ apiUrl: url })
      .page(content)
      .catch(() => message.reply(`${getLang("notFound")} ${content}`))
      .then(page => {
        if (!page) return;
        return page.summary().then(summary => {
          if (summary.length > 2000) summary = summary.slice(0, 1990) + '...';
          return message.reply(summary);
        });
      });
  }
};
