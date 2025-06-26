const axios = require("axios");

module.exports = {
  config: {
    name: 'sim',
    version: '2.0',
    author: 'Mr.Smokey [Asif Mahmud]',
    countDown: 3,
    role: 0,
    shortDescription: 'SimSimi AI ChatBot',
    longDescription: {
      en: 'Chat with SimSimi using a stable working API'
    },
    category: 'ai',
    guide: {
      en: '   {pn} <message>: Talk to SimSimi\n   Example: {pn} hello!'
    }
  },

  langs: {
    en: {
      chatting: 'Chatting with SimSimi... 💬',
      error: '🚫 SimSimi is not responding. Please try again later.'
    },
    bn: {
      chatting: 'SimSimi er sathe kotha hocche... 💬',
      error: '🚫 SimSimi kaj kortese na. Ektu pore chesta korun.'
    }
  },

  onStart: async function ({ args, message, event, getLang }) {
    if (!args[0]) return message.reply("❗Please type something to talk to SimSimi!");

    const userInput = args.join(" ");
    const langCode = 'en'; // Default to English

    try {
      const reply = await getMessage(userInput, langCode);
      message.reply(reply);
    } catch (err) {
      console.error(err);
      message.reply(getLang("error"));
    }
  },

  onChat: async function ({ args, message, threadsData, event, isUserCallCommand, getLang }) {
    if (!isUserCallCommand || args.length < 2) return;

    const langCode = await threadsData.get(event.threadID, "settings.lang") || 'en';
    try {
      const reply = await getMessage(args.join(" "), langCode);
      message.reply(reply);
    } catch (err) {
      console.error(err);
      message.reply(getLang("error"));
    }
  }
};

async function getMessage(userMessage, langCode = 'en') {
  try {
    const encodedMessage = encodeURIComponent(userMessage);
    const response = await axios.get(`https://api.simsimi.vn/v1/simtalk`, {
      params: {
        text: userMessage,
        lc: langCode
      }
    });

    if (!response.data || !response.data.message) {
      throw new Error("No response from SimSimi API");
    }

    return response.data.message;
  } catch (err) {
    throw new Error("SimSimi API error");
  }
}
