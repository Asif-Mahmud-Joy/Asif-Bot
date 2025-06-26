const axios = require("axios");
const fs = require("fs");
const request = require("request");

function convert(time) {
  const date = new Date(time);
  const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}||${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
  return formattedDate;
}

const headers = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like) Version/12.0 eWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1",
  "accept": "application/json, text/plain, */*"
};

module.exports = {
  config: {
    name: "stalk",
    aliases: ["fbstalk"],
    version: "3.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "🕵️ Stalk Facebook profile info",
    longDescription: {
      en: "Use this command to fetch basic info about a Facebook user using UID, @mention or reply.",
    },
    category: "info",
    guide: {
      en: "{pn} reply/@mention/uid",
    },
  },

  onStart: async function ({ api, event, args }) {
    const path = __dirname + `/cache/fb_info_avatar.png`;
    const id = event.type === "message_reply" ? event.messageReply.senderID : args[0] || Object.keys(event.mentions)[0] || event.senderID;

    const token = "EAAD6V7os0gcBO6oBf8U0vDqczYZAVBF6FZAVxGRqZCZChpQxyZB7g1y6LZBFLp6LZCXBO1FaA9W92S8YIskqbZAPZB3wCKA3Ai3hDXqB2dm0eFCsW2QIx1VX95JjVHQOKjeM2pA5L1rEkkYZCddVAPMNll33sXyg5UmZAB6SOKPM4hwZCqxuZBtgyFVlAiZB4ZCEZD"; // ✅ Valid working token (page access token, tested)

    try {
      const url = `https://graph.facebook.com/${id}?fields=id,name,first_name,link,gender,birthday,relationship_status,hometown,locale,about,quotes,created_time,is_verified,website,significant_other,subscribers.limit(0)&access_token=${token}`;
      const { data } = await axios.get(url, { headers });

      const profilePicUrl = `https://graph.facebook.com/${id}/picture?width=1500&height=1500&access_token=${token}`;
      const cb = function () {
        api.sendMessage({
          body: `📘 FB Profile Info:
━━━━━━━━━━━━━━
👤 Name: ${data.name || "N/A"}
🔰 Verified: ${data.is_verified ? "✅ Yes" : "❌ No"}
🎂 Birthday: ${data.birthday || "N/A"}
🚻 Gender: ${data.gender || "N/A"}
📅 Created: ${convert(data.created_time)}
🏡 Hometown: ${data.hometown?.name || "N/A"}
❤️ Relationship: ${data.relationship_status || "N/A"}
👫 Lover: ${data.significant_other?.name || "N/A"}
🌐 Website: ${data.website || "N/A"}
📝 About: ${data.about || "N/A"}
🗣️ Quotes: ${data.quotes || "N/A"}
📍 Locale: ${data.locale || "N/A"}
👥 Followers: ${data.subscribers?.summary?.total_count || 0}
🔗 Profile Link: ${data.link || "N/A"}`,
          attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);
      };

      request(encodeURI(profilePicUrl)).pipe(fs.createWriteStream(path)).on("close", cb);
    } catch (err) {
      api.sendMessage(`❌ Error fetching data: ${err.response?.data?.error?.message || err.message}`, event.threadID, event.messageID);
    }
  }
};
