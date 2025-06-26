// This is the "Ultra Pro Max" version of the thread approval system.
// Renamed to "approve" for simplicity.
// Major upgrades include a user-facing "request" system with admin notifications,
// a complete UX overhaul with beautiful formatting, and a safer, more robust architecture using try...finally for locks.

const fs = require('fs-extra');
const path = require('path');

// --- CONSTANTS ---
const CACHE_DIR = path.join(__dirname, 'cache');
const APPROVED_PATH = path.join(CACHE_DIR, 'approvedThreads.json');
const PENDING_PATH = path.join(CACHE_DIR, 'pendingThreads.json');
const LOG_DIR = path.join(__dirname, 'logs');

// --- LOCKING MECHANISM (Excellent original implementation, kept as is) ---
class Lock {
  constructor() {
    this.locked = false;
    this.queue = [];
  }
  async acquire() {
    if (this.locked) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    this.locked = true;
  }
  release() {
    this.locked = false;
    if (this.queue.length > 0) {
      this.queue.shift()();
    }
  }
}
const lock = new Lock();

// --- HELPER FUNCTIONS ---
async function logAction(action, adminId, targetThreadId) {
  await fs.ensureDir(LOG_DIR);
  const logFile = path.join(LOG_DIR, `approve-${new Date().toISOString().slice(0, 10)}.log`);
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] THREAD: ${targetThreadId} | ACTION: ${action} | ADMIN: ${adminId}\n`;
  await fs.appendFile(logFile, entry);
}

async function readData() {
    return Promise.all([
        fs.readJson(APPROVED_PATH),
        fs.readJson(PENDING_PATH)
    ]);
}

module.exports = {
  config: {
    name: 'approve',
    version: '4.0',
    author: 'Asif Mahmud',
    cooldowns: 5,
    role: 0, // Role 0 to allow the "request" subcommand for everyone. Other commands are checked internally.
    category: 'system',
    shortDescription: { en: 'Manage thread approval system.' },
    longDescription: { en: 'A comprehensive system to approve, deny, and manage bot usage in threads, featuring a request system with admin notifications.' },
    guide: { en: 
        "Admin:\n" +
        "• {p}{n} list - Show approved threads.\n" +
        "• {p}{n} pending - Show pending requests.\n" +
        "• {p}{n} <id> - Approve a thread by ID.\n" +
        "• {p}{n} del <id> - Remove a thread's approval.\n\n" +
        "User:\n" +
        "• {p}{n} request [message] - Request approval for your group."
    }
  },

  onLoad: async function() {
    // Ensure files exist on load, creating them with an empty array if not.
    await fs.ensureFile(APPROVED_PATH);
    await fs.ensureFile(PENDING_PATH);
    if ((await fs.readFile(APPROVED_PATH, 'utf8')).trim() === '') await fs.writeJson(APPROVED_PATH, []);
    if ((await fs.readFile(PENDING_PATH, 'utf8')).trim() === '') await fs.writeJson(PENDING_PATH, []);
  },

  onStart: async function({ api, event, args, GoatBot }) {
    const { threadID, messageID, senderID } = event;
    const subCommand = (args[0] || '').toLowerCase();
    const targetID = args.find(arg => /^\d+$/.test(arg)) || threadID;
    
    // --- USER-FACING REQUEST COMMAND ---
    if (subCommand === 'request') {
        await lock.acquire();
        try {
            const [approved, pending] = await readData();
            if (approved.includes(threadID)) {
                return api.sendMessage("✅ This thread is already approved.", threadID, messageID);
            }
            if (pending.includes(threadID)) {
                return api.sendMessage("⏳ Your request is already pending. An admin will review it soon.", threadID, messageID);
            }

            pending.push(threadID);
            await fs.writeJson(PENDING_PATH, pending, { spaces: 2 });

            api.sendMessage("✅ Your approval request has been sent successfully. An admin has been notified and will review it shortly.", threadID, messageID);
            
            // Notify all bot admins
            const threadInfo = await api.getThreadInfo(threadID);
            const userName = (await api.getUserInfo(senderID))[senderID].name;
            const adminMessage = 
                `🔔 New Approval Request 🔔\n\n` +
                `From Group: ${threadInfo.threadName} (${threadInfo.participantIDs.length} members)\n` +
                `Group ID: ${threadID}\n` +
                `Requested By: ${userName} (ID: ${senderID})\n\n` +
                `To approve, use:\napprove ${threadID}`;
            
            for (const admin of GoatBot.config.admins) {
                api.sendMessage(adminMessage, admin);
            }
        } finally {
            lock.release();
        }
        return;
    }

    // --- ADMIN-ONLY COMMANDS ---
    // Manually check role for admin commands.
    if (!GoatBot.config.admins.includes(senderID)) {
      return api.sendMessage("You do not have permission to use this command.", threadID, messageID);
    }
    
    await lock.acquire();
    try {
      const [approved, pending] = await readData();

      switch (subCommand) {
        case 'list': {
          if (approved.length === 0) return api.sendMessage("There are no approved threads.", threadID, messageID);
          let message = "╭─── ✅ Approved Threads ───╮\n\n";
          for (let i = 0; i < approved.length; i++) {
            try {
              const info = await api.getThreadInfo(approved[i]);
              message += `│ ${i + 1}. ${info.threadName}\n│     ID: ${approved[i]} | 👥 ${info.participantIDs.length}\n`;
            } catch {
              message += `│ ${i + 1}. Unknown Thread\n│     ID: ${approved[i]}\n`;
            }
          }
          message += `\n╰─── Total: ${approved.length} ───╯`;
          return api.sendMessage(message, threadID, messageID);
        }

        case 'pending': {
          if (pending.length === 0) return api.sendMessage("There are no pending requests.", threadID, messageID);
          let message = "╭─── ⏳ Pending Requests ───╮\n\n";
          for (let i = 0; i < pending.length; i++) {
             try {
              const info = await api.getThreadInfo(pending[i]);
              message += `│ ${i + 1}. ${info.threadName}\n│     ID: ${pending[i]} | 👥 ${info.participantIDs.length}\n`;
            } catch {
              message += `│ ${i + 1}. Unknown Thread\n│     ID: ${pending[i]}\n`;
            }
          }
          message += `\n╰─── Total: ${pending.length} ───╯`;
          return api.sendMessage(message, threadID, messageID);
        }

        case 'del': {
          const idToRemove = args[1];
          if (!idToRemove || !approved.includes(idToRemove)) return api.sendMessage(`Invalid ID or thread is not approved.`, threadID, messageID);
          
          await fs.writeJson(APPROVED_PATH, approved.filter(id => id !== idToRemove), { spaces: 2 });
          await logAction('REMOVED', senderID, idToRemove);
          return api.sendMessage(`✅ Approval removed for thread ${idToRemove}.`, threadID, messageID);
        }

        default: {
          // This handles approving a specific ID
          if (!/^\d+$/.test(targetID)) {
            return api.sendMessage(this.config.guide.en, threadID, messageID); // Show help if command is invalid
          }
          if (approved.includes(targetID)) {
            return api.sendMessage(`Thread ${targetID} is already approved.`, threadID, messageID);
          }

          api.sendMessage('✅ Your group has been approved by an admin. You can now use all bot features!', targetID, async (err) => {
            if (err) {
              return api.sendMessage(`Failed to notify thread ${targetID}. Approval aborted.`, threadID, messageID);
            }
            const newApproved = [...approved, targetID];
            const newPending = pending.filter(id => id !== targetID);
            await fs.writeJson(APPROVED_PATH, newApproved, { spaces: 2 });
            await fs.writeJson(PENDING_PATH, newPending, { spaces: 2 });
            await logAction('APPROVED', senderID, targetID);
            api.sendMessage(`✅ Successfully approved thread ${targetID}.`, threadID, messageID);
          });
          break;
        }
      }
    } catch (err) {
      console.error('Approve System Error:', err);
      api.sendMessage(`An error occurred: ${err.message}`, threadID, messageID);
    } finally {
      // This is safer and cleaner, ensuring the lock is always released.
      lock.release();
    }
  }
};
