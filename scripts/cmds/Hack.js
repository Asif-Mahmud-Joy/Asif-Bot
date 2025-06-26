const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "hack",
    author: "asif",
    version: "2.0",
    countDown: 5,
    role: 0, // 0 = All users, 1 = Admin only
    category: "fun",
    shortDescription: {
      en: "Generate a fake hacking image with a user's profile picture (for fun).",
    },
    guide: {
      en: "{pn} [@mention|userID]",
    },
  },

  onStart: async function ({ api, event, args }) {
    try {
      // Determine target user
      const targetID = args[0]?.startsWith("@") 
        ? Object.keys(event.mentions)[0] 
        : args[0] || event.senderID;

      // Fetch user info
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "Unknown User";

      // Setup cache directory
      const cacheDir = path.join(__dirname, "cache", "hack_cmd");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // File paths
      const files = {
        bg: path.join(cacheDir, "bg.png"),
        avatar: path.join(cacheDir, "avatar.png"),
        output: path.join(cacheDir, "result.png"),
      };

      // Download assets in parallel
      const [avatarRes, bgRes] = await Promise.all([
        axios.get(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { 
          responseType: "arraybuffer" 
        }),
        axios.get("https://i.imgur.com/VQXViKI.png", { 
          responseType: "arraybuffer" 
        }),
      ]);

      // Save files
      await Promise.all([
        fs.writeFile(files.avatar, Buffer.from(avatarRes.data)),
        fs.writeFile(files.bg, Buffer.from(bgRes.data)),
      ]);

      // Process images
      const [baseImage, avatar] = await Promise.all([
        loadImage(files.bg),
        loadImage(files.avatar),
      ]);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // Draw avatar (circular)
      ctx.beginPath();
      ctx.arc(133, 487, 50, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 83, 437, 100, 100);

      // Draw username
      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "#1878F3";
      ctx.textAlign = "left";
      
      // Text wrapping function
      const wrapText = (text, maxWidth) => {
        const words = text.split(" ");
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = ctx.measureText(currentLine + " " + word).width;
          if (width < maxWidth) {
            currentLine += " " + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);
        return lines;
      };

      const wrappedName = wrapText(userName, 300);
      wrappedName.forEach((line, i) => {
        ctx.fillText(line, 200, 497 + (i * 30));
      });

      // Save and send
      await fs.writeFile(files.output, canvas.toBuffer());
      
      await api.sendMessage({
        body: `🖥️ | Successfully "hacked" ${userName}! (This is just a joke)`,
        attachment: fs.createReadStream(files.output),
      }, event.threadID);

    } catch (error) {
      console.error("Hack command error:", error);
      api.sendMessage("❌ Failed to generate hack image. Please try again later.", event.threadID);
    } finally {
      // Clean up files
      const cacheDir = path.join(__dirname, "cache", "hack_cmd");
      if (fs.existsSync(cacheDir)) {
        fs.emptyDirSync(cacheDir);
      }
    }
  },
};
