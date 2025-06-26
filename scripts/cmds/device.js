const axios = require('axios');

module.exports = {
  config: {
    name: "device",
    aliases: ["phone", "android"],
    version: "1.0",
    author: "Asif",
    countDown: 5,
    role: 0,
    shortDescription: "Get mobile phone specifications",
    longDescription: "Fetch detailed specifications of mobile phones from the database",
    category: "Utility",
    guide: {
      en: "{pn} <brand/model> or {pn} brand <brand_id> or {pn} model <phone_id>"
    }
  },

  onStart: async function ({ message, args, event }) {
    try {
      const token = "YOUR_API_TOKEN"; // Replace with your actual API token
      const baseUrl = "https://zylalabs.com/api/2281/mobile+phone+database+api";
      
      if (args[0] === "brand" && args[1]) {
        // Get phones by brand ID
        const brandId = args[1];
        const url = `${baseUrl}/2163/get+phone+by+brand?brand_id=${brandId}`;
        
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const phones = response.data;
        let messageText = `📱 Phones for Brand ID ${brandId}:\n\n`;
        
        phones.forEach(phone => {
          messageText += `• ${phone.name} (ID: ${phone.id})\n`;
        });
        
        return message.reply(messageText);
        
      } else if (args[0] === "model" && args[1]) {
        // Get phone details by phone ID
        const phoneId = args[1];
        const url = `${baseUrl}/2164/get+phone+details?phone_id=${phoneId}`;
        
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const phone = response.data;
        return formatPhoneDetails(message, phone);
        
      } else if (args[0] === "brands") {
        // List all brands
        const url = `${baseUrl}/2162/get+brands`;
        
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const brands = response.data;
        let messageText = "📱 Available Brands:\n\n";
        
        brands.forEach(brand => {
          messageText += `• ${brand.name} (ID: ${brand.id})\n`;
        });
        
        return message.reply(messageText);
        
      } else if (args.length > 0) {
        // Search for phones
        const query = args.join(" ");
        const url = `${baseUrl}/2165/search?q=${encodeURIComponent(query)}`;
        
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const results = response.data;
        
        if (results.length === 0) {
          return message.reply("No phones found matching your search.");
        } else if (results.length === 1) {
          return formatPhoneDetails(message, results[0]);
        } else {
          let messageText = `🔍 Search Results for "${query}":\n\n`;
          
          results.slice(0, 10).forEach(phone => {
            messageText += `• ${phone.name} (Brand: ${phone.brand})\n`;
            messageText += `  Model ID: ${phone.id}\n\n`;
          });
          
          if (results.length > 10) {
            messageText += `\nShowing 10 of ${results.length} results.`;
          }
          
          return message.reply(messageText);
        }
      } else {
        return message.reply("Please specify a search term, brand ID, or phone ID. Use 'help device' for usage instructions.");
      }
    } catch (error) {
      console.error(error);
      return message.reply("An error occurred while fetching phone data. Please try again later.");
    }
  }
};

function formatPhoneDetails(message, phone) {
  const form = {
    body: `📱 ${phone.brand} ${phone.name} - Full Specifications\n\n` +
          `• Brand: ${phone.brand || 'N/A'}\n` +
          `• Model: ${phone.name || 'N/A'}\n` +
          `• Release Date: ${phone.release_date || 'N/A'}\n` +
          `• Dimensions: ${phone.dimensions || 'N/A'}\n` +
          `• Weight: ${phone.weight || 'N/A'}\n` +
          `• Display: ${phone.display_type || 'N/A'}, ${phone.display_size || 'N/A'}\n` +
          `• Resolution: ${phone.resolution || 'N/A'}\n` +
          `• OS: ${phone.os || 'N/A'}\n` +
          `• Chipset: ${phone.chipset || 'N/A'}\n` +
          `• CPU: ${phone.cpu || 'N/A'}\n` +
          `• GPU: ${phone.gpu || 'N/A'}\n` +
          `• RAM: ${phone.ram || 'N/A'}\n` +
          `• Storage: ${phone.storage || 'N/A'}\n` +
          `• Main Camera: ${phone.main_camera || 'N/A'}\n` +
          `• Selfie Camera: ${phone.selfie_camera || 'N/A'}\n` +
          `• Battery: ${phone.battery || 'N/A'}\n` +
          `• Colors: ${phone.colors ? phone.colors.join(', ') : 'N/A'}\n` +
          `• Price: ${phone.price || 'N/A'}`
  };
  
  if (phone.image_url) {
    form.attachment = global.utils.getStreamFromURL(phone.image_url);
  }
  
  return message.reply(form);
}
