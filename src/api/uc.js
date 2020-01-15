import UCClient from 'brekekejs/lib/ucclient';
import EventEmitter from 'eventemitter3';
import { Platform } from 'react-native';

const codeMapUserStatus = {
  '0': `offline`,
  '1': `online`,
  '2': `idle`,
  '3': `busy`,
};
const getUserStatusFromCode = code =>
  codeMapUserStatus[code] || codeMapUserStatus[`0`];

const codeMapFileState = {
  '0': `waiting`,
  '1': `waiting`,
  '2': `started`,
  '3': `success`,
  '4': `stopped`,
  '5': `stopped`,
  '6': `failure`,
};
const getFileStateFromCode = code =>
  codeMapFileState[code] || codeMapFileState[`0`];

class UC extends EventEmitter {
  constructor() {
    super();
    const logger = new UCClient.Logger(`all`);
    this.client = new UCClient.ChatClient(logger);

    this.client.setEventListeners({
      forcedSignOut: this.onConnectionStopped,
      buddyStatusChanged: this.onUserUpdated,
      receivedTyping: null,
      receivedText: this.onTextReceived,
      fileReceived: this.onFileReceived,
      fileInfoChanged: this.onFileProgress,
      fileTerminated: this.onFileFinished,
      invitedToConference: this.onGroupInvited,
      conferenceMemberChanged: this.onGroupUpdated,
    });
  }

  onConnectionStopped = ev => {
    this.emit(`connection-stopped`, ev);
  };

  onUserUpdated = ev => {
    if (!ev) return;

    this.emit(`user-updated`, {
      id: ev.user_id,
      name: ev.name,
      avatar: ev.profile_image_url,
      status: getUserStatusFromCode(ev.status),
      statusText: ev.display,
    });
  };

  onTextReceived = ev => {
    if (!ev || !ev.sender) return;

    ev.conf_id
      ? this.emit(`group-chat-created`, {
          id: ev.received_text_id,
          group: ev.conf_id,
          text: ev.text,
          creator: ev.sender.user_id,
          created: ev.sent_ltime,
        })
      : this.emit(`buddy-chat-created`, {
          id: ev.received_text_id,
          text: ev.text,
          creator: ev.sender.user_id,
          created: ev.sent_ltime,
        });
  };

  onFileReceived = ev => {
    if (!ev || !ev.fileInfo) return;

    const file = {
      id: ev.fileInfo.file_id,
      name: ev.fileInfo.name,
      size: ev.fileInfo.size,
      incoming: true,
      state: getFileStateFromCode(ev.fileInfo.status),
      transferPercent: ev.fileInfo.progress,
    };

    this.emit(`file-received`, file);

    ev.conf_id
      ? this.emit(`group-chat-created`, {
          id: ev.text_id,
          creator: ev.fileInfo.target.user_id,
          group: ev.conf_id,
          file: file.id,
          created: ev.sent_ltime,
        })
      : this.emit(`buddy-chat-created`, {
          id: ev.text_id,
          creator: ev.fileInfo.target.user_id,
          file: file.id,
          created: ev.sent_ltime,
        });
  };

  onFileProgress = ev => {
    if (!ev || !ev.fileInfo) return;

    this.emit(`file-progress`, {
      id: ev.fileInfo.file_id,
      state: getFileStateFromCode(ev.fileInfo.status),
      transferPercent: ev.fileInfo.progress,
    });
  };

  onFileFinished = ev => {
    if (!ev || !ev.fileInfo) return;

    this.emit(`file-finished`, {
      id: ev.fileInfo.file_id,
      state: getFileStateFromCode(ev.fileInfo.status),
      transferPercent: ev.fileInfo.progress,
    });
  };

  onGroupInvited = ev => {
    if (!ev || !ev.conference) return;

    this.emit(`chat-group-invited`, {
      id: ev.conference.conf_id,
      name: ev.conference.subject,
      inviter: ev.conference.from.user_id,
      buddies: ev.conference.user || [],
    });
  };

  onGroupUpdated = ev => {
    if (!ev || !ev.conference) return;

    if (ev.conference.conf_status === 0) {
      this.emit(`chat-group-revoked`, {
        id: ev.conference.conf_id,
      });

      return;
    }

    this.emit(`chat-group-updated`, {
      id: ev.conference.conf_id,
      name: ev.conference.subject,
      jointed: ev.conference.conf_status === 2,
      members: (ev.conference.user || [])
        .filter(user => user.conf_status === 2)
        .map(user => user.user_id),
    });
  };

  connect(profile, option) {
    return new Promise((onres, onerr) =>
      this.client.signIn(
        `https://${profile.ucHostname}:${profile.ucPort}`,
        profile.ucPathname || `uc`,
        profile.pbxTenant,
        profile.pbxUsername,
        profile.pbxPassword,
        option,
        onres,
        onerr,
      ),
    );
  }

  disconnect() {
    this.client.signOut();
  }

  me() {
    const profile = this.client.getProfile() || {};
    const status = this.client.getStatus() || {};

    return {
      id: profile.user_id,
      name: profile.name,
      avatar: profile.profile_image_url,
      status: getUserStatusFromCode(status.status),
      statusText: status.display,
    };
  }

  setStatus(status, statusText) {
    let num_status = 0;
    if (status === `online`) {
      num_status = 1;
    }
    if (status === `busy`) {
      num_status = 3;
    }
    return new Promise((onres, onerr) =>
      this.client.changeStatus(num_status, statusText, onres, onerr),
    );
  }

  getUsers() {
    const buddyList = this.client.getBuddylist();

    if (!buddyList || !Array.isArray(buddyList.user)) {
      return [];
    }

    return buddyList.user.map(user => ({
      id: user.user_id,
      name: user.name,
      avatar: user.profile_image_url,
      status: getUserStatusFromCode(user.status),
      statusText: user.display,
    }));
  }

  async getUnreadChats() {
    const res = await new Promise((onres, onerr) => {
      this.client.receiveUnreadText(onres, onerr);
    });

    if (!res || !Array.isArray(res.messages)) {
      return [];
    }

    const readRequiredMessageIds = res.messages
      .filter(msg => msg.requires_read)
      .map(msg => msg.received_text_id);
    this.client.readText(readRequiredMessageIds);

    return res.messages.map(msg => ({
      id: msg.received_text_id,
      text: msg.text,
      creator: msg.sender && msg.sender.user_id,
      created: msg.sent_ltime,
    }));
  }

  async getBuddyChats(buddy, opts) {
    const res = await new Promise((onres, onerr) =>
      this.client.searchTexts(
        {
          user_id: buddy,
          max: opts.max,
          begin: opts.begin,
          end: opts.end,
          asc: opts.asc,
        },
        onres,
        onerr,
      ),
    );

    if (!res || !Array.isArray(res.logs)) {
      return [];
    }

    return res.logs.map(log => ({
      id: log.log_id,
      text: log.ctype === 5 ? JSON.parse(log.content).name : log.content,
      creator: log.sender.user_id,
      created: log.ltime,
    }));
  }

  async getGroupChats(group, opts) {
    const res = await new Promise((onres, onerr) =>
      this.client.searchTexts(
        {
          conf_id: group,
          max: opts.max,
          begin: opts.begin,
          end: opts.end,
          asc: opts.asc,
        },
        onres,
        onerr,
      ),
    );

    if (!res || !Array.isArray(res.logs)) {
      return [];
    }

    return res.logs.map(log => ({
      id: log.log_id,
      text: log.content,
      creator: log.sender.user_id,
      created: res.ltime,
    }));
  }

  sendBuddyChatText(buddy, text) {
    return new Promise((onres, onerr) =>
      this.client.sendText(
        text,
        {
          user_id: buddy,
        },
        res =>
          onres({
            id: res.text_id,
            text,
            creator: this.client.getProfile().user_id,
            created: res.ltime,
          }),
        onerr,
      ),
    );
  }

  sendGroupChatText(group, text) {
    return new Promise((onres, onerr) =>
      this.client.sendConferenceText(
        text,
        group,
        res =>
          onres({
            id: res.text_id,
            text,
            creator: this.client.getProfile().user_id,
            created: res.ltime,
          }),
        onerr,
      ),
    );
  }

  async createChatGroup(name, members = []) {
    const res = await new Promise((onres, onerr) => {
      this.client.createConference(name, members, onres, onerr);
    });

    return {
      id: res.conference.conf_id,
      name: res.conference.subject,
      jointed: true,
    };
  }

  async joinChatGroup(group) {
    await new Promise((onres, onerr) => {
      this.client.joinConference(group, null, onres, onerr);
    });

    return {
      id: group,
    };
  }

  async leaveChatGroup(group) {
    await new Promise((onres, onerr) => {
      this.client.leaveConference(group, onres, onerr);
    });

    return {
      id: group,
    };
  }

  inviteChatGroupMembers(group, members) {
    return new Promise((onres, onerr) => {
      this.client.inviteToConference(group, members, onres, onerr);
    });
  }

  acceptFile(file) {
    return new Promise((onres, onerr) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = `blob`;

      xhr.onload = function(ev) {
        if (this.status === 200) onres(this.response);
      };

      this.client.acceptFileWithXhr(file, xhr, onerr);
    });
  }

  rejectFile(file) {
    return new Promise((onres, onerr) => {
      this.client.cancelFile(file, onerr);
      onres();
    });
  }

  async sendFile(user_id, file) {
    let input = null;

    if (Platform.OS === `web`) {
      input = document.createElement(`input`);
      input.type = `file`;
      input.name = `file`;

      input.files = (() => {
        let b = null;

        if (window.DataTransfer) {
          b = new DataTransfer();
        } else if (window.ClipboardEvent) {
          b = new ClipboardEvent(``).clipboardData;
        } else {
          console.error(`Can not set input.files`);
          return;
        }

        b.items.add(file);
        return b.files;
      })();

      const form = document.createElement(`form`);
      form.appendChild(input);
    } else {
      const fd = new FormData();

      fd.append(`file`, {
        ...file,
        type: `multipart/form-data`,
      });

      input = {
        form: `This is not a form element, see app/apis/uc.js for detail`,
        files: [file],
        __rnFormData: fd,
      };
    }

    const res = await new Promise((onres, onerr) =>
      this.client.sendFile(
        {
          user_id,
        },
        input,
        onres,
        onerr,
      ),
    );

    return {
      file: {
        id: res.fileInfo.file_id,
        name: res.fileInfo.name,
        size: res.fileInfo.size,
        state: getFileStateFromCode(res.fileInfo.status),
        transferPercent: res.fileInfo.progress,
      },

      chat: {
        id: res.text_id,
        file: res.fileInfo.file_id,
        creator: this.client.getProfile().user_id,
        created: res.ltime,
      },
    };
  }

  async sendFiles(conf_id, file) {
    let input = null;

    if (Platform.OS === `web`) {
      input = document.createElement(`input`);
      input.type = `file`;
      input.name = `file`;

      input.files = (() => {
        let b = null;

        if (window.DataTransfer) {
          b = new DataTransfer();
        } else if (window.ClipboardEvent) {
          b = new ClipboardEvent(``).clipboardData;
        } else {
          console.error(`Can not set input.files`);
          return;
        }

        b.items.add(file);
        return b.files;
      })();

      const form = document.createElement(`form`);
      form.appendChild(input);
    } else {
      const fd = new FormData();

      fd.append(`file`, {
        ...file,
        type: `multipart/form-data`,
      });
    }

    const res = await new Promise((onres, onerr) =>
      this.client.sendFiles(
        {
          conf_id,
        },
        [file],
        onres,
        onerr,
      ),
    );
    const file_res = res.infoList[0];
    return {
      file: {
        id: file_res.fileInfo.file_id,
        name: file_res.fileInfo.name,
        size: file_res.fileInfo.size,
        state: getFileStateFromCode(file_res.fileInfo.status),
        transferPercent: file_res.fileInfo.progress,
      },

      chat: {
        id: file_res.text_id,
        file: file_res.fileInfo.file_id,
        creator: this.client.getProfile().user_id,
        created: file_res.ltime,
      },
    };
  }
}

export default new UC();
