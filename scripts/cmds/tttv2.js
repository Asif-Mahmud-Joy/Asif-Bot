// Updated and Upgraded version of your TicTacToe (tttv2) command with:
// - Points System
// - Cleaned up game logic
// - No external broken API dependencies
//
// ✅ Just plug it into your bot and it should work.

module.exports = {
  config: {
    name: "tttv2",
    aliases: ["tictactoev2"],
    version: "2.0",
    author: "Mr.Smokey[Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "play tic-tac-toe with point system"
    },
    longDescription: {
      en: "Multiplayer tic-tac-toe game with point system support"
    },
    category: "game",
    guide: "{pn} @mention"
  },

  onStart: async function ({ event, message, usersData, args }) {
    const mention = Object.keys(event.mentions);
    if (!mention[0]) return message.reply("Please mention someone to start the game.");

    if (!global.tictactoe) global.tictactoe = {};

    if (global.tictactoe[event.threadID]?.on) {
      return message.reply("A game is already in progress in this group.");
    }

    global.tictactoe[event.threadID] = {
      on: true,
      board: Array(9).fill(null),
      currentTurn: event.senderID,
      player1: { id: event.senderID, name: await usersData.getName(event.senderID), symbol: "❌" },
      player2: { id: mention[0], name: await usersData.getName(mention[0]), symbol: "⭕" },
      moveCount: 0
    };

    const game = global.tictactoe[event.threadID];
    const boardDisplay = renderBoard(game.board);
    message.send(`🎮 Tic Tac Toe Game Started!
${game.player1.name} (❌) vs ${game.player2.name} (⭕)
\n${boardDisplay}\n\n${game.player1.name}'s Turn.`);
  },

  onChat: async function ({ event, message, usersData }) {
    const game = global.tictactoe?.[event.threadID];
    if (!game || !game.on) return;
    if (event.senderID !== game.currentTurn) return;

    const move = parseInt(event.body);
    if (isNaN(move) || move < 1 || move > 9) return message.reply("Please choose a number between 1 and 9.");

    if (game.board[move - 1] !== null) return message.reply("That cell is already taken. Choose another one.");

    const symbol = (event.senderID === game.player1.id) ? game.player1.symbol : game.player2.symbol;
    game.board[move - 1] = symbol;
    game.moveCount++;

    const boardDisplay = renderBoard(game.board);
    const winner = checkWinner(game.board);

    if (winner) {
      game.on = false;
      const winnerPlayer = (symbol === game.player1.symbol) ? game.player1 : game.player2;

      // Add points to the winner
      await usersData.addMoney(winnerPlayer.id, 50);
      return message.reply(`🎉 ${winnerPlayer.name} wins!
\n${boardDisplay}\n🏆 +50 points awarded!`);
    } else if (game.moveCount === 9) {
      game.on = false;
      return message.reply(`🤝 It's a draw!
\n${boardDisplay}`);
    } else {
      game.currentTurn = (game.currentTurn === game.player1.id) ? game.player2.id : game.player1.id;
      const nextPlayer = await usersData.getName(game.currentTurn);
      return message.reply(`${boardDisplay}\n\n🎮 ${nextPlayer}'s Turn`);
    }
  }
};

function renderBoard(board) {
  let result = '';
  for (let i = 0; i < 9; i++) {
    result += board[i] ? board[i] : (i + 1);
    result += ((i + 1) % 3 === 0) ? '\n' : ' | ';
  }
  return result;
}

function checkWinner(b) {
  const winCombs = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a,b_,c] of winCombs) {
    if (b[a] && b[a] === b[b_] && b[a] === b[c]) return true;
  }
  return false;
}
