const axios = require('axios');

module.exports = {
  config: {
    name: 'joke',
    version: '2.1',
    author: 'Mr.Smokey [Asif Mahmud]',
    role: 0,
    category: 'fun',
    shortDescription: {
      en: 'Tells a random joke.',
      bn: 'একটি র্যান্ডম বাংলা জোক বলবে'
    },
    longDescription: {
      en: 'Tells a random joke fetched from the Bangla Joke API.',
      bn: 'বাংলা জোক এপিআই থেকে একটি র‍্যান্ডম জোক আনে ও দেখায়'
    },
    guide: {
      en: '{pn}',
      bn: '{pn} - একটি বাংলা মজার জোক দেখাও'
    }
  },
  onStart: async function ({ api, event }) {
    try {
      // Example Bangla joke API (replace with a better source if available)
      const response = await axios.get('https://bdjoke-api.onrender.com/joke');

      if (response.status !== 200 || !response.data?.joke) {
        throw new Error('Invalid or missing response from Bangla Joke API');
      }

      const message = `😂 বাংলা জোক:

👉 ${response.data.joke}`;

      return api.sendMessage(message, event.threadID);
    } catch (error) {
      console.error(`❌ জোক পাঠাতে ব্যর্থ: ${error.message}`);
      return api.sendMessage('❌ মাফ করবেন, বাংলা জোক আনতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।', event.threadID);
    }
  }
};
