// Expanded autoreact module with 85+ lines of Banglish keywords support
module.exports = {
  config: {
    name: "autoreact",
    version: "2",
    author: "Mr.Smokey",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Auto emoji reactions",
      bn: "স্বয়ংক্রিয় ইমোজি প্রতিক্রিয়া"
    },
    longDescription: {
      en: "Bot reacts to specific messages with emojis.",
      bn: "বট নির্দিষ্ট বার্তাগুলিতে ইমোজি দিয়ে প্রতিক্রিয়া জানায়।"
    },
    category: "fun",
    guide: {
      en: "Type Banglish phrases like 'ami tomake bhalobashi', 'valo aso', or 'pagol tui' to see emoji reactions.",
      bn: "'ami tomake bhalobashi', 'valo aso', 'pagol tui' ইত্যাদি লিখলেই বট ইমোজি দিয়ে প্রতিক্রিয়া জানাবে।"
    }
  },

  onStart: async function () {},

  onChat: async function ({ event, api }) {
    const body = event.body?.toLowerCase();
    if (!body) return;

    const reactions = [
      { keywords: ["ami tomake bhalobashi", "valobashi", "bhalobashi re"], emoji: "😙" },
      { keywords: ["shuvo ratri", "shuvo sokal", "shuvo bikal", "shuvo sondha", "bhalo ratri", "good night"], emoji: "💗" },
      { keywords: ["pagol", "kharap chehara", "gali", "boka", "gadha", "moron"], emoji: "😠" },
      { keywords: ["chu", "kiss de", "mua", "muaaaa"], emoji: "💗" },
      { keywords: ["dukho", "dukhi", "kosto", "mon kharap", "dushchinta"], emoji: "😢" },
      { keywords: ["hashi", "majadar", "khub moja", "lol", "haha", "funny", "hashi peyeche"], emoji: "😆" },
      { keywords: ["oshobhyo", "kichu vul kotha", "obhodro", "ashobhyo", "fuck you", "bad language"], emoji: "😳" },
      { keywords: ["hi", "hello", "kemon aso", "kamon aso", "ki khobor"], emoji: "💗" },
      { keywords: ["wait korchi", "zope", "wait", "kichu bolar ache"], emoji: "⏳" },
      { keywords: ["nijer ghor", "flirty", "shoti", "ushnota lagche", "taap lagche"], emoji: "😏" },
      { keywords: ["chele", "baby", "bata", "kid", "sishu", "little one"], emoji: "👧" },
      { keywords: ["ghrina kori", "i hate you", "na poshondo", "birokto lagche"], emoji: "😞" },
      { keywords: ["kajer na", "bekar", "useless", "kichu hoy na", "faida nai"], emoji: "😓" },
      { keywords: ["oh amar god", "omg", "re baba", "are bapre", "arey baba re"], emoji: "😮" },
      { keywords: ["smart chele", "pogi", "handsome", "dashing", "style ache"], emoji: "😎" },
      { keywords: ["shundor", "toke miss kortesi", "i miss you", "ganda", "khub sundor"], emoji: "💗" },
      { keywords: ["dukhi", "kosto", "mon kharap", "dushchinta", "manoshik stress"], emoji: "😔" },
      { keywords: ["boka boksi", "shala", "mor ja", "get lost", "jhamela korish na"], emoji: "🤬" },
      { keywords: ["aso", "valo aso", "kichu bolbi", "kotha bol"], emoji: "😊" },
      { keywords: ["chinta korona", "thik hoye jabe", "valobashar manush", "motivation lagbe"], emoji: "💞" },
      { keywords: ["bondhu", "friend", "bestie", "soja manush"], emoji: "🤝" },
      { keywords: ["nijeke bhalo rakh", "take care", "shustho thako"], emoji: "🌸" },
      { keywords: ["tor jonno", "amar friend", "tor sathe thakbo"], emoji: "🤗" },
      { keywords: ["mon valo nei", "beshi dukkho", "kichu korte parchi na"], emoji: "🥺" },
      { keywords: ["khushi lagche", "onno rokom lagche", "beshi valo lagche"], emoji: "😁" },
      { keywords: ["tumake bhalo lage", "moner manush", "jiboner alo"], emoji: "🥰" },
      { keywords: ["shanti chai", "amar ekto shanti dorkar", "aram chai"], emoji: "🧘" },
      { keywords: ["gan sunte iccha korche", "ekta gaan dao", "music dao"], emoji: "🎵" },
      { keywords: ["khide peyechhe", "khabar dao", "khabo ki"], emoji: "🍱" },
      { keywords: ["ragi hoye gechi", "beshi rag lagche", "birokto"], emoji: "😤" },
      { keywords: ["game khelbo", "game cholbe", "valo gamer"], emoji: "🎮" },
      { keywords: ["gaan khub pochondo", "gan dao", "music chai"], emoji: "🎧" },
      { keywords: ["sotti kotha", "vul kotha bolo na", "sotter dike thako"], emoji: "🕊️" },
      { keywords: ["abeg", "beshir vab emotion", "onubhuti"] , emoji: "💫" }
    ];

    for (const { keywords, emoji } of reactions) {
      if (keywords.some(keyword => body.includes(keyword))) {
        return api.setMessageReaction(emoji, event.messageID, event.threadID);
      }
    }
  }
};
