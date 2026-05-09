//to open connection
const socket = io();

function joinChat(chatId) {
  if (!chatId) {
    console.log("chatId is required");
    return;
  }

  // emit means send event to the server
  // join-chat is the event name
  // join user to room based on chatId
  socket.emit("join-chat", chatId);
}

//function to send messages
function sendSocketMessage(message) {
  if (!message) {
    console.log("message is required");
    return;
  }

// check which room the message belongs to
  if (!message.chatId) {
    console.log("chatId is required");
    return;
  }
  // check message content
  if (!message.body || message.body.trim() === "") {
    console.log("message body is required");
    return;
  }
    //check who sent the message admin or uuser
  if (!message.senderRole) {
    console.log("senderRole is required");
    return;
  }
    //send message to the server
  socket.emit("send-message", message);
}

    // "on" means listen for event from server
socket.on("receive-message", (message) => {
  if (!message || !message.body) {
    return;
  }

  //display message to front
  if (window.appendMessage) {
    window.appendMessage(message);
  }
});
  //make function global
window.joinChat = joinChat;
window.sendSocketMessage = sendSocketMessage;