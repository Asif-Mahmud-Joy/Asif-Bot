const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "photoxy",
    version: "2.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Create photooxy styled image",
      bn: "Photooxy style e chobi toiri korun"
    },
    longDescription: {
      en: "Generate stylized images using Photooxy templates.",
      bn: "Photooxy template diye style kora chobi banan"
    },
    category: "logo",
    guide: {
      en: "{pn} [template ID (1-15)] [your text]",
      bn: "{pn} [ID (1-15)] [apnar lekha]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const num = parseInt(args[0]);
    const message = args.slice(1).join(' ');

    if (isNaN(num) || num <= 0 || num > 15)
      return api.sendMessage("[❌] Valid ID den (1-15 er moddhe).", threadID, messageID);

    if (!message)
      return api.sendMessage("[ℹ️] Text lekhen jeta diye image banano hobe.", threadID, messageID);

    api.sendMessage("[✅] Processing choltese... Doya kore opekkha korun...", threadID, messageID);

    const cachePath = path.join(__dirname, 'cache', `photooxy_${threadID}_${Date.now()}.png`);

    try {
      const res = await axios({
        method: 'GET',
        url: `https://sakibin.sinha-apiv2.repl.co/api/photooxy/${num}`,
        params: {
          text: message,
          apikey: "SAKIBIN-FREE-SY6B4X"
        },
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(cachePath);
      res.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage({
          body: `🖼️ Photooxy Style ID: ${num}\n✍️ Text: ${message}`,
          attachment: fs.createReadStream(cachePath)
        }, threadID, () => fs.unlinkSync(cachePath));
      });

      writer.on('error', err => {
        console.error(err);
        api.sendMessage("[😵] Image toiri hoy nai. Pore try korun.", threadID, messageID);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("[🚫] API error ba connection problem. Try again poroborti te.", threadID, messageID);
    }
  }
};
