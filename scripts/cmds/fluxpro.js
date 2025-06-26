const axios = require("axios");
const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json");
  return base.data.api;
};

module.exports.config = {
  name: "fluxpro",
  version: "2.1", // ✅ Updated
  role: 2,
  author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
  description: "Generate images with Flux.1 Pro",
  category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
  preimum: true,
  guide: "{pn} [prompt] --ratio 1024x1024\n{pn} [prompt]",
  countDown: 15,
};

module.exports.onStart = async ({ message, event, args, api }) => {
  try {
    if (args.length === 0) return message.reply("🔍 Prompt dao baby");

    let prompt = args.join(" ");
    let promptText = prompt;
    let ratio = "1024x1024";

    // Optional ratio support
    if (prompt.includes("--ratio")) {
      const parts = prompt.split("--ratio");
      promptText = parts[0].trim();
      ratio = parts[1]?.trim() || "1024x1024";
    }

    const startTime = Date.now();
    const waitMsg = await message.reply("⏳ Wait baby... Flux e tor chobi toiri hocche! <😘>");
    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    const apiUrl = `${await baseApiUrl()}/flux11?prompt=${encodeURIComponent(promptText)}&ratio=${encodeURIComponent(ratio)}`;
    const imageStream = await global.utils.getStreamFromURL(apiUrl);

    const endTime = Date.now();
    await message.unsend(waitMsg.messageID);
    api.setMessageReaction("✅", event.messageID, () => {}, true);

    return message.reply({
      body: `📸 Image ready!
🌐 Model: Flux.1 Pro
⏱ Time: ${(endTime - startTime) / 1000}s
🖋 Prompt: ${promptText}
🖼 Ratio: ${ratio}`,
      attachment: imageStream
    });
  } catch (e) {
    console.error("[FLUXPRO ERROR]", e);
    return message.reply("❌ Error hoise baby: " + e.message);
  }
};
