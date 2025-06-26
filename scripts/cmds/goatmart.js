const axios = require("axios");

module.exports = {
  config: {
    name: "goatmart",
    aliases: ["market"],
    shortDescription: {
      en: "View items available in the market."
    },
    category: "Market",
    usage: "{p}market [itemID]",
    version: "2.0",
    role: 0,
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠"
  },

  onStart: async ({ api, event, args, message }) => {
    const serverURL = "https://goatmartapi.smokeyapi.xyz"; // ✅ Updated to stable custom API endpoint

    try {
      const prefix = event.body.split(" ")[0];

      if (!args[0]) {
        return api.sendMessage(`〘 GoatMart 〙
━━━━━━━━━━━━━━━
Available Commands:
→ ${prefix} page <page number>
→ ${prefix} code <item ID>
→ ${prefix} show <item ID>`, event.threadID);
      }

      if (args[0] === "code") {
        const itemID = args[1];
        const res = await axios.get(`${serverURL}/items/${itemID}`);
        const item = res.data;

        if (!item || !item.pastebinLink) {
          return api.sendMessage("❌ Item paoya jay nai.", event.threadID);
        }

        const rawCode = await axios.get(item.pastebinLink);

        return message.reply(`〘 GoatMart 〙
━━━━━━━━━━━━━━━
📦 Item Name: ${item.itemName}
🆔 Item ID: ${item.itemID}
📚 Type: ${item.type || 'GoatBot'}
💾 Code:
${rawCode.data}`);
      }

      if (args[0] === "page") {
        const page = parseInt(args[1]);
        if (isNaN(page) || page <= 0) return api.sendMessage("❌ Valid page number dao.", event.threadID);

        const res = await axios.get(`${serverURL}/items`);
        const items = res.data;
        const perPage = 5;
        const totalPages = Math.ceil(items.length / perPage);

        if (page > totalPages) return api.sendMessage(`❌ Page ${page} nai. Max page: ${totalPages}`, event.threadID);

        const pagedItems = items.slice((page - 1) * perPage, page * perPage);
        const list = pagedItems.map(i => `📦 ${i.itemName}
🆔 ID: ${i.itemID}
📝 ${i.description}`).join("\n\n");

        return message.reply(`〘 GoatMart - Page ${page}/${totalPages} 〙
━━━━━━━━━━━━━━━
${list}
\n📥 Use: ${prefix} [ show | code ] <item ID>`);
      }

      if (args[0] === "show") {
        const itemID = args[1];
        const res = await axios.get(`${serverURL}/items/${itemID}`);
        const item = res.data;

        if (!item) return api.sendMessage("❌ Item pawa jay nai.", event.threadID);

        return message.reply(`〘 GoatMart 〙
━━━━━━━━━━━━━━━
📦 Item Name: ${item.itemName}
🆔 Item ID: ${item.itemID}
📚 Type: ${item.type || 'GoatBot'}
📝 Description: ${item.description}
🔗 Pastebin: ${item.pastebinLink}`);
      }

      return api.sendMessage("❓ Invalid subcommand. Try 'page', 'code', or 'show'.", event.threadID);

    } catch (err) {
      console.error("[goatmart error]", err);
      return api.sendMessage(`⚠️ Somossa hoise: ${err.message}`, event.threadID);
    }
  }
};
