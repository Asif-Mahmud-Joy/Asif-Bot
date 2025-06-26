// This is the "Ultra Pro Max" version of the 'hot' command.
// It replaces dangerous synchronous I/O with safe, asynchronous methods,
// introduces a full suite of admin tools, and features a smart, non-corrupting no-repeat system.

const fs = require('fs-extra');
const path = require('path');
const { drive, getStreamFromURL } = global.utils; // Assuming these are from your global utils

// --- CONSTANTS & CACHE ---
const DATA_PATH = path.join(__dirname, 'cache', 'hot.json'); // Standardized cache directory
const sentVideosByThread = new Map(); // In-memory cache for the no-repeat feature

// --- LOCKING MECHANISM (For safe file operations) ---
class Lock {
  constructor() { this.locked = false; this.queue = []; }
  async acquire() {
    if (this.locked) { await new Promise(resolve => this.queue.push(resolve)); }
    this.locked = true;
  }
  release() {
    this.locked = false;
    if (this.queue.length > 0) { this.queue.shift()(); }
  }
}
const lock = new Lock();

module.exports = {
	config: {
		name: 'hot',
		version: '2.0',
		author: 'Asif',
		role: 0,
		shortDescription: { en: 'Manage and send custom videos.' },
		longDescription: { en: 'A full-featured system to add, send, and manage a collection of videos stored on Google Drive.' },
		category: 'media',
		guide: {
			en: 
                "User:\n" +
                "• {p}{n} send - Send a random video.\n\n" +
                "Admin:\n" +
                "• {p}{n} add - (Reply to a video) Add it to the collection.\n" +
                "• {p}{n} list - Show all video IDs.\n" +
                "• {p}{n} count - See the total number of videos.\n" +
                "• {p}{n} remove <ID> - Remove a video from the list."
		}
	},
    
    onLoad: async function() {
        await fs.ensureFile(DATA_PATH);
        if ((await fs.readFile(DATA_PATH, 'utf8')).trim() === '') {
            await fs.writeJson(DATA_PATH, []);
        }
    },

	onStart: async function ({ api, args, message, event, GoatBot }) {
        const { threadID, messageID, senderID } = event;
        const subCommand = (args[0] || 'send').toLowerCase(); // Default action is 'send'

        await lock.acquire();
        try {
            const hotData = await fs.readJson(DATA_PATH);

            switch (subCommand) {
                case 'add': {
                    if (!GoatBot.config.admins.includes(senderID)) {
                        return message.reply("You don't have permission to add videos.");
                    }
                    if (!event.messageReply?.attachments[0]?.type === 'video') {
						return message.reply('Please reply to a video to add it.');
					}
                    
                    await message.react("⏳");
					const videoUrl = event.messageReply.attachments[0].url;
					const fileName = `hot_${Date.now()}.mp4`;
					const infoFile = await drive.uploadFile(fileName, 'application/octet-stream', await getStreamFromURL(videoUrl));

                    hotData.push(infoFile.id);
					await fs.writeJson(DATA_PATH, hotData, { spaces: 2 });
                    
                    await message.react("✅");
					return message.reply(`Video added successfully! The collection now has ${hotData.length} videos.`);
                }

                case 'send': {
                    if (hotData.length === 0) return message.reply('The video collection is empty. An admin can add videos using "{p}hot add".');
                    
                    let threadSentList = sentVideosByThread.get(threadID) || [];
                    if (threadSentList.length >= hotData.length) {
                        threadSentList = []; // Reset if all videos have been sent
                    }

                    let randomVideoId;
                    let attempts = 0;
                    do {
                        randomVideoId = hotData[Math.floor(Math.random() * hotData.length)];
                        attempts++;
                    } while (threadSentList.includes(randomVideoId) && attempts < hotData.length);
                    
                    await message.react("⏳");
                    const videoStream = await drive.getFile(randomVideoId, 'stream', true);
                    
                    await message.reply({ attachment: videoStream });
                    
                    threadSentList.push(randomVideoId);
                    sentVideosByThread.set(threadID, threadSentList);
                    return message.react("✅");
                }

                case 'count': {
                    if (!GoatBot.config.admins.includes(senderID)) return;
                    return message.reply(`There are currently ${hotData.length} videos in the collection.`);
                }

                case 'list': {
                    if (!GoatBot.config.admins.includes(senderID)) return;
                    if (hotData.length === 0) return message.reply("The collection is empty.");

                    const idList = hotData.map((id, index) => `${index + 1}. ${id}`).join('\n');
                    return message.reply(`📋 List of all video IDs:\n\n${idList}`);
                }

                case 'remove': {
                    if (!GoatBot.config.admins.includes(senderID)) return;
                    const idToRemove = args[1];
                    if (!idToRemove) return message.reply("Please provide the ID of the video to remove.");

                    if (!hotData.includes(idToRemove)) return message.reply("This ID was not found in the collection.");

                    const newData = hotData.filter(id => id !== idToRemove);
                    await fs.writeJson(DATA_PATH, newData, { spaces: 2 });
                    return message.reply(`🗑️ Successfully removed ID ${idToRemove}. The collection now has ${newData.length} videos.`);
                }

                default:
                    return message.SyntaxError();
            }
        } catch (error) {
            console.error("Hot Command Error:", error);
            await message.react("❌");
            return message.reply("An error occurred while processing the command. Please check the console.");
        } finally {
            lock.release();
        }
	}
};
