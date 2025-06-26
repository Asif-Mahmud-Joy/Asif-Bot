const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ramos",
    aliases: ["don"],
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send picture of Ramos",
      bn: "Ramos er akta pic pathano hobe",
      banglish: "Ramos-er pic pathano hobe"
    },
    longDescription: {
      en: "Sends a random picture of football legend Ramos",
      bn: "Football legend Ramos er random akta picture pathano hobe",
      banglish: "Football legend Ramos-er ekta random picture pathano hobe"
    },
    category: "football",
    guide: {
      en: "{pn}",
      bn: "{pn}",
      banglish: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    const links = [
      "https://i.imgur.com/BRuM5hi.jpg",
      "https://i.imgur.com/zB45Tjq.jpg",
      "https://i.imgur.com/23CvexD.jpg",
      "https://i.imgur.com/xyL8y6V.jpg",
      "https://i.imgur.com/3a5ZdSx.jpg",
      "https://i.imgur.com/KqOXCkN.jpg",
      "https://i.imgur.com/Ti0wDXc.jpg",
      "https://i.imgur.com/tbX8CxB.jpg",
      "https://i.imgur.com/KxAcDXQ.jpg",
      "https://i.imgur.com/zj4l1YD.jpg",
      "https://i.imgur.com/mj92wlj.jpg",
      "https://i.imgur.com/Cpb9LTe.jpg",
      "https://i.imgur.com/EmCCFDI.jpg",
      "https://i.imgur.com/ov6R5zE.jpg",
      "https://i.imgur.com/0yjhfIM.jpg",
      "https://i.imgur.com/JMhwt57.jpg",
      "https://i.imgur.com/WFKnSrZ.jpg",
      "https://i.imgur.com/ATiXOrS.jpg",
      "https://i.imgur.com/jZuG1I9.jpg",
      "https://i.imgur.com/YV3QQIi.jpg",
      "https://i.imgur.com/8bnxdc2.jpg",
      "https://i.imgur.com/jahexN4.jpg",
      "https://i.imgur.com/fjNkjZT.jpg"
    ];

    const selectedImg = links[Math.floor(Math.random() * links.length)];

    try {
      const msg = {
        body: "🏆 Here Comes The Best Wall⚡️🐐 (Ramos Edition)",
        attachment: await global.utils.getStreamFromURL(selectedImg)
      };
      message.send(msg);
    } catch (error) {
      console.error("Failed to send Ramos image:", error);
      message.send("❌ Could not load Ramos pic. Please try again later.");
    }
  }
};
