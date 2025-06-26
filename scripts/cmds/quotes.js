module.exports = {
  config: {
    name: "quotes",
    author: "Asif Mahmud",
    version: "1.0",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Get a random quote in English or Bangla (offline)",
      bn: "অফলাইনে ইংরেজি অথবা বাংলা এলোমেলো কোটস নিন",
    },
    guide: {
      en: "{pn}",
      bn: "{pn}",
    },
  },

  onStart: async function ({ api, event }) {
    const quotesDB = {
      en: [
        "Life is what happens when you're busy making other plans.|John Lennon",
        "To live is the rarest thing in the world. Most people exist, that is all.|Oscar Wilde",
        "The purpose of our lives is to be happy.|Dalai Lama",
        "Love all, trust a few, do wrong to none.|William Shakespeare",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.|Winston Churchill",
        "Happiness depends upon ourselves.|Aristotle",
        "Courage is resistance to fear, mastery of fear—not absence of fear.|Mark Twain",
        "Don't watch the clock; do what it does. Keep going.|Sam Levenson",
        "Where there is love there is life.|Mahatma Gandhi",
        "You cannot swim for new horizons until you have courage to lose sight of the shore.|William Faulkner",
        "For every minute you are angry you lose sixty seconds of happiness.|Ralph Waldo Emerson",
        "Turn your wounds into wisdom.|Oprah Winfrey",
        "Being deeply loved gives you strength, while loving deeply gives you courage.|Lao Tzu",
        "The road to success and the road to failure are almost exactly the same.|Colin R. Davis",
        "The most important thing is to enjoy your life—to be happy—it's all that matters.|Audrey Hepburn",
        "Courage doesn’t always roar. Sometimes courage is the quiet voice at the end of the day saying, ‘I will try again tomorrow.’|Mary Anne Radmacher",
      ],
      bn: [
        "জীবন হল সেই সময় যা তুমি অন্য পরিকল্পনা করার ব্যস্ততায় কাটাও।|জন লেনন",
        "জীবন যাপন করা পৃথিবীর সবচেয়ে বিরল জিনিস। বেশিরভাগ মানুষ শুধু অস্তিত্বে থাকে।|অস্কার ওয়াইল্ড",
        "আমাদের জীবনের উদ্দেশ্য হল সুখী হওয়া।|দলাই লামা",
        "সবাইকে ভালোবাসো, কজনকে বিশ্বাস করো, কাউকে আঘাত দিও না।|উইলিয়াম শেক্সপিয়ার",
        "সাফল্য চূড়ান্ত নয়, ব্যর্থতা মারাত্মক নয়: যা গুরুত্বপূর্ণ তা হল চালিয়ে যাওয়ার সাহস।|উইনস্টন চার্চিল",
        "সুখ আমাদের নিজের উপর নির্ভর করে।|অ্যারিস্টটল",
        "সাহস মানে ভয়কে প্রতিহত করা, ভয়কে নিয়ন্ত্রণ করা — ভয়হীন হওয়া নয়।|মার্ক টোয়েন",
        "ঘড়ি দেখে বসো না; যা করে, তুমি ওটাই করো। চালিয়ে যাও।|স্যাম লেভেনসন",
        "যেখানে ভালোবাসা আছে, সেখানে জীবন আছে।|মহাত্মা গান্ধী",
        "তুমি তীর থেকে দৃষ্টিভঙ্গি হারানো পর্যন্ত নতুন দিগন্তে সাঁতার কাটতে পারবে না।|উইলিয়াম ফকনার",
        "প্রতিটি মিনিট তুমি রেগে থাকো, তুমি ষাট সেকেন্ড সুখ হারাও।|রালফ ওয়ালডো এমারসন",
        "তোমার ঘা গুলোকে জ্ঞানে পরিণত করো।|ওপরা উইনফ্রে",
        "গভীর ভালোবাসা তোমাকে শক্তি দেয়, আর গভীর ভালোবাসা তোমাকে সাহস দেয়।|লাও জু",
        "সাফল্যের পথ আর ব্যর্থতার পথ প্রায় একই।|কলিন আর. ডেভিস",
        "সবচেয়ে গুরুত্বপূর্ণ হলো তোমার জীবন উপভোগ করা — সুখী হওয়া — এটাই সবচেয়ে জরুরি।|অড্রে হেপবার্ন",
        "সাহস সবসময় গর্জন করে না। কখনো কখনো সাহস হলো দিনের শেষে নীরব কণ্ঠ যা বলে, ‘আমি কাল আবার চেষ্টা করব।’|মেরি অ্যানে র‍্যাডমাচার",
      ],
    };

    try {
      // Pick random language: 'en' or 'bn'
      const langs = ["en", "bn"];
      const lang = langs[Math.floor(Math.random() * langs.length)];

      const langQuotes = quotesDB[lang];
      const randomIndex = Math.floor(Math.random() * langQuotes.length);
      const [quoteText, quoteAuthor] = langQuotes[randomIndex].split("|");

      const message = `🧠 "${quoteText}"\n\n— ✍️ ${quoteAuthor}`;

      return api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
      console.error("[QUOTE ERROR]", error);
      return api.sendMessage(
        "❌ There was an error getting the quote. Please try again.",
        event.threadID,
        event.messageID
      );
    }
  },
};
