const axios = require('axios');

module.exports = {
  config: {
    name: "imagine2",
    aliases: [],
    version: "3.5",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 0,
    role: 0,
    shortDescription: {
      en: 'Text to AI Art (Stable Diffusion)'
    },
    longDescription: {
      en: "Generate stunning AI images from prompt using stable diffusion models."
    },
    category: "ai",
    guide: {
      en: `Use:

{pn} <prompt>
{pn} <prompt>:<model number>

Example:
{pn} a cyberpunk city
{pn} a warrior princess:16`
    }
  },

  onStart: async function ({ message, args }) {
    const input = args.join(" ");
    if (!input) {
      return message.reply(`❗ Prompt dao!

Example:
imagine2 a beautiful sunset
imagine2 a boy riding dragon:15`);
    }

    let prompt, model;
    if (input.includes(":")) {
      [prompt, model] = input.split(":").map(str => str.trim());
      if (isNaN(model) || model < 0 || model > 43) {
        return message.reply("❗ Model number 0-43 er modhe dite hobe.");
      }
    } else {
      prompt = input;
      model = "0";
    }

    try {
      message.reply("🛠️ Image toiri hocche, ektu wait kor bro...");

      const apiURL = `https://aliestercrowley.com/api/crowgen.php?model=${model}&prompt=${encodeURIComponent(prompt)}`;
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), 20000);
      });

      const response = await Promise.race([
        axios.get(apiURL, { responseType: 'arraybuffer' }),
        timeout
      ]);

      if (response instanceof Error) throw response;

      const imageStream = await global.utils.getStreamFromURL(apiURL);

      return message.reply({
        body: `🎨 Prompt: ${prompt}\n🧠 Model: ${model}`,
        attachment: imageStream
      });

    } catch (err) {
      console.error("❌ Image generation error:", err);
      return message.reply("❌ Prompt process korte error hoise. Later try koro bro.");
    }
  }
};
