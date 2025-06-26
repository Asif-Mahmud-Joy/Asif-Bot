const axios = require('axios');

module.exports = {
  config: {
    name: "define",
    version: "1.0",
    author: "Asif",
    countDown: 5,
    role: 0,
    shortDescription: "Word definitions and meanings",
    longDescription: "Retrieve comprehensive definitions, synonyms, examples, and more for English words from multiple dictionary sources",
    category: "info",
    guide: "{pn} [word] or {pn} [word] -[source] (collegiate|thesaurus|medical|spanish|learners)"
  },
  onStart: async function ({ api, event, args }) {
    if (args.length < 1) {
      return api.sendMessage("Please provide a word to look up. Usage: /define [word] or /define [word] -[source]", event.threadID, event.messageID);
    }

    // Parse arguments for source specification
    let word = args.join(" ");
    let source = "dictionaryapi"; // default source
    const sourceMatch = word.match(/ -(\w+)$/);
    
    if (sourceMatch) {
      source = sourceMatch[1];
      word = word.replace(/ -\w+$/, '').trim();
    }

    if (!word) {
      return api.sendMessage("Please provide a valid word to look up.", event.threadID, event.messageID);
    }

    try {
      let result;
      
      // Try the primary API first
      try {
        result = await fetchFromPrimaryAPI(word);
      } catch (primaryError) {
        console.log("Primary API failed, trying fallback...");
        result = await fetchFromFallbackAPI(word, source);
      }

      if (!result) {
        return api.sendMessage(`No definitions found for "${word}".`, event.threadID, event.messageID);
      }

      api.sendMessage(result, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage(`An error occurred while fetching the definition for "${word}". Please try again later.`, event.threadID, event.messageID);
    }
  }
};

async function fetchFromPrimaryAPI(word) {
  const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  
  if (!response.data || response.data.length === 0) {
    throw new Error("No data from primary API");
  }

  const entry = Array.isArray(response.data) ? response.data[0] : response.data;
  return formatPrimaryResult(entry, word);
}

async function fetchFromFallbackAPI(word, source) {
  const apiMap = {
    collegiate: `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(word)}?key=your-api-key`,
    thesaurus: `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(word)}?key=your-api-key`,
    spanish: `https://www.dictionaryapi.com/api/v3/references/spanish/json/${encodeURIComponent(word)}?key=your-api-key`,
    medical: `https://www.dictionaryapi.com/api/v3/references/medical/json/${encodeURIComponent(word)}?key=your-api-key`,
    learners: `https://www.dictionaryapi.com/api/v3/references/learners/json/${encodeURIComponent(word)}?key=your-api-key`,
    dictionaryapi: `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
  };

  const apiUrl = apiMap[source] || apiMap.dictionaryapi;
  
  try {
    const response = await axios.get(apiUrl);
    return formatFallbackResult(response.data, word, source);
  } catch (error) {
    console.error(`Fallback API (${source}) failed:`, error);
    throw error;
  }
}

function formatPrimaryResult(entry, word) {
  let message = `📖 𝗗𝗘𝗙𝗶𝗡𝗜𝗧𝗜𝗢𝗡 𝗢𝗙: ${word.toUpperCase()}\n\n`;

  if (entry.phonetics && entry.phonetics.length > 0) {
    const phonetics = entry.phonetics.filter(p => p.text).map(p => p.text).join(' or ');
    message += `🔊 𝗣𝗛𝗢𝗡𝗘𝗧𝗜𝗖: ${phonetics}\n`;
    
    const audio = entry.phonetics.find(p => p.audio)?.audio;
    if (audio) {
      message += `🎧 𝗣𝗥𝗢𝗡𝗨𝗡𝗖𝗜𝗔𝗧𝗜𝗢𝗡: ${audio}\n`;
    }
  }

  if (entry.origin) {
    message += `🌍 𝗢𝗥𝗜𝗚𝗜𝗡: ${entry.origin}\n\n`;
  }

  if (entry.meanings && entry.meanings.length > 0) {
    message += "📚 𝗠𝗘𝗔𝗡𝗜𝗡𝗚𝗦:\n";
    
    entry.meanings.forEach((meaning, index) => {
      message += `\n❖ ${meaning.partOfSpeech || 'unknown'}\n`;
      
      if (meaning.definitions && meaning.definitions.length > 0) {
        meaning.definitions.slice(0, 3).forEach((def, defIndex) => {
          message += `  ⇨ ${def.definition}\n`;
          if (def.example) {
            message += `     ✦ Example: "${def.example}"\n`;
          }
          if (def.synonyms && def.synonyms.length > 0) {
            message += `     ✦ Synonyms: ${def.synonyms.slice(0, 5).join(', ')}\n`;
          }
        });
      }
    });
  } else {
    message += "No meanings found for this word.\n";
  }

  return message;
}

function formatFallbackResult(data, word, source) {
  let message = `📖 𝗗𝗘𝗙𝗜𝗡𝗜𝗧𝗜𝗢𝗡 𝗢𝗙: ${word.toUpperCase()} (Source: ${source.toUpperCase()})\n\n`;
  
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return `No definitions found for "${word}" in the ${source} dictionary.`;
  }

  // Handle different API response formats
  if (source === 'collegiate' || source === 'learners') {
    const entry = data[0];
    if (entry.shortdef) {
      message += "📚 𝗗𝗘𝗙𝗜𝗡𝗜𝗧𝗜𝗢𝗡𝗦:\n";
      entry.shortdef.forEach((def, i) => {
        message += `  ${i + 1}. ${def}\n`;
      });
    }
  } else if (source === 'thesaurus') {
    const entry = data[0];
    if (entry.meta) {
      message += `🔊 𝗦𝗧𝗘𝗠: ${entry.meta.stems[0]}\n`;
    }
    if (entry.meta.syns) {
      message += "\n🌈 𝗦𝗬𝗡𝗢𝗡𝗬𝗠𝗦:\n";
      entry.meta.syns[0].slice(0, 10).forEach(syn => {
        message += `  • ${syn}\n`;
      });
    }
    if (entry.meta.ants) {
      message += "\n🚫 𝗔𝗡𝗧𝗢𝗡𝗬𝗠𝗦:\n";
      entry.meta.ants[0].slice(0, 5).forEach(ant => {
        message += `  • ${ant}\n`;
      });
    }
  } else if (source === 'medical') {
    message += "⚕️ 𝗠𝗘𝗗𝗜𝗖𝗔𝗟 𝗗𝗘𝗙𝗜𝗡𝗜𝗧𝗜𝗢𝗡:\n";
    if (Array.isArray(data)) {
      data.slice(0, 3).forEach(item => {
        message += `  • ${item.def[0].sseq[0][0][1].dt[0][1]}\n`;
      });
    }
  } else {
    // Default formatting for unknown sources
    message += JSON.stringify(data, null, 2);
  }

  return message;
}
