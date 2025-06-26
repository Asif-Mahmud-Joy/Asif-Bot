const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "postfbv2",
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Create a new post on Facebook.",
      bn: "Facebook-এ নতুন পোস্ট করুন।"
    },
    longDescription: {
      en: "Create a new post on Facebook with text, images, and video.",
      bn: "Facebook-এ টেক্সট, ছবি এবং ভিডিও সহ একটি নতুন পোস্ট তৈরি করুন।"
    },
    category: "Social",
    guide: {
      en: "{pn}: post",
      bn: "{pn}: পোস্ট"
    }
  },

  onStart: async function ({ event, api, commandName }) {
    const { threadID, messageID, senderID } = event;
    const uuid = getGUID();
    const formData = getBaseFormData(uuid, api.getCurrentUserID());

    return api.sendMessage(
      `🔐 কে দেখতে পারবে তোমার পোস্টটা?
1️⃣ সকলের জন্য
2️⃣ শুধুমাত্র বন্ধুদের জন্য
3️⃣ শুধুমাত্র নিজের জন্য`,
      threadID,
      (e, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: senderID,
          formData,
          type: "whoSee"
        });
      },
      messageID
    );
  },

  onReply: async function ({ Reply, event, api, commandName }) {
    const handleReply = Reply;
    const { type, author, formData } = handleReply;
    if (event.senderID !== author) return;

    const { threadID, messageID, attachments, body } = event;
    const botID = api.getCurrentUserID();

    const uploadAttachments = async (attachments) => {
      let uploads = [];
      for (const attachment of attachments) {
        const form = { file: attachment };
        uploads.push(
          api.httpPostFormData(
            `https://www.facebook.com/profile/picture/upload/?profile_id=${botID}&photo_source=57&av=${botID}`,
            form
          )
        );
      }
      uploads = await Promise.all(uploads);
      return uploads;
    };

    if (type === "whoSee") {
      if (!["1", "2", "3"].includes(body)) {
        return api.sendMessage('❌ উপরের তিনটি অপশন থেকে একটি বেছে নিন।', threadID, messageID);
      }
      formData.input.audience.privacy.base_state = body === "1" ? "EVERYONE" : body === "2" ? "FRIENDS" : "SELF";
      api.unsendMessage(handleReply.messageID, () => {
        api.sendMessage(`📝 এখন তোমার পোস্টের কনটেন্ট লেখো। ফাঁকা রাখতে চাইলে ০ লেখো।`, threadID, (e, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author,
            formData,
            type: "content"
          });
        }, messageID);
      });
    } else if (type === "content") {
      if (event.body !== "0") formData.input.message.text = event.body;
      api.unsendMessage(handleReply.messageID, () => {
        api.sendMessage(`📎 এখন একটি ছবি বা ভিডিও পাঠাও (একাধিক পাঠানো যাবে)। কিছু না পাঠাতে চাইলে ০ লেখো।`, threadID, (e, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author,
            formData,
            type: "media"
          });
        }, messageID);
      });
    } else if (type === "media") {
      if (event.body !== "0") {
        const allStreamFile = [];
        for (const attach of attachments) {
          if (attach.type === "photo") {
            const imageBuffer = (await axios.get(attach.url, { responseType: "arraybuffer" })).data;
            const imgPath = `${__dirname}/cache/imagePost.png`;
            fs.writeFileSync(imgPath, Buffer.from(imageBuffer));
            allStreamFile.push(fs.createReadStream(imgPath));
          } else if (attach.type === "video") {
            const videoStream = await axios.get(attach.url, { responseType: "stream" });
            const videoPath = `${__dirname}/cache/videoPost.mp4`;
            videoStream.data.pipe(fs.createWriteStream(videoPath));
            allStreamFile.push(fs.createReadStream(videoPath));
          }
        }

        const uploaded = await uploadAttachments(allStreamFile);
        for (let res of uploaded) {
          if (typeof res === "string") res = JSON.parse(res.replace("for (;;);", ""));
          if (res.payload?.fbid) {
            formData.input.attachments.push({ photo: { id: res.payload.fbid.toString() } });
          }
        }
      }

      const form = {
        av: botID,
        fb_api_req_friendly_name: "ComposerStoryCreateMutation",
        fb_api_caller_class: "RelayModern",
        doc_id: "7711610262190099",
        variables: JSON.stringify(formData)
      };

      api.httpPost("https://www.facebook.com/api/graphql/", form, (e, info) => {
        api.unsendMessage(handleReply.messageID);
        try {
          if (e) throw e;
          if (typeof info === "string") info = JSON.parse(info.replace("for (;;);", ""));
          const postID = info.data.story_create.story.legacy_story_hideable_id;
          const urlPost = info.data.story_create.story.url;
          if (!postID) throw info.errors;
          try {
            fs.unlinkSync(`${__dirname}/cache/imagePost.png`);
            fs.unlinkSync(`${__dirname}/cache/videoPost.mp4`);
          } catch (_) {}
          return api.sendMessage(`✅ পোস্ট সফলভাবে তৈরি হয়েছে!
🆔 postID: ${postID}
🔗 লিংক: ${urlPost}`, threadID, messageID);
        } catch (err) {
          return api.sendMessage(`❌ পোস্ট তৈরি ব্যর্থ হয়েছে। দয়া করে পরে আবার চেষ্টা করুন।`, threadID, messageID);
        }
      });
    }
  }
};

function getGUID() {
  let sectionLength = Date.now();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = Math.floor((sectionLength + Math.random() * 16) % 16);
    sectionLength = Math.floor(sectionLength / 16);
    return (c === "x" ? r : (r & 7) | 8).toString(16);
  });
}

function getBaseFormData(uuid, actorID) {
  return {
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
      with_tags_ids: [],
      inline_activities: [],
      explicit_place_id: "0",
      text_format_preset_id: "0",
      logging: {
        composer_session_id: uuid
      },
      tracking: [null],
      actor_id: actorID,
      client_mutation_id: Math.floor(Math.random() * 17)
    },
    displayCommentsFeedbackContext: null,
    displayCommentsContextEnableComment: null,
    displayCommentsContextIsAdPreview: null,
    displayCommentsContextIsAggregatedShare: null,
    displayCommentsContextIsStorySet: null,
    feedLocation: "TIMELINE",
    feedbackSource: 0,
    focusCommentID: null,
    gridMediaWidth: 230,
    groupID: null,
    scale: 3,
    privacySelectorRenderLocation: "COMET_STREAM",
    renderLocation: "timeline",
    useDefaultActor: false,
    inviteShortLinkKey: null,
    isFeed: false,
    isFundraiser: false,
    isFunFactPost: false,
    isGroup: false,
    isTimeline: true,
    isSocialLearning: false,
    isPageNewsFeed: false,
    isProfileReviews: false,
    isWorkSharedDraft: false,
    UFI2CommentsProvider_commentsKey: "ProfileCometTimelineRoute",
    hashtag: null,
    canUserManageOffers: false
  };
}
