const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: "logo",
    aliases: ["logos", "texpro"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "Generate logos with text",
    longDescription: "Create custom logos using various styles. Supports Bangla and English text.",
    category: "logo",
    guide: "{pn} list <page> | {pn} <logo type> <text>"
  },
  onStart: async function ({ api, event, args, Users }) {
    let { messageID, senderID, threadID } = event;

    // Display logo list
    if (args.length >= 2 && args[0].toLowerCase() === "list") {
      let page = parseInt(args[1]);
      switch (page) {
        case 1:
          return api.sendMessage(
            `╔════ஜ۩۞۩ஜ═══╗\n\n**Logo List - Page 1**:\n\n` +
            `- aglitch\n- blackpink\n- blood\n- broken\n- business\n- carbon\n- christmas\n- circuit\n- devil\n- discovery\n- dropwater\n- fire\n- glass\n- greenhorror\n- light\n- magma\n- metallic\n- neon\n- skeleton\n- sketch\n- stone\n- transformers\n- wall\n\n` +
            `**Page 1 of 3**\n\n╚════ஜ۩۞۩ஜ═══╝`,
            threadID,
            messageID
          );
        case 2:
          return api.sendMessage(
            `╔════ஜ۩۞۩ஜ═══╗\n\n**Logo List - Page 2**:\n\n` +
            `- naruto\n- dragonfire\n- pubgavatar\n- nightstars\n- sunlight\n- cloud\n- pig\n- caper\n- horror\n- teamlogo\n- queen\n- beach\n- tatto\n- oceansea\n- lovemsg\n- christmas2\n- butterfly\n- coffee\n- love\n\n` +
            `**Page 2 of 3**\n\n╚════ஜ۩۞۩ஜ═══╝`,
            threadID,
            messageID
          );
        case 3:
          return api.sendMessage(
            `╔════ஜ۩۞۩ஜ═══╗\n\n**Logo List - Page 3**:\n\n` +
            `- smoke\n\n` +
            `**Page 3 of 3**\n\n╚════ஜ۩۞۩ஜ═══╝`,
            threadID,
            messageID
          );
        default:
          return api.sendMessage(
            `╔════ஜ۩۞۩ஜ═══╗\n\nInvalid page number! Use "logo list 1", "logo list 2", or "logo list 3".\n\n╚════ஜ۩۞۩ஜ═══╝`,
            threadID,
            messageID
          );
      }
    }

    // Validate input
    if (args.length < 2) {
      return api.sendMessage(
        `╔════ஜ۩۞۩ஜ═══╗\n\nInvalid format! Use: "logo list <page>" or "logo <type> <text>"\n\n╚════ஜ۩۞۩ஜ═══╝`,
        threadID,
        messageID
      );
    }

    let type = args[0].toLowerCase();
    let text = args.slice(1).join(" ");
    let pathImg = __dirname + `/cache/${type}_${Date.now()}.png`; // Unique filename to avoid conflicts
    let apiUrl, message;

    // Define logo types and their APIs
    switch (type) {
      case "glass":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/glass?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [GLASS] Logo created:";
        break;
      case "business":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/business?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [BUSINESS] Logo created:";
        break;
      case "wall":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/wall?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [WALL] Logo created:";
        break;
      case "aglitch":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/aglitch?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}&text2=${encodeURIComponent(text)}`;
        message = "Here's the [AGLITCH] Logo created:";
        break;
      case "blackpink":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/blackpink?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [BLACKPINK] Logo created:";
        break;
      case "blood":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/blood?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [BLOOD] Logo created:";
        break;
      case "broken":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/broken?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [BROKEN] Logo created:";
        break;
      case "smoke":
        apiUrl = `https://api.lolhuman.xyz/api/photooxy1/smoke?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [SMOKE] Logo created:";
        break;
      case "christmas":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/christmas?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [CHRISTMAS] Logo created:";
        break;
      case "circuit":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/circuit?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [CIRCUIT] Logo created:";
        break;
      case "devil":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/devil?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [DEVIL] Logo created:";
        break;
      case "discovery":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/discovery?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [DISCOVERY] Logo created:";
        break;
      case "dropwater":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/dropwater?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [DROPWATER] Logo created:";
        break;
      case "fire":
        apiUrl = `https://api.lolhuman.xyz/api/photooxy1/flaming?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [FIRE] Logo created:";
        break;
      case "greenhorror":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/greenhorror?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [GREENHORROR] Logo created:";
        break;
      case "light":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/light?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [LIGHT] Logo created:";
        break;
      case "magma":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/magma?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [MAGMA] Logo created:";
        break;
      case "metallic":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/metallic?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [METALLIC] Logo created:";
        break;
      case "neon":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/neon?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [NEON] Logo created:";
        break;
      case "skeleton":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/skeleton?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [SKELETON] Logo created:";
        break;
      case "sketch":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/sketch?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [SKETCH] Logo created:";
        break;
      case "stone":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/stone?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [STONE] Logo created:";
        break;
      case "transformers":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/transformer?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [TRANSFORMERS] Logo created:";
        break;
      case "naruto":
        apiUrl = `https://api.lolhuman.xyz/api/photooxy1/naruto?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [NARUTO] Logo created:";
        break;
      case "dragonfire":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/dragonfire?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [DRAGONFIRE] Logo created:";
        break;
      case "pubgavatar":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/pubgavatar?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [PUBGAVATAR] Logo created:";
        break;
      case "nightstars":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/nightstars?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [NIGHTSTARS] Logo created:";
        break;
      case "sunlight":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/sunlight?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [SUNLIGHT] Logo created:";
        break;
      case "cloud":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/cloud?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [CLOUD] Logo created:";
        break;
      case "pig":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/pig?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [PIG] Logo created:";
        break;
      case "caper":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/caper?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [CAPER] Logo created:";
        break;
      case "horror":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/horror?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [HORROR] Logo created:";
        break;
      case "teamlogo":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/teamlogo?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [TEAMLOGO] Logo created:";
        break;
      case "queen":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/queen?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [QUEEN] Logo created:";
        break;
      case "beach":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/beach?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [BEACH] Logo created:";
        break;
      case "tatto":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/tatto?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [TATTO] Logo created:";
        break;
      case "oceansea":
        apiUrl = `https://api.lolhuman.xyz/api/photooxy/oceansea?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [OCEANSEA] Logo created:";
        break;
      case "lovemsg":
        apiUrl = `https://api.lolhuman.xyz/api/photooxy/lovemessage?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [LOVEMSG] Logo created:";
        break;
      case "christmas2":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/christmas2?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [CHRISTMAS2] Logo created:";
        break;
      case "butterfly":
        apiUrl = `https://api.lolhuman.xyz/api/photooxy/butterfly?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [BUTTERFLY 🦋] Logo created:";
        break;
      case "coffee":
        apiUrl = `https://api.lolhuman.xyz/api/photooxy/coffecup?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [COFFEE] Logo created:";
        break;
      case "love":
        apiUrl = `https://api.lolhuman.xyz/api/ephoto/lovetext?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [LOVE] Logo created:";
        break;
      case "carbon":
        apiUrl = `https://api.lolhuman.xyz/api/textprome/carbon?apikey=0a637f457396bf3dcc21243b&text=${encodeURIComponent(text)}`;
        message = "Here's the [CARBON] Logo created:";
        break;
      default:
        return api.sendMessage(
          `╔════ஜ۩۞۩ஜ═══╗\n\nInvalid logo type! Use "logo list 1" to see available options.\n\n╚════ஜ۩۞۩ஜ═══╝`,
          threadID,
          messageID
        );
    }

    try {
      // Fetch the image from the API
      let response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      if (!response.data || response.status !== 200) {
        throw new Error("API returned no valid data.");
      }

      // Save the image to cache
      fs.writeFileSync(pathImg, Buffer.from(response.data, "binary"));

      // Send the image with a message
      return api.sendMessage(
        {
          attachment: fs.createReadStream(pathImg),
          body: message
        },
        threadID,
        () => fs.unlinkSync(pathImg) // Clean up after sending
      );
    } catch (err) {
      console.error(err);
      let errorMsg = "An error occurred while generating the logo.";
      if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
        errorMsg = "Network error: Unable to connect to the API. Check your internet.";
      } else if (err.message.includes("API")) {
        errorMsg = "API error: The logo service might be down.";
      }
      return api.sendMessage(
        `╔════ஜ۩۞۩ஜ═══╗\n\n${errorMsg}\n\n╚════ஜ۩۞۩ஜ═══╝`,
        threadID,
        messageID
      );
    }
  },
};
