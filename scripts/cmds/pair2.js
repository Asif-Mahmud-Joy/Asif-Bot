const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "pairmatch",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Get to know your partner",
      bn: "Jaanun apnar partner ke"
    },
    longDescription: {
      en: "Know your destiny and who you'll complete your life with",
      bn: "Jaanun kake niye apnar jibonta shesh korben"
    },
    category: "LOVE",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    const pathImg = __dirname + "/cache/pair_bg.png";
    const pathAvt1 = __dirname + "/cache/pair_avt1.png";
    const pathAvt2 = __dirname + "/cache/pair_avt2.png";

    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);
    const threadInfo = await api.getThreadInfo(event.threadID);
    const allUsers = threadInfo.userInfo;

    const botID = api.getCurrentUserID();

    const senderGender = allUsers.find(u => u.id == senderID)?.gender;

    let candidates = allUsers.filter(u => u.id !== senderID && u.id !== botID);
    if (senderGender === "FEMALE") {
      candidates = candidates.filter(u => u.gender === "MALE");
    } else if (senderGender === "MALE") {
      candidates = candidates.filter(u => u.gender === "FEMALE");
    }

    if (candidates.length === 0) {
      return api.sendMessage("[❌] E group-e kono suitable partner pawa jai nai!", event.threadID, event.messageID);
    }

    const partner = candidates[Math.floor(Math.random() * candidates.length)];
    const partnerID = partner.id;
    const partnerName = await usersData.getName(partnerID);

    const fixedRandom = ["0", "-1", "99.99", "101", "0.01", `${Math.floor(Math.random() * 100) + 1}`];
    const matchPercent = fixedRandom[Math.floor(Math.random() * fixedRandom.length)];

    const bgUrl = "https://i.ibb.co/RBRLmRt/Pics-Art-05-14-10-47-00.jpg";

    const downloadImage = async (url, output) => {
      const img = (await axios.get(url, { responseType: "arraybuffer" })).data;
      await fs.writeFile(output, img);
    };

    await Promise.all([
      downloadImage(`https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=EAAJZChZC...`, pathAvt1),
      downloadImage(`https://graph.facebook.com/${partnerID}/picture?width=720&height=720&access_token=EAAJZChZC...`, pathAvt2),
      downloadImage(bgUrl, pathImg)
    ]);

    const baseImage = await loadImage(pathImg);
    const avatar1 = await loadImage(pathAvt1);
    const avatar2 = await loadImage(pathAvt2);

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0);
    ctx.drawImage(avatar1, 111, 175, 330, 330);
    ctx.drawImage(avatar2, 1018, 173, 330, 330);

    const imageBuffer = canvas.toBuffer();
    const finalImagePath = __dirname + "/cache/final_pair.png";
    fs.writeFileSync(finalImagePath, imageBuffer);

    fs.remove(pathAvt1);
    fs.remove(pathAvt2);
    fs.remove(pathImg);

    return api.sendMessage({
      body: `『💗』Congrats ${senderName}!
『❤️』Tomar jiboner sathi hote pare ${partnerName}!
『🔗』Tomader bonding percent: ${matchPercent}%`,
      mentions: [
        { tag: partnerName, id: partnerID },
        { tag: senderName, id: senderID }
      ],
      attachment: fs.createReadStream(finalImagePath)
    }, event.threadID, () => fs.unlinkSync(finalImagePath), event.messageID);
  }
};
