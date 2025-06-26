// This is the "Ultra Pro Max" version of the npminfo command.
// It features a superior UI with a dynamic typing indicator, richer information,
// beautifully formatted output, and more intelligent error handling.

const axios = require('axios');

// This validation function is good, so we'll keep it.
function isValidPackageName(name) {
  return /^[a-z0-9\.\-_]+$/i.test(name);
}

module.exports = {
  config: {
    name: "npminfo",
    version: "2.0.0", // Version upgrade for the new features
    author: "Asif Mahmud",
    cooldowns: 5,
    role: 0,
    category: "tools",
    shortDescription: {
      en: "Get detailed npm package info."
    },
    longDescription: {
      en: "Retrieve comprehensive, beautifully formatted info about any npm package."
    },
    guide: {
      en: "{p}{n} <package-name>"
    }
  },

  onStart: async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const packageName = args.join(" ").trim();

    if (!packageName) {
      return api.sendMessage(
        "Please provide a package name.\n\nExample: {p}npminfo axios",
        threadID,
        messageID
      );
    }

    if (!isValidPackageName(packageName)) {
      return api.sendMessage(
        "Invalid package name. Please use only letters, numbers, hyphens, underscores, or dots.",
        threadID,
        messageID
      );
    }

    let typingInterval;
    try {
      // Start the dynamic typing indicator for a better user experience.
      typingInterval = setInterval(() => {
        api.sendTypingIndicator(threadID);
      }, 500);

      const response = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`, {
        timeout: 15000 // Increased timeout for slow connections
      });

      // Stop the typing indicator once data is received.
      clearInterval(typingInterval);

      const data = response.data;
      const latestVersion = data['dist-tags']?.latest || 'N/A';
      const versionInfo = data.versions?.[latestVersion] || {};
      
      // Extracting more useful information
      const author = versionInfo.author?.name || data.author?.name || 'Unknown';
      const maintainers = (data.maintainers || []).map(m => m.name).join(', ');
      const license = versionInfo.license || data.license || 'N/A';
      const description = versionInfo.description || data.description || 'No description provided.';
      const homepage = versionInfo.homepage || data.homepage || 'No homepage provided.';
      const repoUrl = (versionInfo.repository?.url || data.repository?.url || '').replace(/^git\+/, '');
      const keywords = (versionInfo.keywords || data.keywords || []).join(', ');
      const lastPublishTime = data.time?.[latestVersion] ? new Date(data.time[latestVersion]).toUTCString() : "Unknown";

      // Beautifully formatted output message
      const packageInfo = `
╭─── 📦 NPM Package Info ───╮
│
├─ Name: ${data.name || 'N/A'}
├─ Version: ${latestVersion}
│
├─ 📝 Description: ${description}
├─ 👤 Author: ${author}
├─ 🔧 Maintainers: ${maintainers || 'N/A'}
│
├─ 📜 License: ${license}
├─ 🏠 Homepage: ${homepage}
├─ 📦 Repository: ${repoUrl || 'N/A'}
│
├─ 🔑 Keywords: ${keywords || 'None'}
├─ 🗓️ Last Published: ${lastPublishTime}
│
╰───🔗 Link: https://www.npmjs.com/package/${data.name || ''}
      `;

      return api.sendMessage(packageInfo, threadID, messageID);

    } catch (err) {
      // Stop the typing indicator on error as well.
      if (typingInterval) clearInterval(typingInterval);
      
      // Intelligent error handling
      if (err.response?.status === 404) {
        return api.sendMessage(
          `❌ Sorry, I couldn't find any package named "${packageName}". Please check the spelling.`,
          threadID,
          messageID
        );
      } else {
        console.error("NPM Info Error:", err.message);
        return api.sendMessage(
          "An unexpected error occurred. It might be a network issue. Please try again later.",
          threadID,
          messageID
        );
      }
    }
  }
};const axios = require('axios');

function isValidPackageName(name) {
  return /^[a-z0-9\-_]+$/i.test(name);
}

module.exports = {
  config: {
    name: "npminfo",
    version: "1.0.0",
    author: "Asif Mahmud",
    countDown: 5,
    role: 0,
    category: "tools",
    shortDescription: {
      en: "Get npm package info"
    },
    longDescription: {
      en: "Retrieve info about any npm package"
    },
    guide: {
      en: "{pn} <package-name>"
    }
  },

  onStart: async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const input = args.join(" ").trim();

    if (!input) {
      return api.sendMessage(
        "Please provide a package name.\n\nExample: npminfo axios",
        threadID,
        messageID
      );
    }

    if (!isValidPackageName(input)) {
      return api.sendMessage(
        "Invalid package name. Only letters, numbers, hyphens and underscores are allowed.",
        threadID,
        messageID
      );
    }

    try {
      const processingMsg = await api.sendMessage(
        `Searching for package \"${input}\"...`,
        threadID
      );

      const query = encodeURIComponent(input);
      const res = await axios.get(`https://registry.npmjs.org/${query}`, {
        timeout: 10000
      });

      if (!res.data) {
        await api.unsendMessage(processingMsg.messageID);
        return api.sendMessage(
          "Package not found. Please check the name and try again.",
          threadID,
          messageID
        );
      }

      const data = res.data;
      const latestVersion = data["dist-tags"]?.latest || "N/A";
      const info = data.versions?.[latestVersion] || {};
      const author = info.author || {};
      const maintainers = data.maintainers || [];
      const time = data.time ? new Date(data.time[latestVersion]).toLocaleString('en-US') : "Unknown";

      const packageInfo =
        `Package: ${data.name || "N/A"}\n` +
        `Description: ${info.description || "None"}\n` +
        `Author: ${author.name || "Unknown"}${author.email ? ` (${author.email})` : ""}\n` +
        `Maintainers: ${maintainers.map(m => m.name).join(", ") || "N/A"}\n` +
        `Latest Version: ${latestVersion}\n` +
        `Published At: ${time}\n` +
        `Link: https://www.npmjs.com/package/${data.name}`;

      await api.unsendMessage(processingMsg.messageID);
      return api.sendMessage(packageInfo, threadID, messageID);
    } catch (err) {
      console.error("NPM Info Error:", err);
      return api.sendMessage(
        `Error: ${err.message || "Unknown error"}. Please try again later.`,
        threadID,
        messageID
      );
    }
  }
};
