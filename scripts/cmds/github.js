const moment = require("moment");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "github",
    aliases: ["ghuser", "gitinfo"],
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    version: "2.0",
    countdown: 5,
    role: 0,
    category: "utility",
    shortDescription: {
      en: "Get GitHub user profile info by username"
    },
    guide: {
      en: "{pn} <github-username>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const username = args.join(" ").trim();
    if (!username) {
      return api.sendMessage("🔍 Please provide a GitHub username.", event.threadID, event.messageID);
    }

    try {
      const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`);
      const data = res.data;

      if (!data || data.message === "Not Found") {
        return api.sendMessage("❌ User not found. Check the username and try again.", event.threadID, event.messageID);
      }

      const {
        login,
        avatar_url,
        name,
        id,
        html_url,
        public_repos,
        followers,
        following,
        location,
        created_at,
        bio
      } = data;

      const formattedDate = moment.utc(created_at).format("dddd, MMMM Do YYYY");
      const info = `📦 GitHub Profile Info:
━━━━━━━━━━━━━━━
👤 Name: ${name || login}
🆔 ID: ${id}
🔗 Profile: ${html_url}
📄 Bio: ${bio || "No bio available."}
📚 Public Repos: ${public_repos}
👥 Followers: ${followers} | Following: ${following}
📍 Location: ${location || "Not provided"}
🗓️ Joined: ${formattedDate}`;

      const imgPath = `${__dirname}/cache/github_avatar.png`;
      const imgBuffer = await axios.get(avatar_url, { responseType: "arraybuffer" });
      await fs.outputFile(imgPath, imgBuffer.data);

      return api.sendMessage({
        body: info,
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, () => fs.unlinkSync(imgPath));

    } catch (err) {
      console.error("[github command error]", err);
      return api.sendMessage("🚫 Somossa hoise GitHub info ber korte. Try again later.", event.threadID, event.messageID);
    }
  }
};
