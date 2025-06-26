const axios = require("axios");
const dip = "https://www.noobs-api.000.pe/dipto"

module.exports.config = {
  name: "xl31",
  version: "2.0",
  role: 2,
  author: "Mr.Smokey{ASIF MAHMUD}",
  description: {
    en: "Sdxl 3.1 Image Generator",
    bn: "Sdxl 3.1 ইমেজ জেনারেটর"
  },
  category: "Image gen",
  guide: {
    en: "{pn} [prompt] --ratio 1:1\n{pn} [prompt]",
    bn: "{pn} [প্রম্পট] --ratio 1:1\n{pn} [প্রম্পট]"
  },
  countDown: 15,
};

module.exports.onStart = async ({ message, event, args, api }) => {
  try {
    const promptInput = args.join(" ");
    let prompt2, ratio = "1:1";

    if (promptInput.includes("--ratio")) {
      const parts = promptInput.split("--ratio");
      prompt2 = parts[0].trim();
      const ratioInput = parts[1].trim().split(" ")[0];
      ratio = /^\d+:\d+$/.test(ratioInput) ? ratioInput : "1:1";
    } else {
      prompt2 = promptInput;
    }

    const waitMessage = await message.reply('⏳ Please wait baby <😘>...');
    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    const { data } = await axios.get(
      `${dip}/xl31?prompt=${encodeURIComponent(prompt2)}&ratio=${encodeURIComponent(ratio)}`
    );

    api.setMessageReaction("✅", event.messageID, () => {}, true);
    await message.unsend(waitMessage.messageID);

    await message.reply({
      body: `✅ Here's your image\n✅ এখানে আপনার ইমেজ`,
      attachment: await global.utils.getStreamFromURL(data.data)
    });

  } catch (e) {
    console.error(e);
    message.reply("❌ Error: " + e.message + "\nত্রুটি: " + e.message);
  }
};
