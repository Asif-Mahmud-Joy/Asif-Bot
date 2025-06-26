const axios = require("axios");
const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "married",
    aliases: ["married"],
    version: "1.0",
    author: "Asif Mahmud",
    countDown: 5,
    role: 0,
    shortDescription: "Biye koranor image gen korbe!",
    longDescription: "Apnar valobashar manush ke mention korun, ar biye-r chobi paben!",
    category: "love",
    guide: "{pn} @mention"
  },

  onLoad: async function () {
    const dirCanvas = path.join(__dirname, "cache", "canvas");
    const imgPath = path.join(dirCanvas, "marriedv5.png");

    if (!fs.existsSync(dirCanvas)) fs.mkdirSync(dirCanvas, { recursive: true });
    if (!fs.existsSync(imgPath)) {
      await global.utils.downloadFile(
        "https://i.ibb.co/mhxtgwm/49be174dafdc259030f70b1c57fa1c13.jpg",
        imgPath
      );
    }
  },

  circle: async function (image) {
    const img = await jimp.read(image);
    img.circle();
    return img.getBufferAsync("image/png");
  },

  makeImage: async function ({ one, two }) {
    const __root = path.join(__dirname, "cache", "canvas");
    const template = path.join(__root, "marriedv5.png");

    const img = await jimp.read(template);
    const pathImg = path.join(__root, `married_${one}_${two}.png`);
    const av1Path = path.join(__root, `avt_${one}.png`);
    const av2Path = path.join(__root, `avt_${two}.png`);

    const [av1Data, av2Data] = await Promise.all([
      axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" }),
      axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })
    ]);

    fs.writeFileSync(av1Path, Buffer.from(av1Data.data));
    fs.writeFileSync(av2Path, Buffer.from(av2Data.data));

    const [av1Circle, av2Circle] = await Promise.all([
      jimp.read(await this.circle(av1Path)),
      jimp.read(await this.circle(av2Path))
    ]);

    img.composite(av1Circle.resize(130, 130), 300, 150);
    img.composite(av2Circle.resize(130, 130), 170, 230);

    await img.writeAsync(pathImg);

    fs.unlinkSync(av1Path);
    fs.unlinkSync(av2Path);

    return pathImg;
  },

  onStart: async function ({ event, api }) {
    const mention = Object.keys(event.mentions);
    if (!mention[0]) return api.sendMessage("❗Please mention 1 person.", event.threadID, event.messageID);

    const one = event.senderID;
    const two = mention[0];

    try {
      const imgPath = await this.makeImage({ one, two });
      api.sendMessage({
        body: "💍 Mubarak! Tumader biye hoye gelo! 🥰",
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Image generate korte somossa hocche. Try again later.", event.threadID, event.messageID);
    }
  }
};module.exports = {
		config: {
				name: "married",
				aliases: ["married"],
				version: "1.0",
				author: "kivv",
				countDown: 5,
				role: 0,
				shortDescription: "get a wife",
				longDescription: "",
				category: "married",
				guide: "{@mention}"
		}, 

		onLoad: async function () {
				const { resolve } = require ("path");
				const { existsSync, mkdirSync } = require ("fs-extra");
				const { downloadFile } = global.utils;
				const dirMaterial = __dirname + `/cache/canvas/`;
				const path = resolve(__dirname, 'cache/canvas', 'marriedv5.png');
				if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
				if (!existsSync(path)) await downloadFile("https://i.ibb.co/mhxtgwm/49be174dafdc259030f70b1c57fa1c13.jpg", path);
		},

		circle: async function (image) {
				const jimp = require("jimp");
				image = await jimp.read(image);
				image.circle();
				return await image.getBufferAsync("image/png");
		},

		makeImage: async function ({ one, two }) {
				const fs = require ("fs-extra");
				const path = require ("path");
				const axios = require ("axios"); 
				const jimp = require ("jimp");
				const __root = path.resolve(__dirname, "cache", "canvas");

				let batgiam_img = await jimp.read(__root + "/marriedv5.png");
				let pathImg = __root + `/batman${one}_${two}.png`;
				let avatarOne = __root + `/avt_${one}.png`;
				let avatarTwo = __root + `/avt_${two}.png`;

				let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
				fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

				let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
				fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

				let circleOne = await jimp.read(await this.circle(avatarOne));
				let circleTwo = await jimp.read(await this.circle(avatarTwo));
				batgiam_img.composite(circleOne.resize(130, 130), 300, 150).composite(circleTwo.resize(130, 130), 170, 230);

				let raw = await batgiam_img.getBufferAsync("image/png");

				fs.writeFileSync(pathImg, raw);
				fs.unlinkSync(avatarOne);
				fs.unlinkSync(avatarTwo);

				return pathImg;
		},

		onStart: async function ({ event, api, args }) { 
				const fs = require ("fs-extra");
				const { threadID, messageID, senderID } = event;
				const mention = Object.keys(event.mentions);
				if (!mention[0]) return api.sendMessage("Please mention 1 person.", threadID, messageID);
				else {
						const one = senderID, two = mention[0];
						return this.makeImage({ one, two }).then(path => api.sendMessage({ body: "", attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID));
				}
		}
};
