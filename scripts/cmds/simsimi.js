const axios = require("axios");

module.exports = {
  config: {
    name: 'simsimi',
    version: '2.0',
    author: 'Mr.Smokey [Asif Mahmud]',
    countDown: 5,
    role: 0,
    shortDescription: 'Sakura AI Chat',
    longDescription: {
      vi: 'Trò chuyện với Sakura AI ❤',
      en: 'Chat with Sakura AI ❤'
    },
    category: 'AI',
    guide: {
      vi: '{pn} [on | off]: bật/tắt Sakura AI\n{pn} <tin nhắn>: chat với Sakura AI',
      en: '{pn} [on | off]: turn Sakura AI on/off\n{pn} <message>: chat with Sakura AI'
    }
  },

  langs: {
    vi: {
      turnedOn: 'Đã bật Sakura AI!',
      turnedOff: 'Đã tắt Sakura AI!',
      chatting: 'Đang trò chuyện với Sakura...',
      error: 'Lỗi rồi, thử lại sau nhé...'
    },
    en: {
      turnedOn: 'Sakura AI is now ON ❤',
      turnedOff: 'Sakura AI is now OFF',
      chatting: 'Talking to Sakura AI...',
      error: 'Oops! Sakura AI is sleeping, try later.'
    },
    bn: {
      turnedOn: 'Sakura AI on kore deya hoyeche ❤',
      turnedOff: 'Sakura AI off kore deya hoyeche',
      chatting: 'Sakura AI er shathe kotha bola hocche...',
      error: 'Sakura AI busy ache, porer try den!'
    }
  },

  onStart: async function ({ args, threadsData, message, event, getLang }) {
    const threadID = event.threadID;

    if (args[0] === 'on' || args[0] === 'off') {
      const status = args[0] === 'on';
      await threadsData.set(threadID, status, "settings.simsimi");
      return message.reply(getLang(status ? 'turnedOn' : 'turnedOff'));
    }

    if (args.length === 0) return message.reply(getLang("error"));

    try {
      const userInput = args.join(" ");
      const langCode = (await threadsData.get(threadID, "settings.lang")) || 'en';
      const replyMsg = await getMessage(userInput, langCode);
      return message.reply(replyMsg);
    } catch (err) {
      console.error(err);
      return message.reply(getLang("error"));
    }
  },

  onChat: async function ({ args, message, threadsData, event, isUserCallCommand, getLang }) {
    const threadID = event.threadID;
    const enabled = await threadsData.get(threadID, "settings.simsimi");
    if (!enabled || isUserCallCommand || args.length === 0) return;

    try {
      const langCode = (await threadsData.get(threadID, "settings.lang")) || 'en';
      const userInput = args.join(" ");
      const replyMsg = await getMessage(userInput, langCode);
      return message.reply(replyMsg);
    } catch (err) {
      console.error(err);
      return message.reply(getLang("error"));
    }
  }
};

async function getMessage(userInput, langCode = 'en') {
  const url = 'https://api.simsimi.vn/v1/simtalk';
  const res = await axios.post(url, new URLSearchParams({ text: userInput, lc: langCode }));

  if (res.status !== 200 || !res.data.message) {
    throw new Error("Sakura AI no reply");
  }

  return res.data.message;
}
