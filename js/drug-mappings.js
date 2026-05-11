// Guard: admins only
(function() {
  const user = Auth.getUser();
  if (!user || user.role !== "admin") {
    window.location.href = "/";
  }
})();


let openPanel = null;
let pendingData  = null;
let resolvedData = null;


document.addEventListener("DOMContentLoaded", () => {
  loadCounts();
  loadAdminInfo();
});







// async function loadCounts() {
//   try {
//     const [pendingRes, resolvedRes] = await Promise.all([
//       fetch(`${API_BASE}/admin/mappings/pending`,  { headers: Auth.headers() }),
//       fetch(`${API_BASE}/admin/mappings/resolved`, { headers: Auth.headers() })
//     ]);

//     pendingData  = await pendingRes.json();
//     resolvedData = await resolvedRes.json();

//     document.getElementById("count-pending").textContent  = pendingData.length;
//     document.getElementById("count-resolved").textContent = resolvedData.length;

//   } catch (err) {
//     console.error("Failed to load counts:", err.message);
//     document.getElementById("count-pending").textContent  = "!";
//     document.getElementById("count-resolved").textContent = "!";
//   }
// }



async function loadCounts() {
  try {
    const [pendingRes, resolvedRes, statsRes] = await Promise.all([
      fetch(`${API_BASE}/admin/mappings/pending`,  { headers: Auth.headers() }),
      fetch(`${API_BASE}/admin/mappings/resolved`, { headers: Auth.headers() }),
      fetch(`${API_BASE}/admin/stats`,             { headers: Auth.headers() })
    ]);

    pendingData  = await pendingRes.json();
    resolvedData = await resolvedRes.json();
    const stats  = await statsRes.json();

    document.getElementById("count-pending").textContent  = pendingData.length;
    document.getElementById("count-resolved").textContent = resolvedData.length;
    document.getElementById("count-unread").textContent   = stats.unreadMessages ?? "!";

  } catch (err) {
    console.error("Failed to load counts:", err.message);
    document.getElementById("count-pending").textContent  = "!";
    document.getElementById("count-resolved").textContent = "!";
    document.getElementById("count-unread").textContent   = "!";
  }
}







async function loadAdminInfo() {
  const user = Auth.getUser();
  if (!user) return;

  document.getElementById("admin-name").textContent  = user.name  || "—";
  document.getElementById("admin-email").textContent = user.email || "—";

  try {
    const res  = await fetch(`${API_BASE}/auth/me`, { headers: Auth.headers() });
    const full = await res.json();
    document.getElementById("admin-created").textContent = full.created_at
      ? formatDate(full.created_at)
      : "—";
  } catch {
    document.getElementById("admin-created").textContent = "—";
  }
}






function togglePanel(name) {
  const panel = document.getElementById(`panel-${name}`);
  const card  = document.getElementById(`card-${name}`);
  const arrow = document.getElementById(`arrow-${name}`);

  // If clicking the already-open panel, close it
  if (openPanel === name) {
    panel.classList.remove("open");
    card.classList.remove("active");
    openPanel = null;
    return;
  }


  if (openPanel) {
    document.getElementById(`panel-${openPanel}`).classList.remove("open");
    document.getElementById(`card-${openPanel}`).classList.remove("active");
  }


  panel.classList.add("open");
  card.classList.add("active");
  openPanel = name;


  if (name === "pending")  renderPending();
  if (name === "resolved") renderResolved();


  setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}







function renderPending() {
  const container = document.getElementById("pendingList");

  if (!pendingData) {
    container.innerHTML = `<div class="list-loading">Loading…</div>`;
    return;
  }

  if (pendingData.length === 0) {
    container.innerHTML = `<div class="list-empty">No pending drugs. All caught up.</div>`;
    return;
  }

  container.innerHTML = pendingData.map(d => `
    <div class="item-row" id="row-${d.id}">
      <div class="item-name">${escHtml(d.drug_name)}</div>
      <div class="item-date">Flagged ${formatDate(d.attempted_at)}</div>
      <div class="item-action">
        <input
          class="item-input"
          type="text"
          id="input-${d.id}"
          placeholder="Enter generic name…"
        >
        <button class="item-btn" onclick="resolve(${d.id})">Save</button>
      </div>
      <div class="item-msg" id="msg-${d.id}"></div>
    </div>
  `).join("");
}







function renderResolved() {
  const container = document.getElementById("resolvedList");

  if (!resolvedData) {
    container.innerHTML = `<div class="list-loading">Loading…</div>`;
    return;
  }

  if (resolvedData.length === 0) {
    container.innerHTML = `<div class="list-empty">No resolved mappings yet.</div>`;
    return;
  }

  container.innerHTML = resolvedData.map(m => `
    <div class="item-row">
      <div class="item-name">${escHtml(m.original)}</div>
      <div class="item-mapped">→ ${escHtml(m.mapped)}</div>
      <div class="item-by">by ${escHtml(m.resolved_by_name || "Admin")}</div>
      <div class="item-date">${formatDate(m.created_at)}</div>
    </div>
  `).join("");
}









async function resolve(id) {
  const input  = document.getElementById(`input-${id}`);
  const msgEl  = document.getElementById(`msg-${id}`);
  const mapped = input.value.trim();

  msgEl.className = "item-msg";
  msgEl.textContent = "";

  if (!mapped) {
    msgEl.className = "item-msg error";
    msgEl.textContent = "Please enter a generic name.";
    return;
  }

  try {
    const res  = await fetch(`${API_BASE}/admin/mappings/${id}/resolve`, {
      method:  "POST",
      headers: Auth.headers(),
      body:    JSON.stringify({ mapped })
    });

    const data = await res.json();

    if (!res.ok) {
      msgEl.className = "item-msg error";
      msgEl.textContent = data.error || "Failed to save.";
      return;
    }

    // Remove from pending cache and DOM
    pendingData = pendingData.filter(d => d.id !== id);
    document.getElementById(`row-${id}`)?.remove();

    // Update the pending count on the card
    document.getElementById("count-pending").textContent = pendingData.length;

    // Re-fetch resolved data so the resolved panel reflects the new entry
    const resolvedRes = await fetch(`${API_BASE}/admin/mappings/resolved`, {
      headers: Auth.headers()
    });
    resolvedData = await resolvedRes.json();
    document.getElementById("count-resolved").textContent = resolvedData.length;

    // If resolved panel is open, re-render it
    if (openPanel === "resolved") renderResolved();

    // If pending list is now empty, show the empty state
    if (pendingData.length === 0) {
      document.getElementById("pendingList").innerHTML =
        `<div class="list-empty">No pending drugs. All caught up.</div>`;
    }

  } catch (err) {
    msgEl.className = "item-msg error";
    msgEl.textContent = "Could not reach server.";
  }
}








function formatDate(isoStr) {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
}

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}