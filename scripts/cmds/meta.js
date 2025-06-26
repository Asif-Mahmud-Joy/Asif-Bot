const axios = require('axios');
const fs = require('fs-extra');

const baseApiUrl = async () => {
  try {
    const base = await axios.get(`https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`);
    return base.data.api;
  } catch (err) {
    throw new Error("🔌 Base API URL load korte somossa hoise!");
  }
};

module.exports = {
  config: {
    name: "meta",
    aliases: ["img5"],
    version: "7.0.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 15,
    role: 0,
    shortDescription: "photo generate",
    longDescription: "Meta AI diye chobi generate koro",
    category: "imagination",
    guide: {
      en: "{pn} [prompt]",
      bn: "{pn} [jaisar chobi chai]"
    }
  },

  onStart: async function ({ args, event, api }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("📝 | Prompt dao chobi bananor jonno, udahoron: meta akta cyberpunk cat", event.threadID, event.messageID);

    let waitingMsg;
    try {
      waitingMsg = await api.sendMessage("🧠 Meta AI chinta kortese...⏳", event.threadID);

      const baseUrl = await baseApiUrl();
      const response = await axios.get(`${baseUrl}/meta?prompt=${encodeURIComponent(prompt)}&key=dipto008`);
      const data = response.data;

      if (!data.imgUrls) throw new Error("😿 Image link pawa jay nai. API somvoboto down.");

      const imageStream = await global.utils.getStreamFromURL(data.imgUrls);
      await api.unsendMessage(waitingMsg.messageID);

      return api.sendMessage({
        body: `🖼️ | Tomar prompt er chobi ready: ${prompt}`,
        attachment: imageStream
      }, event.threadID, event.messageID);

    } catch (e) {
      if (waitingMsg?.messageID) await api.unsendMessage(waitingMsg.messageID);
      console.error("❌ Meta AI error:", e);
      return api.sendMessage(`❌ Chobi toiri hoy nai!

📍Error: ${e.message}`, event.threadID, event.messageID);
    }
  }
};
