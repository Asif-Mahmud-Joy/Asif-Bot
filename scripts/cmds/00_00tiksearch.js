// This is the "Ultra Pro Max" version of the TikTok downloader.
// It completely removes Puppeteer and FFmpeg, using a lightweight and fast API instead.
// This new method downloads videos WITHOUT the watermark and provides rich details.

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Helper function to format large numbers (e.g., 1500000 -> 1.5M)
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
}

// Ensure the cache directory exists, as in the original script.
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["ttdl"],
    version: "5.0", // Major architectural upgrade
    author: "Asif",
    cooldowns: 15, // Cooldown to prevent spamming the API
    role: 0,
    description: "Download TikTok videos without watermark",
    category: "media",
    guide: "{p}{n} [TikTok video URL]"
  },

  onStart: async function ({ api, event, args }) {
    const url = args[0];
    const { threadID, messageID } = event;

    if (!url || !url.includes("tiktok.com")) {
      return api.sendMessage(
        "Please provide a valid TikTok video URL.\n\nExample: {p}tiktok https://www.tiktok.com/@user/video/123...",
        threadID,
        messageID
      );
    }

    let typingInterval;
    try {
      // Start the dynamic typing indicator for a great user experience.
      typingInterval = setInterval(() => api.sendTypingIndicator(threadID), 500);

      // Using a reliable third-party API to do the heavy lifting.
      // This is faster and more stable than Puppeteer.
      const apiUrl = `https://api.lovetik.com/api/v2/download?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);

      // Stop typing once the API responds.
      clearInterval(typingInterval);

      if (response.data.status !== 'success' || !response.data.links) {
        throw new Error(response.data.mess || "Could not retrieve video data. The link might be invalid or private.");
      }

      const videoData = response.data;
      const noWatermarkLink = videoData.links.find(link => link.type === 'video' && link.quality.includes('nowm'))?.url;
      
      if (!noWatermarkLink) {
          throw new Error("No watermark-free video link was found.");
      }

      // Download the video stream.
      const videoStreamResponse = await axios.get(noWatermarkLink, { responseType: 'stream' });
      
      // Save the video to a temporary file in the cache.
      const tempVideoPath = path.join(cacheDir, `tiktok_${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempVideoPath);
      videoStreamResponse.data.pipe(writer);

      // Wait for the download to finish.
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Beautifully formatted output message with rich information.
      const replyMessage = `
╭─── TikTok Downloader ───╮
│
├─ 🖋️ Author: ${videoData.author}
├─ 📄 Caption: ${videoData.desc || "No caption"}
│
├─ ❤️ Likes: ${formatNumber(videoData.stats.likeCount)}
├─ 💬 Comments: ${formatNumber(videoData.stats.commentCount)}
├─ 🔗 Shares: ${formatNumber(videoData.stats.shareCount)}
├─ ▶️ Plays: ${formatNumber(videoData.stats.playCount)}
│
├─ 🎵 Music: ${videoData.music}
│
╰─── ✨ Video sent without watermark!
      `;

      await api.sendMessage({
        body: replyMessage,
        attachment: fs.createReadStream(tempVideoPath)
      }, threadID, (err) => {
        // Cleanup: Delete the temporary file after sending.
        if (fs.existsSync(tempVideoPath)) {
          fs.unlinkSync(tempVideoPath);
        }
        if (err) console.error("Error sending TikTok video:", err);
      }, messageID);

    } catch (error) {
      if (typingInterval) clearInterval(typingInterval);
      console.error("TikTok Downloader Error:", error.message);
      api.sendMessage(`❌ Oops! An error occurred.\n${error.message}`, threadID, messageID);
    }
  }
};
