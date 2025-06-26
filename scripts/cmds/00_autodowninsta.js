const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');

// Ensure cache directory exists
const CACHE_DIR = path.join(__dirname, 'cache');
fs.ensureDirSync(CACHE_DIR);

module.exports = {
  threadStates: {},

  config: {
    name: 'autoinsta_v2',
    version: '2.3',
    author: 'Asif Mahmud',
    countDown: 5,
    role: 0,
    maxVideoSizeMB: 25,
    shortDescription: 'Auto Instagram Video Downloader',
    longDescription: 'Detects and downloads Instagram videos automatically',
    category: 'media',
    guide: { en: 'Use: autoinsta on/off to enable or disable. Then send an Instagram video link.' }
  },

  // Remove cache files older than 1 hour
  cleanOldCacheFiles: async function() {
    const files = await fs.readdir(CACHE_DIR);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(CACHE_DIR, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtimeMs > 3600000) {
        await fs.unlink(filePath);
      }
    }
  },

  onLoad: function() {
    // Schedule cache cleanup every hour
    setInterval(() => this.cleanOldCacheFiles(), 3600000);
  },

  onStart: async function({ api, event }) {
    const threadID = event.threadID;
    const text = (event.body || '').trim().toLowerCase();

    // Initialize state
    if (!(threadID in this.threadStates)) {
      this.threadStates[threadID] = false;
    }

    if (text === 'autoinsta on') {
      this.threadStates[threadID] = true;
      return api.sendMessage('AutoInsta is now enabled. Send an Instagram video link to download.', threadID);
    }

    if (text === 'autoinsta off') {
      this.threadStates[threadID] = false;
      return api.sendMessage('AutoInsta is now disabled.', threadID);
    }

    if (text.startsWith('autoinsta')) {
      const status = this.threadStates[threadID] ? 'enabled' : 'disabled';
      return api.sendMessage(
        `Usage: autoinsta on/off. Current status: ${status}.`,
        threadID
      );
    }
  },

  onChat: async function({ api, event }) {
    const threadID = event.threadID;
    const msg = event.body || '';

    if (this.threadStates[threadID] && this.checkLink(msg)) {
      // Notify user
      api.sendMessage('Downloading your video...', threadID, async () => {
        try {
          const downloadUrl = await this.getDownloadLink(msg);
          const fileName = `${Date.now()}.mp4`;
          const filePath = path.join(CACHE_DIR, fileName);

          const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
          await fs.outputFile(filePath, response.data);

          const stats = await fs.stat(filePath);
          const maxSize = this.config.maxVideoSizeMB * 1024 * 1024;
          if (stats.size > maxSize) {
            await fs.unlink(filePath);
            return api.sendMessage(
              `File exceeds ${this.config.maxVideoSizeMB}MB limit.`,
              threadID
            );
          }

          // Send video and cleanup
          await api.sendMessage({ attachment: fs.createReadStream(filePath) }, threadID);
          await fs.unlink(filePath);
        } catch (err) {
          console.error('Download error:', err);
          api.sendMessage('Failed to download video. Please try again later.', threadID);
        }
      });
    }
  },

  checkLink: function(text) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(instagram\.com|instagr\.am)\/[^
\s]+/i;
    return regex.test(text);
  },

  getDownloadLink: async function(url) {
    const response = await axios.get(
      `https://rishadapi.deno.dev/insta?url=${encodeURIComponent(url)}`
    );
    if (response.data && response.data.success && response.data.video) {
      return response.data.video;
    }
    throw new Error('Invalid API response');
  }
};
