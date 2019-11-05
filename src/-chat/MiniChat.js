const miniChatDuration = 60000;

const m = {
  numberOfChatsPerLoad: 50,

  isMiniChat(chat, prev = {}) {
    return (
      chat.creator === prev.creator &&
      chat.created - prev.created < miniChatDuration
    );
  },
};

export default m;
