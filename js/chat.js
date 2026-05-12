const LOGIN_URL = "/html/login.html";
const CHAT_API_BASE = window.location.origin;

const state = {
  currentUser: null,
  pageType: document.querySelector(".pharma-shell")?.dataset.page,
  params: new URLSearchParams(window.location.search),
  panel: document.getElementById("appPanel"),
  conversations: []
};

state.view = state.params.get("view") || (state.pageType === "admin" ? "unread" : "new");
state.chatId = state.params.get("chat");

function requireLogin() {
  if (!window.Auth || !Auth.isLoggedIn()) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${LOGIN_URL}?redirect=${redirect}`;
    return false;
  }

  state.currentUser = Auth.getUser();
  return true;
}

function normalizeRole(user) {
  return String(user?.role || "user").toLowerCase();
}

function guardRole() {
  const role = normalizeRole(state.currentUser);

  if (state.pageType === "admin" && role !== "admin") {
    state.panel.innerHTML = `<p class="empty-state">Admins only.</p>`;
    return false;
  }

  if (state.pageType === "user" && role === "admin") {
    state.panel.innerHTML = `<p class="empty-state">Admins should use Chat Management.</p>`;
    return false;
  }

  return true;
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(`${CHAT_API_BASE}${url}`, {
    ...options,
    headers: {
      ...Auth.headers(),
      ...(options.headers || {})
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

async function apiGetConversations() {
  if (state.pageType === "admin") {
    return fetchJSON("/admin/chat/conversations");
  }

  return fetchJSON("/chat/conversations");
}








// async function apiGetMessages(chatId) {
//   if (state.pageType === "admin") {
//     const messages = await fetchJSON(`/admin/chat/conversations/${chatId}/messages`);
//     return { messages };
//   }

//   return fetchJSON(`/chat/conversations/${chatId}/messages`);
// }




async function apiGetMessages(chatId) {
  if (state.pageType === "admin") {
    return fetchJSON(`/admin/chat/conversations/${chatId}/messages`);
    // ✅ just return it directly — server already sends { chat, messages }
  }

  return fetchJSON(`/chat/conversations/${chatId}/messages`);
}









async function apiCreateChat(body) {
  return fetchJSON("/chat/start", {
    method: "POST",
    body: JSON.stringify({ body })
  });
  message = await apiSendMessage(realChatId, text);
showSentOverlay();
}




async function apiSendMessage(chatId, body) {
  if (state.pageType === "admin") {
    return fetchJSON(`/admin/chat/conversations/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body })
    });
  }

  return fetchJSON(`/chat/conversations/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body })
  });
  message = await apiSendMessage(realChatId, text);
  showSentOverlay();
}


function setActiveLink() {
  document.querySelectorAll(".sidebar-links a").forEach((link) => {
    link.classList.toggle("active", link.dataset.linkView === state.view);
  });
}

function renderList() {
  if (state.pageType === "user" && state.view === "new") {
    renderChatRoom({
      chat: {
        id: "new-chat",
        created_at: new Date().toISOString(),
        messages: []
      },
      mode: "user-new",
      backHref: "ask-pharmacist.html?view=new"
    });
    return;
  }

  let conversations = state.conversations;

  if (state.pageType === "admin") {
    if (state.view === "unread") {
      conversations = conversations.filter((chat) => Number(chat.unread_count || 0) > 0);
    } else {
      conversations = conversations.filter((chat) => Number(chat.unread_count || 0) === 0);
    }
  }

  state.panel.innerHTML = buildCards(conversations);
  bindCards();
}

function buildCards(conversations) {
  if (!conversations.length) {
    return `<p class="empty-state">No messages to show yet.</p>`;
  }

  return `
    <div class="card-list">
      ${conversations.map((chat) => {
        const name =
          state.pageType === "admin"
            ? chat.user_name || "User"
            : "Pharmacist";

        const href =
          state.pageType === "admin"
            ? `chat-management.html?view=${encodeURIComponent(state.view)}&chat=${chat.id}`
            : `ask-pharmacist.html?view=history&chat=${chat.id}`;

        return `
          <button class="chat-card" type="button" data-href="${href}">
            <span>
              <strong>${escapeHtml(name)}</strong>
              <p>${escapeHtml(chat.last_message || "No messages yet")}</p>
            </span>
            <time>${formatDate(chat.updated_at)}</time>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function bindCards() {
  document.querySelectorAll("[data-href]").forEach((card) => {
    card.addEventListener("click", () => {
      window.location.href = card.dataset.href;
    });
  });
}




async function renderSelectedChat() {
  const data = await apiGetMessages(state.chatId);

  const chat = {
    id: state.chatId,
    created_at: data.chat?.created_at || new Date().toISOString(),
    messages: data.messages || [],
     user_name: data.chat?.user_name || "User"
  };

  const mode =
    state.pageType === "admin"
      ? "admin-unread"
      : "user-history";

  renderChatRoom({
    chat,
    mode,
    backHref:
      state.pageType === "admin"
        ? `chat-management.html?view=${encodeURIComponent(state.view)}`
        : "ask-pharmacist.html?view=history"
  });
}





function renderChatRoom({ chat, mode, backHref }) {
  const isAdmin = mode.startsWith("admin");
  const canSend = mode === "admin-unread" || mode === "user-new" || mode === "user-history";

  document.body.innerHTML = `
    <main class="chat-room">
      <aside class="room-side">
        <a class="back-link" href="${backHref}">&lt; Back</a>
        <section class="profile-block">
          <h2>${isAdmin ? chat.user_name : "Pharmacist"}</h2>
          <p>Chat Start At: ${formatTime(chat.created_at)}</p>
        </section>
      </aside>

      <section class="room-main">
        <div class="message-list" id="messageList">
          ${chat.messages.length
            ? chat.messages.map((message) => messageTemplate(message)).join("")
            : `<p class="chat-note">Start your chat by sending a message.</p>`}
        </div>

        ${canSend ? messageFormTemplate(mode) : `<p class="chat-note">You can’t send messages.</p>`}
      </section>
    </main>
  `;

  bindMessageForm(mode, chat.id);

  if (chat.id !== "new-chat" && window.joinChat) {
    window.joinChat(chat.id);
  }
}

function messageTemplate(message) {
  const role = message.sender_role || message.senderRole;
  const body = message.body;
  const time = message.sent_at || message.sentAt;

  const className =
    role === "admin" || role === "pharmacist"
      ? "from-pharmacist"
      : "from-user";

  return `
    <div class="message-row ${className}">
      <p class="bubble">
        ${escapeHtml(body)}
        <span class="message-meta">${formatTime(time)}</span>
      </p>
    </div>
  `;
}

function messageFormTemplate(mode) {
  const isAdminReply = mode.startsWith("admin");

  return `
    <form class="message-form" id="messageForm">
      <input id="messageInput" type="text" placeholder="${isAdminReply ? "Send Reply..." : "Start Chat..."}" autocomplete="off" required>
      <button type="submit">${isAdminReply ? "Send" : "Send"}</button>
    </form>
  `;
}

function bindMessageForm(mode, chatId) {
  const form = document.getElementById("messageForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = document.getElementById("messageInput");
    const text = input.value.trim();

    if (!text) return;

    input.disabled = true;

    try {
      let message;
      let realChatId = chatId;

      if (mode === "user-new") {
        const created = await apiCreateChat(text);

        realChatId = created.conversationId;
        message = created.message;

        if (window.joinChat) {
          window.joinChat(realChatId);
        }

        if (window.sendSocketMessage) {
          window.sendSocketMessage({
            ...message,
            chatId: realChatId,
            senderRole: "user"
          });
        }

        window.location.href = `ask-pharmacist.html?view=history&chat=${realChatId}`;
        return;
      }

      message = await apiSendMessage(realChatId, text);

      const senderRole =
        state.pageType === "admin"
          ? "admin"
          : "user";

      if (window.sendSocketMessage) {
        window.sendSocketMessage({
          ...message,
          chatId: realChatId,
          senderRole,
          body: text
        });
      }

      input.value = "";

    } catch (error) {
      console.error(error);
      alert("Could not send message. Please try again.");
    } finally {
      input.disabled = false;
      input.focus();
    }
  });
}

function appendMessage(message) {
  const list = document.getElementById("messageList");
  if (!list) return;

  const starterNote = list.querySelector(".chat-note");
  if (starterNote) starterNote.remove();

  list.insertAdjacentHTML("beforeend", messageTemplate(message));
  list.scrollTop = list.scrollHeight;
}

window.appendMessage = appendMessage;

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB");
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "00:00";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// async function init() {
//   try {
//     if (!requireLogin()) return;
//     if (!guardRole()) return;

//     setActiveLink();

//     if (window.socket && state.pageType === "admin") {
//       socket.emit("join-admin");
//     }

//     state.conversations = await apiGetConversations();

//     if (state.chatId) {
//       await renderSelectedChat();
//       return;
//     }

//     renderList();

//   } catch (error) {
//     console.error(error);
//     if (state.panel) {
//       state.panel.innerHTML = `<p class="empty-state">Could not load chat data.</p>`;
//     }
//   }
// }
async function init() {
  try {
    if (!requireLogin()) return;
    if (!guardRole()) return;

    setActiveLink();

    if (window.socket && state.pageType === "admin") {
      socket.emit("join-admin");
    }

    if (state.pageType === "user" && state.view === "new") {
      renderList();
      return;
    }

    state.conversations = await apiGetConversations();

    if (state.chatId) {
      await renderSelectedChat();
      return;
    }

    renderList();

  } catch (error) {
    console.error(error);
    if (state.panel) {
      state.panel.innerHTML = `<p class="empty-state">Could not load chat data.</p>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
function showSentOverlay() {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.10s ease forwards;
  `;

  overlay.innerHTML = `
  <style>
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(24px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .sent-box {
      background: white;
      border-radius: 24px;
      padding: 34px 30px;
      text-align: center;
      max-width: 360px;
      width: 90%;
      animation: slideUp 0.35s ease forwards;
      box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    }

    .loader {
      width: 42px;
      height: 42px;
      border: 4px solid #d9def0;
      border-top-color: #24356f;
      border-radius: 50%;
      margin: 0 auto 18px;
      animation: spin 0.8s linear infinite;
    }

    .sent-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: #1a1f3a;
      line-height: 1.7;
    }
  </style>

  <div class="sent-box">
    <div class="loader"></div>

    <p class="sent-title">
      Waiting for a pharmacist reply to the chat
    </p>
  </div>
`;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.transition = "opacity 0.4s ease";
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 400);
  }, 3000);
}