const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  config: {
    name: "adduser",
    version: "2.0",
    author: "NTKhang + Modified by Asif",
    countDown: 5,
    role: 1,
    description: {
      en: "Add user to group using UID, profile link, @mention, or reply"
    },
    category: "box chat",
    guide: {
      en: "{pn} [link profile | uid | @mention | reply]"
    }
  },

  langs: {
    en: {
      alreadyInGroup: "✅ This user is already in the group.",
      successAdd: "🌟 Successfully added %1 members to the group!",
      failedAdd: "❌ Failed to add %1 members:",
      approve: "⏳ %1 members sent to approval list.",
      invalidLink: "⚠️ Please provide a valid Facebook link.",
      cannotGetUid: "❌ Could not fetch UID of the user.",
      linkNotExist: "🔍 Profile link does not exist.",
      cannotAddUser: "🚫 Bot is blocked or user has restricted adding to group."
    }
  },

  onStart: async function ({ message, api, event, args, threadsData, getLang }) {
    const { members, adminIDs, approvalMode } = await threadsData.get(event.threadID);
    const botID = api.getCurrentUserID();

    const inputs = [];

    // Collect from reply
    if (event.type === "message_reply") {
      inputs.push(event.messageReply.senderID);
    }

    // Collect from mentions
    if (Object.keys(event.mentions).length > 0) {
      inputs.push(...Object.keys(event.mentions));
    }

    // Collect from args
    if (args.length > 0) {
      inputs.push(...args);
    }

    if (inputs.length === 0) {
      return message.reply("👤 Please provide UID, profile link, @mention, or reply to a user.");
    }

    const success = [
      { type: "success", uids: [] },
      { type: "waitApproval", uids: [] }
    ];
    const failed = [];

    function checkErrorAndPush(messageError, item) {
      const findType = failed.find(error => error.type === messageError);
      if (findType) findType.uids.push(item);
      else failed.push({ type: messageError, uids: [item] });
    }

    const regExMatchFB = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;

    for (const item of inputs) {
      let uid;
      let continueLoop = false;

      if (!isNaN(item)) {
        uid = item;
      } else if (regExMatchFB.test(item)) {
        for (let i = 0; i < 10; i++) {
          try {
            uid = await findUid(item);
            break;
          } catch (err) {
            if (err.name === "SlowDown" || err.name === "CannotGetData") {
              await sleep(1000);
              continue;
            } else if (i === 9 || (err.name !== "SlowDown" && err.name !== "CannotGetData")) {
              checkErrorAndPush(
                err.name === "InvalidLink" ? getLang('invalidLink') :
                err.name === "CannotGetData" ? getLang('cannotGetUid') :
                err.name === "LinkNotExist" ? getLang('linkNotExist') :
                err.message,
                item
              );
              continueLoop = true;
              break;
            }
          }
        }
      } else {
        checkErrorAndPush(getLang("invalidLink"), item);
        continue;
      }

      if (continueLoop) continue;

      if (members.some(m => m.userID === uid && m.inGroup)) {
        checkErrorAndPush(getLang("alreadyInGroup"), item);
      } else {
        try {
          await api.addUserToGroup(uid, event.threadID);
          if (approvalMode === true && !adminIDs.includes(botID)) {
            success[1].uids.push(uid);
          } else {
            success[0].uids.push(uid);
          }
        } catch (err) {
          checkErrorAndPush(getLang("cannotAddUser"), item);
        }
      }
    }

    const lengthUserSuccess = success[0].uids.length;
    const lengthUserWaitApproval = success[1].uids.length;
    const lengthUserError = failed.reduce((acc, curr) => acc + curr.uids.length, 0);

    let msg = "";
    if (lengthUserSuccess)
      msg += `${getLang("successAdd", lengthUserSuccess)}\n`;
    if (lengthUserWaitApproval)
      msg += `${getLang("approve", lengthUserWaitApproval)}\n`;
    if (lengthUserError)
      msg += `${getLang("failedAdd", lengthUserError)} ${failed.reduce((a, b) => a += `\n    + ${b.uids.join('\n       ')}: ${b.type}`, "")}`;

    await message.reply(msg);
  }
};
