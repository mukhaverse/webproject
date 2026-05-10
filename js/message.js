//to open connection
window.socket = io();

const socket = window.socket;

function joinChat(chatId) {
  if (!chatId) {
    console.log("chatId is required");
    return;
  }

  socket.emit("join-chat", chatId);
}

//function to send messages
function sendSocketMessage(message) {

  if (!message) {
    console.log("message is required");
    return;
  }

  if (!message.chatId) {
    console.log("chatId is required");
    return;
  }

  if (!message.body || message.body.trim() === "") {
    console.log("message body is required");
    return;
  }

  if (!message.senderRole) {
    console.log("senderRole is required");
    return;
  }

  socket.emit("send-message", message);
}

// receive new message
socket.on("receive-message", (message) => {

  if (!message || !message.body) {
    return;
  }

  if (window.appendMessage) {
    window.appendMessage(message);
  }

});

// update conversations for admin
socket.on("conversation-updated", () => {
  console.log("Conversation list updated");
});

//make functions global
window.joinChat = joinChat;
window.sendSocketMessage = sendSocketMessage;