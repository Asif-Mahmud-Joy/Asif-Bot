// This is the "Ultra Pro Max" version of the 'nsfw' command.
// It replaces dangerous synchronous I/O with safe, asynchronous methods.
// It introduces a user request system with admin notifications, a complete UI/UX overhaul, and a robust, lock-protected architecture.

const fs = require('fs-extra');
const path = require('path');

// --- CONSTANTS ---
const CACHE_DIR = path.join(__dirname, 'cache'); // Standardized cache directory
const APPROVED_PATH = path.join(CACHE_DIR, 'nsfw_approved.json');
const PENDING_PATH = path.join(CACHE_DIR, 'nsfw_pending.json');

// --- LOCKING MECHANISM (For safe, concurrent file access) ---
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

// --- HELPER FUNCTION ---
async function readData() {
    return Promise.all([
        fs.readJson(APPROVED_PATH),
        fs.readJson(PENDING_PATH)
    ]);
}

module.exports = {
  config: {
    name: 'nsfw',
    version: '2.0',
    author: 'Asif',
    cooldowns: 5,
    role: 0, // Role 0 to allow 'request' subcommand for everyone
    category: 'system',
    shortDescription: { en: 'Manage NSFW command access.' },
    longDescription: { en: 'A system for users to request, and admins to approve/deny, access to NSFW commands.' },
    guide: { en: 
        "Admin:\n" +
        "• {p}{n} approve <id> [msg] - Approve a thread.\n" +
        "• {p}{n} deny <id> [reason] - Deny a pending request.\n" +
        "• {p}{n} remove <id> [reason] - Revoke access.\n" +
        "• {p}{n} list [approved|pending] - List threads.\n\n" +
        "User:\n" +
        "• {p}{n} request - Request NSFW access for your group."
    }
  },

  onLoad: async function() {
    await fs.ensureFile(APPROVED_PATH);
    await fs.ensureFile(PENDING_PATH);
    if ((await fs.readFile(APPROVED_PATH, 'utf8')).trim() === '') await fs.writeJson(APPROVED_PATH, []);
    if ((await fs.readFile(PENDING_PATH, 'utf8')).trim() === '') await fs.writeJson(PENDING_PATH, []);
  },

  onStart: async function({ api, event, args, GoatBot }) {
    const { threadID, messageID, senderID } = event;
    const subCommand = (args[0] || '').toLowerCase();
    
    // --- USER-FACING REQUEST COMMAND ---
    if (subCommand === 'request') {
        await lock.acquire();
        try {
            const [approved, pending] = await readData();
            if (approved.includes(threadID)) return api.sendMessage("✅ This thread already has NSFW access.", threadID, messageID);
            if (pending.includes(threadID)) return api.sendMessage("⏳ Your request is already pending. An admin will review it soon.", threadID, messageID);

            pending.push(threadID);
            await fs.writeJson(PENDING_PATH, pending, { spaces: 2 });

            api.sendMessage("✅ Your request for NSFW access has been sent to the bot admins.", threadID, messageID);
            
            const threadInfo = await api.getThreadInfo(threadID);
            const userName = (await api.getUserInfo(senderID))[senderID].name;
            const adminMessage = 
                `🔞 New NSFW Access Request 🔞\n\n` +
                `Group: ${threadInfo.threadName}\n` +
                `ID: ${threadID}\n` +
                `From: ${userName}\n\n` +
                `To approve, use:\nnsfw approve ${threadID}`;
            
            GoatBot.config.admins.forEach(adminId => api.sendMessage(adminMessage, adminId));
        } finally {
            lock.release();
        }
        return;
    }

    // --- ADMIN-ONLY COMMANDS ---
    if (!GoatBot.config.admins.includes(senderID)) {
      return api.sendMessage("You do not have permission for this administrative action.", threadID, messageID);
    }
    
    await lock.acquire();
    try {
      const [approved, pending] = await readData();
      const targetID = args[1];
      const reason = args.slice(2).join(" ") || "No reason provided.";

      switch (subCommand) {
        case 'approve': {
          if (!targetID) return api.sendMessage("Please provide a thread ID to approve.", threadID, messageID);
          if (approved.includes(targetID)) return api.sendMessage(`Thread ${targetID} is already approved.`, threadID, messageID);

          const approvalMsg = `
            ╔═══════ Bot Notice ═══════╗
            │
            │      🎉 Request Approved 🎉
            │
            ├─ Your group now has access
            │  to all NSFW commands.
            │
            ├─ Admin Message: ${reason}
            │
            ╚══ Please use responsibly ══╝`;
          
          api.sendMessage(approvalMsg, targetID, async (err) => {
            if (err) return api.sendMessage(`Failed to notify thread ${targetID}. Approval aborted.`, threadID, messageID);
            
            await fs.writeJson(APPROVED_PATH, [...approved, targetID], { spaces: 2 });
            await fs.writeJson(PENDING_PATH, pending.filter(id => id !== targetID), { spaces: 2 });
            api.sendMessage(`✅ Successfully approved NSFW access for thread ${targetID}.`, threadID, messageID);
          });
          break;
        }
        case 'deny': {
          if (!targetID) return api.sendMessage("Please provide a thread ID to deny.", threadID, messageID);
          if (!pending.includes(targetID)) return api.sendMessage(`Thread ${targetID} is not in the pending list.`, threadID, messageID);
            
          const denyMsg = `
            ╔════ Bot Notice ════╗
            │
            ├─ Your request for NSFW
            │  access has been denied.
            │
            ├─ Reason: ${reason}
            │
            ╚═══════════════════╝`;
            
          api.sendMessage(denyMsg, targetID);
          await fs.writeJson(PENDING_PATH, pending.filter(id => id !== targetID), { spaces: 2 });
          api.sendMessage(`🚫 Denied NSFW request for thread ${targetID}.`, threadID, messageID);
          break;
        }
        case 'remove': {
          if (!targetID) return api.sendMessage("Please provide a thread ID to remove.", threadID, messageID);
          if (!approved.includes(targetID)) return api.sendMessage(`Thread ${targetID} is not approved.`, threadID, messageID);

          const removeMsg = `
            ╔═════ Bot Notice ═════╗
            │
            ├─ Your group's access to
            │  NSFW commands has been
            │  revoked by an admin.
            │
            ├─ Reason: ${reason}
            │
            ╚═ Contact an admin for info ═╝`;
            
          api.sendMessage(removeMsg, targetID);
          await fs.writeJson(APPROVED_PATH, approved.filter(id => id !== targetID), { spaces: 2 });
          api.sendMessage(`🗑️ Removed NSFW access for thread ${targetID}.`, threadID, messageID);
          break;
        }
        case 'list': {
          const listType = (args[1] || 'approved').toLowerCase();
          const list = listType === 'pending' ? pending : approved;
          const title = listType === 'pending' ? '⏳ Pending NSFW Threads' : '✅ Approved NSFW Threads';

          if (list.length === 0) return api.sendMessage(`The ${listType} list is empty.`, threadID, messageID);
            
          let message = `╭─── ${title} ───╮\n\n`;
          for (let i = 0; i < list.length; i++) {
            try {
              const info = await api.getThreadInfo(list[i]);
              message += `│ ${i + 1}. ${info.threadName}\n│     ID: ${list[i]}\n`;
            } catch {
              message += `│ ${i + 1}. Unknown Thread\n│     ID: ${list[i]}\n`;
            }
          }
          message += `\n╰─── Total: ${list.length} ───╯`;
          api.sendMessage(message, threadID, messageID);
          break;
        }
        default: {
          // If no valid admin subcommand, check status for current thread
          const isApproved = approved.includes(threadID);
          api.sendMessage(`NSFW status for this thread: ${isApproved ? '✅ ON' : '❌ OFF'}`, threadID, messageID);
          break;
        }
      }
    } finally {
      lock.release();
    }
  }
};
