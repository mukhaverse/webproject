const CHAT_DATA_URL = '../data/chat-data.json';
const LOGIN_URL = '/html/login.html';
const MOCK_STORAGE_KEY = 'medixa_mock_chat_store';

const state = {
  store: null,
  currentUser: null,
  pageType: document.querySelector('.pharma-shell')?.dataset.page,
  params: new URLSearchParams(window.location.search),
  panel: document.getElementById('appPanel')
};

state.view = state.params.get('view') || (state.pageType === 'admin' ? 'unread' : 'new');
state.chatId = state.params.get('chat');

function hasAuth() {
  return window.Auth && typeof Auth.getUser === 'function' && typeof Auth.isLoggedIn === 'function';
}

function requireLogin() {
  if (!hasAuth()) return true;

  if (!Auth.isLoggedIn()) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${LOGIN_URL}?redirect=${redirect}`;
    return false;
  }

  state.currentUser = Auth.getUser();
  return true;
}

function normalizeUserId(user) {
  return user?.id || user?._id || user?.userId || null;
}

function normalizeRole(user) {
  return String(user?.role || 'user').toLowerCase();
}

function guardRole() {
  const role = normalizeRole(state.currentUser);

  if (state.pageType === 'admin' && role !== 'admin') {
    renderAccessDenied('This page is only available for admins.', 'ask-pharmacist.html?view=new', 'Go to Ask a Pharmacist');
    return false;
  }

  if (state.pageType === 'user' && role === 'admin') {
    renderAccessDenied('Admins should use Chat Management.', 'chat-management.html?view=unread', 'Go to Chat Management');
    return false;
  }

  return true;
}

function renderAccessDenied(message, href, label) {
  if (!state.panel) return;
  state.panel.innerHTML = `
    <div class="access-state">
      <p>${escapeHtml(message)}</p>
      <a href="${href}">${escapeHtml(label)}</a>
    </div>
  `;
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function apiGetStore() {
  /*
    Backend-ready version for later:

    return fetchJSON('/chat', {
      method: 'GET',
      headers: Auth.headers()
    });
  */

  const savedMock = localStorage.getItem(MOCK_STORAGE_KEY);
  if (savedMock) return JSON.parse(savedMock);

  const data = await fetchJSON(CHAT_DATA_URL);
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
  return data;
}

async function apiSendMessage(chatId, body, senderRole) {
  /*
    Backend-ready version for later:

    return fetchJSON(`/chat/${chatId}/messages`, {
      method: 'POST',
      headers: Auth.headers(),
      body: JSON.stringify({ body })
    });
  */

  const chat = findChat(chatId);
  if (!chat) throw new Error('Chat not found');

  const message = {
    id: `mock-${Date.now()}`,
    senderRole,
    body,
    sentAt: new Date().toISOString()
  };

  chat.messages.push(message);
  chat.preview = body.length > 38 ? `${body.slice(0, 38)}...` : body;
  chat.updatedAt = message.sentAt;

  if (senderRole === 'pharmacist') {
    chat.status = 'history';
  }

  persistMockStore();
  return message;
}

async function apiCreateChat(body) {
  /*
    Backend-ready version for later:

    return fetchJSON('/chat/start', {
      method: 'POST',
      headers: Auth.headers(),
      body: JSON.stringify({ body })
    });
  */

  const currentUserId = getCurrentUserId();
  const pharmacist = state.store.pharmacists[0];
  const now = new Date().toISOString();
  const chat = {
    id: `chat-${Date.now()}`,
    userId: currentUserId,
    pharmacistId: pharmacist.id,
    status: 'unread',
    createdAt: now,
    updatedAt: now,
    preview: body.length > 38 ? `${body.slice(0, 38)}...` : body,
    messages: [
      {
        id: `mock-${Date.now()}`,
        senderRole: 'user',
        body,
        sentAt: now
      }
    ]
  };

  ensureCurrentUserExists();
  state.store.conversations.unshift(chat);
  persistMockStore();
  return chat;
}

function persistMockStore() {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state.store));
}

function ensureCurrentUserExists() {
  const id = getCurrentUserId();
  if (state.store.users.some((user) => user.id === id)) return;

  state.store.users.push({
    id,
    name: state.currentUser?.name || 'Username',
    email: state.currentUser?.email || 'Email@gmail.com',
    role: normalizeRole(state.currentUser)
  });
}

function getCurrentUserId() {
  return normalizeUserId(state.currentUser) || 'u-001';
}

function setActiveLink() {
  document.querySelectorAll('.sidebar-links a').forEach((link) => {
    link.classList.toggle('active', link.dataset.linkView === state.view);
  });
}

function findUser(id) {
  return state.store.users.find((user) => user.id === id) || {
    id,
    name: state.currentUser?.name || 'Username',
    email: state.currentUser?.email || 'Email@gmail.com',
    role: 'user'
  };
}

function findPharmacist(id) {
  return state.store.pharmacists.find((pharmacist) => pharmacist.id === id) || state.store.pharmacists[0];
}

function findChat(id) {
  return state.store.conversations.find((chat) => chat.id === id);
}

function getVisibleConversations() {
  if (state.pageType === 'admin') {
    const status = state.view === 'history' ? 'history' : 'unread';
    return state.store.conversations.filter((chat) => chat.status === status);
  }

  const currentUserId = getCurrentUserId();
  return state.store.conversations.filter((chat) => chat.userId === currentUserId);
}

function renderList() {
  if (state.pageType === 'user' && state.view === 'new') {
    renderChatRoom({
      chat: createEmptyChat(),
      mode: 'user-new',
      backHref: 'ask-pharmacist.html?view=new'
    });
    return;
  }

  const conversations = getVisibleConversations();
  state.panel.innerHTML = buildCards(conversations);
  bindCards();
}

function buildCards(conversations) {
  if (!conversations.length) {
    return '<p class="empty-state">No messages to show yet.</p>';
  }

  return `
    <div class="card-list">
      ${conversations.map((chat) => {
        const person = state.pageType === 'admin'
          ? findUser(chat.userId)
          : findPharmacist(chat.pharmacistId);
        const href = state.pageType === 'admin'
          ? `chat-management.html?view=${encodeURIComponent(state.view)}&chat=${encodeURIComponent(chat.id)}`
          : `ask-pharmacist.html?view=history&chat=${encodeURIComponent(chat.id)}`;

        return `
          <button class="chat-card" type="button" data-href="${href}">
            <span>
              <strong>${escapeHtml(person.name)}</strong>
              <p>${escapeHtml(chat.preview || 'last massage sent................')}</p>
            </span>
            <time datetime="${escapeHtml(chat.updatedAt)}">${formatDate(chat.updatedAt)}</time>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function bindCards() {
  document.querySelectorAll('[data-href]').forEach((card) => {
    card.addEventListener('click', () => {
      window.location.href = card.dataset.href;
    });
  });
}

function createEmptyChat() {
  return {
    id: 'new-chat',
    userId: getCurrentUserId(),
    pharmacistId: state.store.pharmacists[0].id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preview: '',
    messages: []
  };
}

function renderSelectedChat() {
  const chat = findChat(state.chatId);

  if (!chat) {
    state.panel.innerHTML = '<p class="empty-state">Chat not found.</p>';
    return;
  }

  if (state.pageType === 'user' && chat.userId !== getCurrentUserId()) {
    renderAccessDenied('You cannot open another user\'s chat.', 'ask-pharmacist.html?view=history', 'Back to Chat History');
    return;
  }

  const mode = state.pageType === 'admin'
    ? (state.view === 'history' ? 'admin-history' : 'admin-unread')
    : 'user-history';

  renderChatRoom({
    chat,
    mode,
    backHref: state.pageType === 'admin'
      ? `chat-management.html?view=${encodeURIComponent(state.view)}`
      : 'ask-pharmacist.html?view=history'
  });
}

function renderChatRoom({ chat, mode, backHref }) {
  const isAdmin = mode.startsWith('admin');
  const user = findUser(chat.userId);
  const pharmacist = findPharmacist(chat.pharmacistId);
  const profile = isAdmin ? user : pharmacist;
  const canSend = mode === 'admin-unread' || mode === 'user-new';
  const backText = getBackText(mode);

  document.body.innerHTML = `
    <main class="chat-room">
      <aside class="room-side">
        <a class="back-link" href="${backHref}">&lt; ${escapeHtml(backText)}</a>
        <section class="profile-block">
          <h2>${escapeHtml(profile.name)}</h2>
          <p>${escapeHtml(profile.email)}</p>
          <p>Chat Start At: ${formatTime(chat.createdAt)}</p>
        </section>
      </aside>

      <section class="room-main">
        <div class="message-list" id="messageList">
          ${chat.messages.length
            ? chat.messages.map((message) => messageTemplate(message)).join('')
            : '<p class="chat-note">Start your chat by sending a message.</p>'}
        </div>
        ${canSend ? messageFormTemplate(mode) : '<p class="chat-note">You can’t send any messages to this chat</p>'}
      </section>
    </main>
  `;

  bindMessageForm(mode, chat.id);

      // ### sockket ###
  if (window.joinChat) {
  window.joinChat(chat.id);
}
}

function getBackText(mode) {
  if (mode === 'admin-history') return 'Back to chat history';
  if (mode === 'admin-unread') return 'Back to unread messages';
  if (mode === 'user-history') return 'Back to chat history';
  return 'Back to unread messages';
}

function messageTemplate(message) {
  const className = message.senderRole === 'pharmacist' ? 'from-pharmacist' : 'from-user';

  return `
    <div class="message-row ${className}">
      <p class="bubble">
        ${escapeHtml(message.body)}
        <span class="message-meta">${formatTime(message.sentAt)}</span>
      </p>
    </div>
  `;
}

function messageFormTemplate(mode) {
  const isAdminReply = mode === 'admin-unread';
  return `
    <form class="message-form" id="messageForm">
      <input id="messageInput" type="text" placeholder="${isAdminReply ? 'Send Reply...' : 'Start Chat...'}" autocomplete="off" required>
      <button type="submit">${isAdminReply ? 'Send' : 'Start'}</button>
    </form>
  `;
}

function bindMessageForm(mode, chatId) {
  const form = document.getElementById('messageForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text) return;

    input.disabled = true;

    try {
      let message;

      if (mode === 'user-new') {
        const newChat = await apiCreateChat(text);
        window.location.href = `ask-pharmacist.html?view=history&chat=${encodeURIComponent(newChat.id)}`;
        return;
      }

      message = await apiSendMessage(chatId, text, 'pharmacist');

           // ### sockket ###
       if (window.sendSocketMessage) {
            window.sendSocketMessage({
        ...message,
        chatId
  });
}
      // appendMessage(message);
      input.value = '';
    } catch (error) {
      console.error(error);
      alert('Could not send message. Please try again.');
    } finally {
      input.disabled = false;
      input.focus();
    }
  });
}

function appendMessage(message) {
  const list = document.getElementById('messageList');
  if (!list) return;

  const starterNote = list.querySelector('.chat-note');
  if (starterNote) starterNote.remove();

  list.insertAdjacentHTML('beforeend', messageTemplate(message));
  list.scrollTop = list.scrollHeight;
}
window.appendMessage = appendMessage;

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB');
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '00:00';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function init() {
  try {
    if (!requireLogin()) return;

    state.store = await apiGetStore();
    ensureCurrentUserExists();
    setActiveLink();

    if (!guardRole()) return;

    if (state.chatId) {
      renderSelectedChat();
      return;
    }

    renderList();
  } catch (error) {
    console.error(error);
    if (state.panel) {
      state.panel.innerHTML = '<p class="empty-state">Could not load chat data.</p>';
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
