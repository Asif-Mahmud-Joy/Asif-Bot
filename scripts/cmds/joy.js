const axios = require("axios");

module.exports = {
  config: {
    name: "joy",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "no prefix auto-reply",
    longDescription: "Replies automatically when someone says 'Hussain'",
    category: "no prefix"
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    try {
      const triggerWord = "asif";
      const msg = event.body?.toLowerCase();

      if (msg === triggerWord) {
        const videoUrl = "https://i.imgur.com/bGPCqh9.mp4";

        // Check if video exists
        const response = await axios.head(videoUrl);
        if (response.status !== 200) throw new Error("Video not accessible");

        return message.reply({
          body:
            "\u300c  \ud835\u0048\ud835\u0045\u2090 \ud835\u0049 \ud835\u0041\u2091 \ud835\u0049\ud835\u0054\ud835\u0041\ud835\u0043\ud835\u0048\ud835\u0049 \ud835\u0055\ud835\u0043\ud835\u0048\ud835\u0049\ud835\u0048\ud835\u0041\ud835\u1D3F \ud83d\udc80 \ud835\u004d\ud835\u0059 \ud835\u0043\ud835\u0052\ud835\u0045\ud835\u0041\ud835\u0054\ud835\u004f\ud835\u0052 MR.SMOKEY\ud83c\udf1f\ud83c\udf42\n\n\uff22\uff2f\uff34 \uff2f\uff37\uff2e\uff25\uff32\n\ud835\u0041\u2091\ud835\u0053\ud835\u0049\ud835\u0046 \ud835\u004d\ud835\u0041\ud835\u0048\ud835\u004d\ud835\u0055\ud835\u0044\u300d",
          attachment: await global.utils.getStreamFromURL(videoUrl)
        });
      }
    } catch (err) {
      return message.reply("\u274c Error while processing the command. Please try again later.");
    }
  }
};
