// This is the "Ultra Pro Max" version of the command updater.
// Renamed to "massupdate" for clarity and safety.
// Major upgrades include an interactive confirmation step, flexible flag-based input,
// and more robust logic to prevent file corruption.

const fs = require('fs').promises;
const path = require('path');

// A more robust helper function to update a property in the file content.
// It handles single or double quotes and varying whitespace.
function updateProperty(content, key, value, isString = true) {
  // The regex finds the key, optional whitespace, a colon, more optional whitespace,
  // and then the value in single or double quotes (for strings) or as a number/boolean (for non-strings).
  const pattern = new RegExp(`(${key}\\s*:\\s*)(['"])?([^'"\n,}]*)(['"])?`, 'g');
  const replacement = isString ? `$1"${value}"` : `$1${value}`;
  return content.replace(pattern, replacement);
}

module.exports = {
  config: {
    name: "massupdate",
    version: "4.0", // Major safety and UX upgrade
    author: "Asif Mahmud",
    cooldowns: 20,
    role: 2, // This is a high-risk command, strictly for bot admins.
    category: "system",
    shortDescription: { en: "Safely mass-update command metadata." },
    longDescription: { en: "Interactively and safely update metadata (author, version, etc.) for all command files with confirmation." },
    guide: {
        en: 
        "Use flags to specify changes:\n" +
        "{p}{n} --author \"New Name\"\n" +
        "{p}{n} --version \"5.0.0\"\n" +
        "{p}{n} --role 1\n" +
        "{p}{n} --category \"utility\"\n\n" +
        "You can combine multiple flags."
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, senderID, messageID } = event;

    if (args.length === 0) {
        return api.sendMessage("No changes specified. Please use flags to define what to update.\n\nExample: {p}massupdate --author \"My Name\" --version \"1.0\"", threadID, messageID);
    }
    
    // Parse arguments with flags
    const changes = {};
    for (let i = 0; i < args.length; i++) {
        const flag = args[i].toLowerCase();
        const value = args[i + 1];

        if (!value || value.startsWith('--')) {
            continue; // Skip if there's no value for a flag
        }

        switch (flag) {
            case '--author':
                changes.author = value;
                i++;
                break;
            case '--version':
                changes.version = value;
                i++;
                break;
            case '--role':
                const role = parseInt(value, 10);
                if (!isNaN(role) && [0, 1, 2, 3].includes(role)) {
                    changes.role = role;
                }
                i++;
                break;
            case '--category':
                changes.category = value;
                i++;
                break;
            case '--shortdesc':
                changes.shortDescription = { en: value };
                i++;
                break;
            case '--longdesc':
                changes.longDescription = { en: value };
                i++;
                break;
        }
    }
    
    if (Object.keys(changes).length === 0) {
        return api.sendMessage("No valid changes were provided. Please check the guide.", threadID, messageID);
    }

    // --- Interactive Confirmation Step ---
    const commandsPath = path.join(__dirname, '..');
    const files = (await fs.readdir(commandsPath)).filter(f => f.endsWith('.js'));
    
    let confirmationMessage = `⚠️ **ACTION REQUIRED** ⚠️\n\nYou are about to modify **${files.length} command files**.\n\n**Proposed Changes:**\n`;
    for (const [key, value] of Object.entries(changes)) {
        confirmationMessage += `  • Set **${key}** to: **${typeof value === 'object' ? value.en : value}**\n`;
    }
    confirmationMessage += `\nThis action cannot be undone, although a backup will be created.\n\nReply with **"CONFIRM"** to proceed.`;

    return api.sendMessage(confirmationMessage, threadID, (err, info) => {
      if (err) return console.error(err);
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: senderID,
        changes: changes
      });
    });
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, senderID, body } = event;
    const { author, changes } = Reply;

    if (senderID !== author) {
        return api.sendMessage("This is not for you.", threadID, messageID);
    }

    if (body?.trim().toLowerCase() !== 'confirm') {
        api.unsendMessage(Reply.messageID);
        return api.sendMessage("Update cancelled.", threadID, messageID);
    }
    
    api.unsendMessage(Reply.messageID);
    const processingMessage = await api.sendMessage("✅ Confirmation received. Starting mass update... Please wait.", threadID);

    const commandsPath = path.join(__dirname, '..');
    const backupFolder = path.join(commandsPath, '..', `cmd_backup_${Date.now()}`);

    try {
      await fs.mkdir(backupFolder, { recursive: true });

      const jsFiles = (await fs.readdir(commandsPath)).filter(f => f.endsWith('.js'));
      let updatedCount = 0;

      for (const file of jsFiles) {
        const filePath = path.join(commandsPath, file);
        const backupPath = path.join(backupFolder, file);

        await fs.copyFile(filePath, backupPath); // Backup first

        let content = await fs.readFile(filePath, 'utf8');

        // Apply changes using the more robust function
        for (const [key, value] of Object.entries(changes)) {
            if (key === 'role') {
                content = updateProperty(content, key, value, false);
            } else if (key.includes('Description')) {
                // This is a bit more complex, regex for object needed
                const descPattern = new RegExp(`${key}:\\s*\\{\\s*en:\\s*["'].*?["']\\s*\\}`, 'g');
                content = content.replace(descPattern, `${key}: { en: "${value.en}" }`);
            } else {
                content = updateProperty(content, key, value, true);
            }
        }

        await fs.writeFile(filePath, content, 'utf8');
        updatedCount++;
      }
      
      await api.unsendMessage(processingMessage.messageID);
      
      let successMessage = `✅ **Mass Update Complete!**\n\n`;
      successMessage += `• Files updated: ${updatedCount}\n`;
      successMessage += `• Backup created at: ${path.basename(backupFolder)}\n\n`;
      successMessage += `**Applied Changes:**\n`;
      for (const [key, value] of Object.entries(changes)) {
          successMessage += `  • ${key}: ${typeof value === 'object' ? value.en : value}\n`;
      }
      successMessage += `\nIt is recommended to restart the bot to apply all changes correctly.`;

      api.sendMessage(successMessage, threadID, messageID);

    } catch (error) {
      console.error('Mass Update Error:', error);
      api.unsendMessage(processingMessage.messageID).catch(() => {});
      api.sendMessage(`❌ An error occurred during the update: ${error.message}\n\nA backup was created, but some files may not have been updated. Please check the console.`, threadID);
    }
  }
};
