const axios = require("axios");

module.exports.config = {
    name: "tiksr",
    version: "2.0",
    author: "Mr.Smokey {Asif Mahmud}",
    countDown: 5,
    role: 0,
    description: {
        en: "Search for TikTok videos",
    },
    category: "MEDIA",
    guide: {
        en:
            "{pn} <search> - <optional: number of results | blank>" +
            "\nExample:" +
            "\n{pn} cat videos - 10",
    },
};

module.exports.onStart = async function ({ api, args, event }) {
    let search = args.join(" ");
    let searchLimit = 30;

    const match = search.match(/^(.+)\s*-\s*(\d+)$/);
    if (match) {
        search = match[1].trim();
        searchLimit = parseInt(match[2], 10);
    }

    const apiUrl = `https://hiroshi.hiroshiapi.repl.co/tiktok/searchvideo?keywords=${encodeURIComponent(search)}`;

    try {
        const response = await axios.get(apiUrl);
        const videos = response.data.data.videos;

        if (!videos || videos.length === 0) {
            return api.sendMessage("❌ No results found for your search.", event.threadID);
        }

        const videoData = videos[Math.floor(Math.random() * Math.min(searchLimit, videos.length))];

        const stream = await axios({
            method: "get",
            url: videoData.play,
            responseType: "stream",
        });

        let infoMessage = `🎥 Video Caption: ${videoData.desc || 'No title'}\n`;
        infoMessage += `👤 Author: ${videoData.author.nickname || 'Unknown'}\n`;
        infoMessage += `🔗 Video URL: ${videoData.play}`;

        api.sendMessage(
            { body: infoMessage, attachment: stream.data },
            event.threadID
        );
    } catch (error) {
        console.error(error);
        api.sendMessage(
            "❌ An error occurred while downloading the TikTok video.",
            event.threadID
        );
    }
};
