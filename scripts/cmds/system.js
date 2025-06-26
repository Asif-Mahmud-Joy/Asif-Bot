const si = require('systeminformation');
const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "system",
    aliases: [],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "Display system information",
    longDescription: "Displays hardware and OS information of the system.",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const timeStart = Date.now();

      const cpuData = await si.cpu();
      const tempData = await si.cpuTemperature();
      const loadData = await si.currentLoad();
      const diskInfo = await si.diskLayout();
      const memLayout = await si.memLayout();
      const memData = await si.mem();
      const osInfo = await si.osInfo();

      const uptime = process.uptime();
      const hours = String(Math.floor(uptime / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((uptime % 3600) / 60)).padStart(2, '0');
      const seconds = String(Math.floor(uptime % 60)).padStart(2, '0');

      function formatBytes(bytes) {
        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        let l = 0;
        let n = parseInt(bytes, 10);
        while (n >= 1024 && ++l) n = n / 1024;
        return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
      }

      const message = `📊 SYSTEM INFO 📊\n
🖥 CPU:
- Model: ${cpuData.manufacturer} ${cpuData.brand}
- Speed: ${cpuData.speed} GHz
- Physical Cores: ${cpuData.physicalCores}
- Total Cores: ${cpuData.cores}
- Temp: ${tempData.main || 'N/A'} °C
- Load: ${loadData.currentLoad.toFixed(1)} %

💾 MEMORY:
- RAM Type: ${memLayout[0]?.type || 'N/A'}
- RAM Size: ${formatBytes(memLayout[0]?.size || 0)}
- Total: ${formatBytes(memData.total)}
- Available: ${formatBytes(memData.available)}

🗃 DISK:
- Model: ${diskInfo[0]?.name || 'N/A'}
- Size: ${formatBytes(diskInfo[0]?.size || 0)}
- Type: ${diskInfo[0]?.type || 'N/A'}

🛠 OS:
- Platform: ${osInfo.platform}
- Build: ${osInfo.build}
- Uptime: ${hours}:${minutes}:${seconds}
- Ping: ${Date.now() - timeStart}ms`;

      const images = [
        "https://i.imgur.com/u1WkhXi.jpg",
        "https://i.imgur.com/zuUMUDp.jpg",
        "https://i.imgur.com/skHrcq9.jpg",
        "https://i.imgur.com/TE9tH8w.jpg",
        "https://i.imgur.com/on9p0FK.jpg",
        "https://i.imgur.com/mriBW5m.jpg",
        "https://i.imgur.com/ju7CyHo.jpg",
        "https://i.imgur.com/KJunp2s.jpg",
        "https://i.imgur.com/6knPOgd.jpg",
        "https://i.imgur.com/Nxcbwxk.jpg",
        "https://i.imgur.com/FgtghTN.jpg"
      ];

      const imgPath = __dirname + "/cache/system.jpg";
      const chosenImage = images[Math.floor(Math.random() * images.length)];
      const writeStream = fs.createWriteStream(imgPath);

      request(encodeURI(chosenImage))
        .pipe(writeStream)
        .on("close", () => {
          api.sendMessage({ body: message, attachment: fs.createReadStream(imgPath) }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);
        });
    } catch (err) {
      console.error("System Info Error:", err);
      api.sendMessage("❌ Error fetching system information.", event.threadID);
    }
  }
};
