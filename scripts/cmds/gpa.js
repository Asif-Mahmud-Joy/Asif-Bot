const axios = require("axios");

module.exports = {
  config: {
    name: "gpa",
    aliases: ["gpacalc"],
    version: "2.2", // ✅ Fully Upgraded
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Convert GPA to percentage & letter grade",
      bn: "GPA diye percentage o letter grade ber koro"
    },
    longDescription: {
      en: "Convert GPA (0.0 to 5.0) to percentage and letter grade (Bangladesh Standard)",
      bn: "Bangladesh er system onujayi GPA theke percentage ar letter grade ber korbe"
    },
    category: "info",
    guide: {
      en: "{prefix}gpa 4.2",
      bn: "{prefix}gpa 4.2"
    }
  },

  onStart: async function ({ api, event, args }) {
    // ✅ Input validation
    if (!args[0]) {
      return api.sendMessage("❗ Please provide your GPA (0.0 - 5.0).\nউদাহরণ: gpa 4.5", event.threadID);
    }

    const userGPA = parseFloat(args[0]);

    if (isNaN(userGPA) || userGPA < 0 || userGPA > 5) {
      return api.sendMessage("⚠️ Valid GPA den (0.0 theke 5.0 er moddhe).", event.threadID);
    }

    // ✅ Calculation (Bangladesh GPA system)
    const percentage = (userGPA * 20).toFixed(2);

    let letterEquivalent = "";
    if (userGPA < 1.0) letterEquivalent = "F";
    else if (userGPA < 2.0) letterEquivalent = "D";
    else if (userGPA < 3.0) letterEquivalent = "C";
    else if (userGPA < 3.5) letterEquivalent = "B";
    else if (userGPA < 4.0) letterEquivalent = "A-";
    else if (userGPA < 5.0) letterEquivalent = "A";
    else letterEquivalent = "A+";

    // ✅ Final Response
    const response = `📘 GPA Report (🇧🇩 Bangladesh Standard)\n\n🔹 Provided GPA: ${userGPA}\n🔹 Estimated Percentage: ${percentage}%\n🔹 Letter Grade: ${letterEquivalent}`;

    api.sendMessage(response, event.threadID, event.messageID);
  }
};
