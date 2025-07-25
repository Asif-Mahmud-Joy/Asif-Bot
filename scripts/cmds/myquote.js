const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

module.exports = {
  config: {
    name: "myquote",
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: "quote img",
    longDescription: "Create your quoted image with stylish backgrounds",
    category: "fun",
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const input = args.join(' ').split('=');

    if (input.length !== 2) {
      api.sendMessage('📝 Use command like this:\nMyQuote [quote] = [author name]', threadID, messageID);
      return;
    }

    const [quoteText, authorName] = input.map(i => i.trim());

    if (!quoteText || !authorName) {
      api.sendMessage('❌ Quote or author missing! Example:\nMyQuote Life is short = Mr.Smokey', threadID, messageID);
      return;
    }

    try {
      const bgList = [
        'https://i.postimg.cc/G3WNFpch/7b6eb20bccd6d9d97027e0e0650e350e.jpg',
        'https://i.postimg.cc/kMQNHMQ5/87ee51adca4b4c74b5d97089d67159d0.jpg',
        'https://i.postimg.cc/Kj01yWc0/a974ffafa41e455bcaea2299119dadfc.jpg',
        'https://i.postimg.cc/3Jy8RNt8/8fad3805fb3efb7bcff8548ff4221578.jpg',
        'https://i.postimg.cc/d0QtJBXX/cc96260ae6a0ff546a6dd1bb768cdec8.jpg',
        'https://i.postimg.cc/cCypL1CH/20264bf8afa0f50fa5438a7c54e8ea66.jpg',
        'https://i.postimg.cc/zfH2Hm9R/bdf07420724bebac14e6265d3c7af289.jpg',
        'https://i.postimg.cc/zBcftgxQ/9b54a151021d03ef1f0c66c7990bd932.jpg',
        'https://i.postimg.cc/qMXN0zqN/744f898fa054f4fe858586ae8d75fca1.jpg',
        'https://i.postimg.cc/jdKj8tct/dbe1d5f1fe60b51f693f801da1e0b41a.jpg',
        'https://i.postimg.cc/SsCyrvzn/165a712429c6fd2a87be9ee62a184591.jpg',
        'https://i.postimg.cc/26RYV7Xr/a5777f6a212c2479b7186c3c2587239b.jpg',
        'https://i.postimg.cc/R0f55nC8/0862e19e74bd77275d1742009f3262fd.jpg',
        'https://i.postimg.cc/ry9d2DKK/423cab6ce6fc5f88a7c87ff1d0c44710.jpg',
        'https://i.postimg.cc/yx688TkW/835c7646bac895ed6f7c962b12198b3c.jpg',
        'https://i.postimg.cc/4dWTBRxN/1e021ed3df7a2bc0a32414a2147ee309.jpg',
        'https://i.postimg.cc/c1zpHmKj/e24bb1e4acc51c932fbc2516afcef1b3.jpg',
        'https://i.postimg.cc/yNQHTzd6/b37aff20822079e780e40fb34b91677b.jpg',
        'https://i.postimg.cc/WbGcHZ3H/1b211280d90596a82922286f4c366627.jpg',
        'https://i.postimg.cc/v8nJ4nWZ/eb4604a0b7be1fdced9dad68768e49b0.jpg',
        'https://i.postimg.cc/NjjCk2rT/d51aaf23c403c750e78a35e82223d231.jpg',
        'https://i.postimg.cc/y6hfqymc/1876eb8d0229790e8622ed0de62b81f3.jpg',
        'https://i.postimg.cc/zvqFD4CW/1bd3f019ea943eddfb5a182eccf3e39c.jpg',
        'https://i.postimg.cc/RVsL9sN6/5987cdfd694568f4969ff7e8ad8c8775.jpg',
        'https://i.postimg.cc/C1gjJ96t/693249283f6705a6b8fd8e8ac27200de.jpg',
        'https://i.postimg.cc/Cxnk0w3X/7a597e7e1d64fcd1b000f6c113eecc44.jpg',
        'https://i.postimg.cc/DZ6b60GJ/be0128c8deb8c4c1247fb3cb297ad711.jpg',
        'https://i.postimg.cc/QxHWgXdC/249a75b4d80692e13e8f7d02e1ae7156.jpg',
        'https://i.postimg.cc/qMMQTgHj/11c38f041c5da1b64ab58525ca00f49c.jpg',
        'https://i.postimg.cc/fRVKVFLd/1836ebe991181c6af5f961f98584527f.jpg',
        'https://i.postimg.cc/4dQbCR8D/a7a385de8e59d1d031c6d0297016bc03.jpg',
        'https://i.postimg.cc/8C8hjzx8/e8ea19d5f3f4f3949402ff854d6b574c.jpg',
        'https://i.postimg.cc/Pr9DRqXL/2fb90fae9160be272365e3faaa475968.jpg',
        'https://i.postimg.cc/Dzdb0dqs/49e024d7d35c6f291b44acc089682976.jpg',
        'https://i.postimg.cc/Qtf9k8Yd/5f33dedbdddb3209ebc6d6429b17fe30.jpg',
        'https://i.postimg.cc/8knf7Cry/46c5b06a29c71e0b60a63bd188dfa10f.jpg',
        'https://i.postimg.cc/tgyYKZLg/6d009cd86d8afc920c78a1c0d019cdb0.jpg',
        'https://i.postimg.cc/xjWHsCTX/a5e241a8aef037a79ff64a031253d0a8.jpg',
        'https://i.postimg.cc/tCW68jY2/169e2ed4e09bbc94f7ac0ba3be2d0ad7.jpg',
        'https://i.postimg.cc/JzQk453X/be21b223a65c71bcd7fea98edb632697.jpg'
      ];

      const bgURL = bgList[Math.floor(Math.random() * bgList.length)];
      const bgImage = await loadImage(bgURL);

      const canvas = createCanvas(bgImage.width, bgImage.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

      ctx.font = 'bold 30px Sans-serif';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const words = quoteText.split(' ');
      const maxWidth = 360;
      const lineHeight = 40;
      const lines = [];
      let line = '';

      for (let word of words) {
        const testLine = line + word + ' ';
        const width = ctx.measureText(testLine).width;
        if (width > maxWidth) {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());

      const startY = canvas.height / 2 - (lines.length * lineHeight) / 2;
      lines.forEach((l, i) => ctx.fillText(l, canvas.width / 2, startY + i * lineHeight));

      ctx.font = 'italic 25px Serif';
      ctx.fillText(`- ${authorName}`, canvas.width / 2, canvas.height - 60);

      const outputPath = 'temp_quote.jpg';
      fs.writeFileSync(outputPath, canvas.toBuffer());

      api.sendMessage({
        body: '✅ 𝗤𝘂𝗼𝘁𝗲 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱! ✨',
        attachment: fs.createReadStream(outputPath)
      }, threadID, () => fs.unlinkSync(outputPath));

    } catch (err) {
      console.error('Image gen error:', err);
      api.sendMessage('❌ Error occurred while generating image.', threadID, messageID);
    }
  }
};
