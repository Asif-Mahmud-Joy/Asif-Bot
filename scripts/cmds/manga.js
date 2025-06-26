const axios = require('axios');

module.exports = {
  config: {
    name: 'manga',
    version: '2.0',
    author: 'Mr.Smokey [Asif Mahmud]',
    countDown: 0,
    role: 0,
    category: 'box chat',
    shortDescription: 'Search & read Manga',
    longDescription: 'Search title, get list, select chapter, read.',
    guide: '{pn} <search-term>'
  },

  onStart: async function({ api, event, commandName, global }) {
    try {
      const { threadID, messageID } = event;
      await api.sendMessage('🔍 Searching manga...', threadID);
      global.GoatBot.mangaReplies = global.GoatBot.mangaReplies || new Map();
      global.GoatBot.mangaReplies.set(messageID, {
        commandName, author: event.senderID,
        messageID, type: 'search', page: 1, results: []
      });

      const res = await axios.get(`https://api.consumet.org/manga/mangadex/${encodeURIComponent(event.body.slice(commandName.length + 2))}`);
      const list = res.data.results || [];
      if (!list.length) throw new Error('No results found');

      const pageList = list.slice(0, 5).map((m, i) => `${i+1}. ${m.title}`);
      global.GoatBot.mangaReplies.get(messageID).results = list;
      api.sendMessage(`Results:\n${pageList.join('\n')}\n\nReply with:\n• Page <number>\n• Select <number>\n• Done`, threadID);
    } catch (e) {
      api.sendMessage(`⚠️ Error: ${e.message}`, event.threadID);
    }
  },

  onReply: async function({ api, event, Reply, global }) {
    try {
      const replyData = global.GoatBot.mangaReplies.get(event.messageReply.messageID);
      if (!replyData || event.senderID !== replyData.author) return;

      const [cmd, num] = event.body.split(' ');
      const idx = parseInt(num, 10) - 1;

      if (cmd.toLowerCase() === 'select' && replyData.type === 'search') {
        const manga = replyData.results[idx];
        if (!manga) throw new Error('Invalid selection');
        const info = await axios.get(`https://api.consumet.org/manga/mangadex/info/${manga.id}`);
        const { description, status, genres, chapters } = info.data;
        const text = `Title: ${manga.title}\nGenres: ${genres.join(', ')}\nStatus: ${status}`;
        global.GoatBot.mangaReplies.set(event.messageID, {
          ...replyData, type: 'read', manga, chapters
        });
        api.sendMessage(text, event.threadID);
      }
      else if ((cmd.toLowerCase() === 'chapter' || cmd.toLowerCase() === 'read') && replyData.type === 'read') {
        const ch = replyData.chapters[idx];
        if (!ch) throw new Error('Invalid chapter index');
        api.sendMessage('⏳ Fetching chapter images...', event.threadID);
        const pages = (await axios.get(`https://api.consumet.org/manga/mangadex/read/${ch.id}`)).data;
        for (const pageUrl of pages) {
          const img = await global.utils.getStreamFromURL(pageUrl);
          await api.sendMessage({ attachment: img }, event.threadID);
        }
        api.sendMessage('✅ Done reading!', event.threadID);
      }
      else if (cmd.toLowerCase() === 'done') {
        api.unsendMessage(replyData.messageID);
        api.sendMessage('✅ Session closed.', event.threadID);
        global.GoatBot.mangaReplies.delete(replyData.messageID);
      }
      else {
        api.sendMessage('❌ Invalid reply. Use: Select, Chapter, or Done.', event.threadID);
      }
    } catch (e) {
      api.sendMessage(`⚠️ Reply error: ${e.message}`, event.threadID);
    }
  }
};
