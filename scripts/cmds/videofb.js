const axios = require("axios");

module.exports = {
	config: {
		name: "videofb",
		version: "1.5",
		author: "Mr.Smokey[Asif Mahmud]",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "Tải video từ facebook",
			en: "Download video from facebook",
			bn: "ফেসবুক থেকে ভিডিও নামাও"
		},
		longDescription: {
			vi: "Tải video/story từ facebook (công khai)",
			en: "Download video/story from facebook (public)",
			bn: "ফেসবুক ভিডিও বা স্টোরি নামাও (পাবলিক পোস্ট)"
		},
		category: "media",
		guide: {
			vi: "   {pn} <url video/story>: tải video từ facebook",
			en: "   {pn} <url video/story>: download video from facebook",
			bn: "   {pn} <video বা story এর লিংক>: ফেসবুক থেকে ভিডিও নামাও"
		}
	},

	langs: {
		vi: {
			missingUrl: "Vui lòng nhập url video/story facebook (công khai) bạn muốn tải về",
			error: "Đã xảy ra lỗi khi tải video",
			downloading: "Đang tiến hành tải video cho bạn",
			tooLarge: "Rất tiếc không thể tải video cho bạn vì dung lượng lớn hơn 83MB"
		},
		en: {
			missingUrl: "Please enter the facebook video/story (public) url you want to download",
			error: "An error occurred while downloading the video",
			downloading: "Downloading video for you",
			tooLarge: "Sorry, we can't download the video for you because the size is larger than 83MB"
		},
		bn: {
			missingUrl: "📌 ভাই, একটা Facebook ভিডিও বা স্টোরির লিংক দেন!",
			error: "❌ ভিডিও নামাতে সমস্যা হইছে! লিংকটা সঠিক আছে তো?",
			downloading: "📥 ভিডিও নামানো শুরু হইছে ভাই...",
			tooLarge: "⚠️ ভিডিওটা অনেক বড় ভাই (৮৩ এমবি+), নামানো গেল না!"
		}
	},

	onStart: async function ({ args, message, getLang, event }) {
		const langCode = message.getLang?.() || "bn";
		const lang = this.langs[langCode] || this.langs.en;

		if (!args[0]) {
			return message.reply(lang.missingUrl);
		}

		let msgSend = null;
		try {
			const response = await axios.get(`https://toxinum.xyz/api/v1/videofb?url=${args[0]}`);

			if (response.data.success === false) {
				return message.reply(lang.error);
			}

			msgSend = await message.reply(lang.downloading);

			const videoSize = response.data.size || null;
			const videoURL = response.data.url2 || response.data.url1;

			if (videoSize && parseFloat(videoSize) > 83) {
				if (msgSend?.messageID) message.unsend(msgSend.messageID);
				return message.reply(lang.tooLarge);
			}

			const stream = await global.utils.getStreamFromURL(videoURL);
			await message.reply({ attachment: stream });

			if (msgSend?.messageID) message.unsend(msgSend.messageID);
		} catch (e) {
			if (msgSend?.messageID) message.unsend(msgSend.messageID);
			return message.reply(lang.tooLarge);
		}
	}
};
