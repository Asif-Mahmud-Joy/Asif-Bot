const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "dalle",
    version: "2.0",
    author: "asif",
    role: 0,
    countDown: 15,
    longDescription: {
      en: "Generate images using Stable Diffusion (DALL-E alternative)"
    },
    category: "ai",
    guide: {
      en: "{pn} <prompt> - [1-4 images]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const prompt = args.join(" ");
      if (!prompt) return message.reply("❌ Please provide a prompt");
      
      message.reply("🔄 Generating your images...");

      // Create cache directory
      const cacheDir = path.join(__dirname, 'cache', 'dalle');
      await fs.ensureDir(cacheDir);
      await fs.emptyDir(cacheDir);

      // Using Replicate API (Stable Diffusion XL)
      const replicateResponse = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          input: { 
            prompt,
            num_outputs: 4, // Number of images (1-4)
            width: 1024,
            height: 1024
          }
        },
        { 
          headers: { 
            Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      const predictionId = replicateResponse.data.id;
      let generatedImages = [];
      let attempts = 0;
      const maxAttempts = 10;

      // Poll for results
      while (attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const statusCheck = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          { headers: { Authorization: `Token ${process.env.REPLICATE_API_KEY}` } }
        );

        if (statusCheck.data.status === "succeeded") {
          generatedImages = statusCheck.data.output;
          break;
        }
      }

      if (!generatedImages.length) {
        return message.reply("❌ Image generation failed or timed out");
      }

      // Download images
      const imgStreams = [];
      for (let i = 0; i < Math.min(4, generatedImages.length); i++) {
        try {
          const imgPath = path.join(cacheDir, `img_${i}.png`);
          const writer = fs.createWriteStream(imgPath);
          const response = await axios({
            url: generatedImages[i],
            method: 'GET',
            responseType: 'stream',
            timeout: 15000
          });
          response.data.pipe(writer);
          
          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
          
          imgStreams.push(fs.createReadStream(imgPath));
        } catch (e) {
          console.error(`Error downloading image ${i}:`, e);
        }
      }

      if (imgStreams.length > 0) {
        await api.sendMessage({
          body: `✅ Generated ${imgStreams.length} images for:\n"${prompt}"`,
          attachment: imgStreams
        }, event.threadID);
      } else {
        message.reply("❌ Failed to download generated images");
      }

    } catch (error) {
      console.error('Error:', error);
      message.reply(`❌ Error: ${error.message}`);
    } finally {
      // Cleanup
      try {
        await fs.remove(path.join(__dirname, 'cache', 'dalle'));
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    }
  }
};
