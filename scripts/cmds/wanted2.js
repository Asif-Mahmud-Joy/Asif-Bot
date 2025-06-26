const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "wanted2",
    version: "1.1",
    author: "Mr.Smokey{Asif Mahmud})",
    countDown: 1,
    role: 0,
    shortDescription: {
      en: "wanted poster",
      bn: "ওয়ান্টেড পোস্টার তৈরি করুন"
    },
    longDescription: {
      en: "Generate a wanted poster image with a user's avatar",
      bn: "একজন ব্যবহারকারীর প্রোফাইল ছবি দিয়ে ওয়ান্টেড পোস্টার তৈরি করুন"
    },
    category: "meme",
    guide: {
      en: "{pn} [@mention | reply]",
      bn: "{pn} [@উল্লেখ করুন | রিপ্লাই দিন]"
    },
    envConfig: {
      deltaNext: 5
    }
  },

  langs: {
    vi: {
      noTag: "Vui lòng tag người bạn muốn tạo poster."
    },
    en: {
      noTag: "You must tag the person you want to create a wanted poster for."
    },
    bn: {
      noTag: "আপনাকে অবশ্যই যার জন্য পোস্টার বানাতে চান তাকে ট্যাগ করতে হবে।"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    let mention = Object.keys(event.mentions);
    let uid;

    if (event.type == "message_reply") {
      uid = event.messageReply.senderID;
    } else {
      uid = mention[0] || event.senderID;
    }

    try {
      let url = await usersData.getAvatarUrl(uid);
      let avt = await new DIG.Wanted().getImage(url);

      const pathSave = `${__dirname}/tmp/wanted.png`;
      fs.writeFileSync(pathSave, Buffer.from(avt));

      let body = mention[0] ? "NEPAL KO WANTED MANXE" : "আপনি নিজেই ওয়ান্টেড!";

      message.reply({
        body: body,
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave));

    } catch (err) {
      console.error(err);
      message.reply(getLang("noTag"));
    }
  }
};
