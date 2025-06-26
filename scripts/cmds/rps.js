/**
 * Rock-Paper-Scissors GoatBot Command
 * Supports both text and emoji options.
 * Auto language detection for EN + Banglish hints
 */

module.exports = {
  config: {
    name: "rps",
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    shortDescription: "Rock-paper-scissors game (emoji & text supported)",
    category: "fun",
    guide: "{prefix}rps <rock|paper|scissors> or <✊|✋|✌️>"
  },

  onStart: async function ({ message, args }) {
    const textChoices = ["rock", "paper", "scissors"];
    const emojiChoices = ["✊", "✋", "✌️"];

    const fullMap = {
      "rock": "✊",
      "paper": "✋",
      "scissors": "✌️",
      "✊": "rock",
      "✋": "paper",
      "✌️": "scissors"
    };

    const userInput = args[0]?.toLowerCase();
    if (!userInput || (!textChoices.includes(userInput) && !emojiChoices.includes(userInput))) {
      return message.reply("Please choose: rock, paper, scissors or ✊, ✋, ✌️");
    }

    const userChoice = fullMap[userInput];
    const botChoice = textChoices[Math.floor(Math.random() * 3)];

    const userEmoji = fullMap[userChoice];
    const botEmoji = fullMap[botChoice];

    let result;
    if (userChoice === botChoice) {
      result = "It's a tie! ⚖️";
    } else if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper")
    ) {
      result = "🎉 You win! Besh bhalo khelsi!";
    } else {
      result = "😎 I win! Next bar try koro!";
    }

    return message.reply(
      `You chose: ${userEmoji} (${userChoice})\nI chose: ${botEmoji} (${botChoice})\n\n${result}`
    );
  }
};
