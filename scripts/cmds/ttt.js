let games = {};
let points = {}; // Point system

function checkWinner(board) {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (const [a,b,c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every(cell => cell !== null);
}

function displayBoard(board) {
  let out = "";
  for (let i = 0; i < 9; i++) {
    out += board[i] ?? "⬛";
    out += (i + 1) % 3 === 0 ? "\n" : " ";
  }
  return out;
}

function makeBotMove(board) {
  const bot = "⭕";
  const player = "❌";

  // Try winning
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = bot;
      if (checkWinner(board)) return;
      board[i] = null;
    }
  }
  // Block player
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = player;
      if (checkWinner(board)) {
        board[i] = bot;
        return;
      }
      board[i] = null;
    }
  }
  // Else random
  const empty = board.map((v, i) => v === null ? i : -1).filter(v => v !== -1);
  const rand = empty[Math.floor(Math.random() * empty.length)];
  if (rand !== undefined) board[rand] = bot;
}

function resetGame(playerID) {
  games[playerID] = {
    board: Array(9).fill(null)
  };
}

// Optional: per-thread enable/disable. যদি দরকার না, বাকিটাই কাজ করবে /ttt start/stop logic-এ।
let gameEnabled = {}; // key: threadID, value: true/false

module.exports = {
  config: {
    name: "ttt",
    aliases: ["tictactoe"],
    version: "2.2",
    author: "Upgraded by ChatGPT",
    category: "game",
    guide: "{pn} [stop|exit]",
    shortDescription: "Play TicTacToe with bot",
  },

  // When user types prefix+ttt ...
  onStart: async function ({ event, api, args }) {
    const id = event.senderID;
    const threadID = event.threadID;
    const sub = args[0]?.toLowerCase();

    // Stop/off logic
    if (sub && ["stop", "exit", "off"].includes(sub)) {
      if (games[id]) {
        delete games[id];
        await api.sendMessage("🛑 Game stopped. আবার খেলতে টাইপ করুন: ttt", threadID);
      } else {
        // যদি আগে কখনো গেম ছিল না, নীরব থাকতে চাইলে নিচের লাইন কমেন্ট করতে পারো:
        await api.sendMessage("কোন active game নেই। খেলতে টাইপ করুন: ttt", threadID);
      }
      return;
    }

    // Start নতুন গেম
    resetGame(id);
    if (!points[id]) points[id] = { win: 0, draw: 0, lose: 0 };

    const msg = `🎮 Let's play TicTacToe!
You're ❌, Bot is ⭕
Reply with number 1-9

Current Score:
✅ Wins: ${points[id].win}
🤝 Draws: ${points[id].draw}
❌ Losses: ${points[id].lose}

To stop the game: type "ttt stop"`;

    await api.sendMessage(msg, threadID);
    await api.sendMessage(displayBoard(games[id].board), threadID);
  },

  // onChat: শুধুমাত্র 1-9 move process করবে; অন্যসব মেসেজে নীরব থাকবে
  onChat: async function ({ event, api }) {
    const id = event.senderID;
    const threadID = event.threadID;
    const text = event.body?.trim();

    // শুধু single digit 1-9 হলে process
    if (!/^[1-9]$/.test(text)) return;

    // যদি কিন্তু session নাই, নীরব: কোন “Start the game first” মেসেজ দেব না
    if (!games[id]) return;

    const pos = parseInt(text);
    if (games[id].board[pos - 1]) {
      // যদি সেল ভর্তি থাকে, শুধু “Invalid move” দেখাব
      return api.sendMessage("❗ Invalid move. Try a number (1-9) in an empty cell.", threadID);
    }

    // ইউজারের move
    games[id].board[pos - 1] = "❌";

    // Check user win
    let winner = checkWinner(games[id].board);
    if (winner) {
      points[id].win++;
      await api.sendMessage(displayBoard(games[id].board), threadID);
      delete games[id]; // game over
      return api.sendMessage("🎉 You win! 🎉", threadID);
    }
    // Check draw
    if (isBoardFull(games[id].board)) {
      points[id].draw++;
      await api.sendMessage(displayBoard(games[id].board), threadID);
      delete games[id];
      return api.sendMessage("🤝 It's a draw!", threadID);
    }
    // Bot move
    makeBotMove(games[id].board);

    winner = checkWinner(games[id].board);
    if (winner) {
      points[id].lose++;
      await api.sendMessage(displayBoard(games[id].board), threadID);
      delete games[id];
      return api.sendMessage("😢 You lost!", threadID);
    }
    if (isBoardFull(games[id].board)) {
      points[id].draw++;
      await api.sendMessage(displayBoard(games[id].board), threadID);
      delete games[id];
      return api.sendMessage("🤝 It's a draw!", threadID);
    }
    // Continue game
    await api.sendMessage(displayBoard(games[id].board), threadID);
  },
};
