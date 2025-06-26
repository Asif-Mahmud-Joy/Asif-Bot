const { exec } = require("child_process");

module.exports = {
  config: {
    name: "shell",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 2, // Only admins or developers can use this
    shortDescription: "Execute shell commands",
    longDescription: "Run shell commands on your server directly from chat (Admin-only)",
    category: "system",
    guide: {
      vi: "{p}{n} <command> - Thực thi lệnh shell (chỉ admin)",
      en: "{p}{n} <command> - Execute shell command (admin only)",
      bn: "{p}{n} <command> - Shell command chalate parben (admin chara noy)"
    }
  },

  onStart: async function ({ args, message, role }) {
    const command = args.join(" ");

    if (role < 2) {
      return message.reply("❌ You don't have permission to run shell commands.");
    }

    if (!command) {
      return message.reply("⚠️ Please provide a shell command to execute.");
    }

    exec(command, { timeout: 10000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Shell Error]`, error);
        return message.reply(`❌ Error:
${error.message}`);
      }

      if (stderr) {
        console.warn(`[Shell Stderr]`, stderr);
        return message.reply(`⚠️ Stderr:
${stderr}`);
      }

      const output = stdout.length > 18000
        ? stdout.slice(0, 18000) + "... (truncated)"
        : stdout || "✅ Command executed with no output.";

      message.reply(`✅ Output:
${output}`);
    });
  }
};
