// ✅ GoatBot-compatible Quiz Command
// 🔄 Fixed API calls, error handling, and category checking
// 🔤 English + Banglish support added

const axios = require('axios');

module.exports = {
  config: {
    name: "quiz",
    aliases: [],
    version: "2.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 2,
    role: 0,
    shortDescription: {
      en: "Game to earn money and IQ boost",
      bn: "বুদ্ধির খেলা, IQ আর ইনকাম দুটোই বাড়াবে"
    },
    category: "games",
    guide: {
      en: "{pn} <category> | {pn} rank | {pn} leaderboard",
      bn: "{pn} <বিভাগ> | {pn} rank | {pn} leaderboard"
    },
    envConfig: {
      reward: 0
    }
  },

  onStart: async function ({ message, event, usersData, commandName, args, api }) {
    const prefix = global.utils.getPrefix(event.threadID);
    const senderID = event.senderID;

    // Help Message
    if (!args[0]) {
      return message.reply(`📚 Category lagbe bhai 😅

📌 Available:
english, math, physics, chemistry, history, philosophy, filipino, science, biology, random

🖼️ With Image:
anime, country

✅ TORF (True/False) er jonno:
${prefix}quiz torf

🏆 Rank check:
${prefix}quiz rank
📊 Leaderboard dekhte:
${prefix}quiz leaderboard

🎯 Example: ${prefix}quiz math`);
    }

    // Rank
    if (args[0].toLowerCase() === "rank") {
      try {
        const res = await axios.get("https://api-test.yourboss12.repl.co/api/quiz/quiz/all");
        const all = res.data;
        all.sort((a, b) => b.correct - a.correct);
        const found = all.findIndex(u => u.playerid === senderID);
        if (found === -1) return message.reply("🙁 You don't have a rank yet!");
        const me = all[found];
        const name = (await usersData.get(senderID)).name;
        return message.reply(`🏆 Rank: ${found + 1}
👤 Name: ${name}
✅ Correct: ${me.correct}
❌ Wrong: ${me.wrong}
🎮 Total: ${me.correct + me.wrong}`);
      } catch (err) {
        console.error("[QUIZ RANK ERROR]", err);
        return message.reply("❌ Rank data load korte somossa hoise");
      }
    }

    // Leaderboard
    if (args[0].toLowerCase() === "leaderboard") {
      try {
        const res = await axios.get("https://api-test.yourboss12.repl.co/api/quiz/quiz/all");
        const all = res.data;
        all.sort((a, b) => b.correct - a.correct);

        const page = parseInt(args[1]) || 1;
        const start = (page - 1) * 5;
        const end = start + 5;
        const list = all.slice(start, end);

        let msg = `📊 Quiz Leaderboard (Page ${page})\n=========================`;
        for (let i = 0; i < list.length; i++) {
          const user = list[i];
          const name = (await usersData.get(user.playerid)).name;
          msg += `\n#${start + i + 1}. ${name}\n✅ Correct: ${user.correct}\n❌ Wrong: ${user.wrong}`;
        }
        msg += `\n=========================\nTotal: ${all.length} Players\nUse ${prefix}quiz leaderboard <page>`;
        return message.reply(msg);
      } catch (err) {
        console.error("[QUIZ LEADERBOARD ERROR]", err);
        return message.reply("❌ Leaderboard load korte somossa hoise");
      }
    }

    // True or False (torf)
    if (args[0].toLowerCase() === "torf") {
      try {
        const res = await axios.get("https://api-test.yourboss12.repl.co/apiv2/quiz");
        const q = res.data;
        const msg = await message.reply(`${q.question}\n\n😆 = true | 😮 = false`);
        global.GoatBot.onReaction.set(msg.messageID, {
          commandName,
          author: senderID,
          question: q.question,
          answer: q.answer === "true" ? "😆" : "😮"
        });
        setTimeout(() => api.unsendMessage(msg.messageID), 20000);
      } catch (err) {
        console.error("[TORF ERROR]", err);
        return message.reply("❌ Quiz load korte problem");
      }
      return;
    }

    // Anime/Country (image based)
    if (["anime", "country"].includes(args[0].toLowerCase())) {
      try {
        const res = await axios.get(`https://api-test.yourboss12.repl.co/apiv2/aniquiz?category=${args[0]}`);
        const data = res.data;
        const attachment = await global.utils.getStreamFromURL(data.link);
        const msg = await message.reply({
          body: `${data.question}\n\n📝 Reply this message with the answer!`,
          attachment
        });
        global.GoatBot.onReply.set(msg.messageID, {
          commandName,
          author: senderID,
          answer: data.answer
        });
        setTimeout(() => api.unsendMessage(msg.messageID), 30000);
      } catch (err) {
        console.error("[IMG QUIZ ERROR]", err);
        return message.reply("❌ Image quiz load korte somossa hoise");
      }
      return;
    }

    // Category-based text question
    const categories = ["english", "math", "physics", "chemistry", "history", "philosophy", "filipino", "science", "biology", "random"];
    const cat = args[0].toLowerCase();
    if (!categories.includes(cat)) {
      return message.reply(`❌ Invalid category.
✅ Available: ${categories.join(", ")}`);
    }
    try {
      const res = await axios.get(`https://api-test.yourboss12.repl.co/api/quiz/q?category=${cat}`);
      const data = res.data;
      const qlines = data.question.split("\n");
      const question = qlines[0];
      const choices = qlines.slice(1).join("\n");

      const msg = await message.reply(`📖 ${question}\n\n${choices}\n\n📝 Reply this message with the correct option letter.`);
      global.GoatBot.onReply.set(msg.messageID, {
        commandName,
        author: senderID,
        answer: data.answer.trim().toLowerCase()
      });
      setTimeout(() => api.unsendMessage(msg.messageID), 30000);
    } catch (err) {
      console.error("[CATEGORY QUIZ ERROR]", err);
      return message.reply("❌ Quiz load korte somossa hoise");
    }
  }
};
