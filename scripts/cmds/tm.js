const { TempMail } = require("1secmail-api");

function generateRandomId(length = 6) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';
  for (let i = 0; i < length; i++) {
    randomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomId;
}

module.exports = {
  config: {
    name: 'tm',
    version: '2.3.0',
    author: "Mr.Smokey[Asif Mahmud]", // do not change credits
    countDown: 5,
    role: 0,
    shortDescription: {
      en: 'Generate temporary email (auto get inbox)',
      bn: 'অস্থায়ী ইমেইল তৈরি করুন (স্বয়ংক্রিয় ইনবক্স)',
      ban: 'Ekta temporary email toiri koren (auto inbox dekhanor jonno)'
    },
    category: 'generate',
    guide: {
      en: '[tempmail] - Generates a temporary email and checks inbox automatically.',
      bn: '[tempmail] - একটি অস্থায়ী ইমেইল তৈরি করে এবং ইনবক্স স্বয়ংক্রিয়ভাবে চেক করে।',
      ban: '[tempmail] - Ekta temporary email toiri kore, auto message check kore.'
    }
  },

  onStart: async function ({ api, event }) {
    const reply = (msg) => api.sendMessage(msg, event.threadID, event.messageID);

    try {
      const mail = new TempMail(generateRandomId());
      mail.autoFetch();

      if (mail && mail.address) {
        reply(`📧 Temporary Email Generated / টেম্প ইমেইল বানানো হলো:
${mail.address}

⏳ Waiting for incoming messages... / মেসেজ আসার অপেক্ষা করুন...`);
      }

      const fetch = async () => {
        try {
          const mails = await mail.getMail();
          if (!mails.length) return;

          const latest = mails[0];
          const msg = `📥 Message Received! / আপনি একটি মেইল পেয়েছেন!

🔸 From: ${latest.from}
🔸 Subject: ${latest.subject}
📝 Message: ${latest.textBody}
📅 Date: ${latest.date}`;

          reply(msg + `\n\n⚠️ The email will now be deleted. / মেইলটি মুছে ফেলা হবে নিরাপত্তার কারণে।`);
          await mail.deleteMail();
        } catch (err) {
          console.error("Error fetching mail:", err);
        }
      };

      // Auto fetch every 3 seconds
      const intervalId = setInterval(fetch, 3000);

      // Stop polling after 2 minutes to avoid memory leak
      setTimeout(() => clearInterval(intervalId), 2 * 60 * 1000);

    } catch (err) {
      console.error("TempMail Error:", err);
      reply("❌ Could not create or check temp mail. / ইমেইল তৈরি বা চেক করতে সমস্যা হয়েছে: " + err.message);
    }
  }
};
