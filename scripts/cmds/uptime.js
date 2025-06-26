const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const moment = require("moment-timezone");
const { loadImage, createCanvas, registerFont } = require("canvas");
const pidusage = await global.nodemodule["pidusage"](process.pid);

module.exports.config = {
  name: "uptime",
  version: "1.0.0",
  permission: 0,
  prefix: true,
  credits: "Asif",
  description: "Show bot uptime with visuals",
  category: "admin",
  usages: "",
  cooldowns: 5
};

function byte2mb(bytes) {
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  let l = 0, n = parseInt(bytes, 10) || 0;
  while (n >= 1024 && ++l) n /= 1024;
  return `${n.toFixed(2)} ${units[l]}`;
}

module.exports.run = async ({ api, event, args }) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const z_1 = hours < 10 ? '0' + hours : hours;
  const x_1 = minutes < 10 ? '0' + minutes : minutes;
  const y_1 = seconds < 10 ? '0' + seconds : seconds;

  const { commands } = global.client;
  const timeNow = moment.tz("Asia/Dhaka").format("DD/MM/YYYY || HH:mm:ss");
  const timeStart = Date.now();

  const fontsDir = __dirname + "/nayan";
  fs.ensureDirSync(fontsDir);

  const fontList = [
    { name: "UTM-Avo.ttf", url: "https://github.com/hanakuUwU/font/raw/main/UTM%20Avo.ttf" },
    { name: "phenomicon.ttf", url: "https://github.com/hanakuUwU/font/raw/main/phenomicon.ttf" },
    { name: "CaviarDreams.ttf", url: "https://github.com/hanakuUwU/font/raw/main/CaviarDreams.ttf" }
  ];

  for (const font of fontList) {
    const fontPath = path.join(fontsDir, font.name);
    if (!fs.existsSync(fontPath)) {
      const fontData = (await axios.get(font.url, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(fontPath, Buffer.from(fontData, "utf-8"));
    }
  }

  const animeData = (await axios.get('https://raw.githubusercontent.com/mraikero-01/saikidesu_data/main/imgs_data2.json')).data;
  const id = args[0] ? parseInt(args[0]) : Math.floor(Math.random() * animeData.length);
  const char = animeData[id - 1] || animeData[0];

  const bgList = [
    "https://i.imgur.com/9jbBPIM.jpg", "https://i.imgur.com/cPvDTd9.jpg",
    "https://i.imgur.com/ZT8CgR1.jpg", "https://i.imgur.com/WhOaTx7.jpg"
  ];

  const pathImg = path.join(fontsDir, "uptime_bg.jpg");
  const pathAva = path.join(fontsDir, "uptime_ava.png");

  const bgBuffer = (await axios.get(bgList[Math.floor(Math.random() * bgList.length)], { responseType: "arraybuffer" })).data;
  const avaBuffer = (await axios.get(char.imgAnime, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(pathImg, Buffer.from(bgBuffer, "utf-8"));
  fs.writeFileSync(pathAva, Buffer.from(avaBuffer, "utf-8"));

  const background = await loadImage(pathImg);
  const avatar = await loadImage(pathAva);
  const canvas = createCanvas(background.width, background.height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = char.colorBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(avatar, 800, -160, 1100, 1100);

  registerFont(path.join(fontsDir, "phenomicon.ttf"), { family: "phenomicon" });
  registerFont(path.join(fontsDir, "UTM-Avo.ttf"), { family: "UTM" });
  registerFont(path.join(fontsDir, "CaviarDreams.ttf"), { family: "time" });

  ctx.textAlign = "start";
  ctx.font = "130px phenomicon";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("UPTIME ROBOT", 95, 340);

  ctx.font = "70px UTM";
  ctx.fillText(`${z_1}:${x_1}:${y_1}`, 180, 440);

  ctx.font = "45px time";
  ctx.fillText("@Asif", 250, 515);
  ctx.fillText("Bot Status Live", 250, 575);

  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);

  return api.sendMessage({
    body: `┃======{ 𝗨𝗣𝗧𝗜𝗠𝗘 𝗥𝗢𝗕𝗢𝗧 }======┃\n\n→ Bot Uptime: ${hours}h ${minutes}m ${seconds}s\n•━━━━━━━━━━━━━━━━━━━━━━━━•\n➠ Owner: Asif\n➠ Bot Name: ${global.config.BOTNAME}\n➠ Prefix: ${global.config.PREFIX}\n➠ Commands: ${commands.size}\n➠ Users: ${global.data.allUserID.length}\n➠ Threads: ${global.data.allThreadID.length}\n➠ CPU: ${pidusage.cpu.toFixed(1)}%\n➠ RAM: ${byte2mb(pidusage.memory)}\n➠ Ping: ${Date.now() - timeStart}ms\n➠ Char ID: ${id}\n•━━━━━━━━━━━━━━━━━━━━━━━━•\n[ ${timeNow} ]`,
    attachment: fs.createReadStream(pathImg)
  }, event.threadID, () => {
    fs.unlinkSync(pathImg);
    fs.unlinkSync(pathAva);
  });
};
