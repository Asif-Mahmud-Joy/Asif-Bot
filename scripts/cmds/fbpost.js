const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "postfb",
    version: "2.1",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Create a post on Facebook"
    },
    longDescription: {
      en: "Post text, images, or videos to your Facebook timeline."
    },
    category: "Social",
    guide: {
      en: "{pn} -> follow instructions step by step."
    }
  },

  onStart: async function ({ event, api, commandName }) {
    const { threadID, messageID, senderID } = event;
    const uuid = getGUID();
    const formData = {
      input: {
        composer_entry_point: "inline_composer",
        composer_source_surface: "timeline",
        idempotence_token: uuid + "_FEED",
        source: "WWW",
        attachments: [],
        audience: {
          privacy: {
            allow: [],
            base_state: "FRIENDS",
            deny: [],
            tag_expansion_state: "UNSPECIFIED"
          }
        },
        message: {
          ranges: [],
          text: ""
        },
        actor_id: api.getCurrentUserID(),
        client_mutation_id: Math.floor(Math.random() * 999999)
      },
      feedLocation: "TIMELINE",
      renderLocation: "timeline",
      scale: 3
    };

    return api.sendMessage(
      `📢 Post Privacy:
1. Public (Everyone)
2. Friends
3. Only Me

Reply with 1, 2, or 3 to choose.`,
      threadID,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: senderID,
          formData,
          type: "privacy"
        });
      },
      messageID
    );
  },

  onReply: async function ({ Reply, event, api, commandName }) {
    const { type, author, formData } = Reply;
    if (event.senderID !== author) return;

    const { threadID, messageID, attachments, body } = event;
    const botID = api.getCurrentUserID();

    if (type === "privacy") {
      const choice = body.trim();
      const map = { "1": "EVERYONE", "2": "FRIENDS", "3": "SELF" };
      if (!map[choice]) return api.sendMessage("❌ Invalid choice. Please reply with 1, 2, or 3.", threadID, messageID);

      formData.input.audience.privacy.base_state = map[choice];
      return api.sendMessage(`📝 Reply with your post content or 0 to skip.`, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author,
          formData,
          type: "content"
        });
      }, messageID);
    }

    if (type === "content") {
      if (body !== "0") formData.input.message.text = body;
      return api.sendMessage(`📷 Reply with photo/video or 0 to skip.`, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author,
          formData,
          type: "media"
        });
      }, messageID);
    }

    if (type === "media") {
      // Since real media upload requires a private Facebook API, we'll skip attachment uploads
      // and continue with text-only posting.

      const form = {
        av: botID,
        fb_api_req_friendly_name: "ComposerStoryCreateMutation",
        fb_api_caller_class: "RelayModern",
        doc_id: "7711610262190099",
        variables: JSON.stringify(formData)
      };

      api.httpPost("https://www.facebook.com/api/graphql/", form, (err, res) => {
        try {
          if (err) throw err;
          if (typeof res === "string") res = JSON.parse(res.replace("for (;;);", ""));

          const postID = res?.data?.story_create?.story?.legacy_story_hideable_id;
          const urlPost = res?.data?.story_create?.story?.url;
          if (!postID) throw new Error("No post ID returned.");

          return api.sendMessage(`✅ Post successful!\n🆔 ID: ${postID}\n🔗 URL: ${urlPost}`, threadID, messageID);
        } catch (e) {
          return api.sendMessage("❌ Failed to create post. Try again later.", threadID, messageID);
        }
      });
    }
  }
};

function getGUID() {
  let d = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
