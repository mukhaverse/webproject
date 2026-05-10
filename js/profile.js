// ── Auth Guard ──────────────────────────────────────────────
(function () {
  const user = Auth.getUser();
  if (!user) {
    window.location.href = "../../index.html";
  }
})();


// ── State ────────────────────────────────────────────────────
const openSchedules = new Set();


// ── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  loadHistory();

  document.getElementById("profileSignout").addEventListener("click", () => {
    Auth.logout?.();
    localStorage.removeItem("token");
    window.location.href = "../../index.html";
  });
});


// ── Profile Card ─────────────────────────────────────────────
function loadProfile() {
  const user = Auth.getUser();
  if (!user) return;

  document.getElementById("profileName").textContent  = user.name  || "—";
  document.getElementById("profileEmail").textContent = user.email || "—";
  document.getElementById("profileSince").textContent = user.created_at
    ? formatDate(user.created_at)
    : "—";
}


// ── History List ─────────────────────────────────────────────
async function loadHistory() {
  const container = document.getElementById("historyList");

  try {
    const res  = await fetch(`${API_BASE}/user/history`, {
      headers: Auth.headers()
    });

    if (!res.ok) {
      container.innerHTML = `<div class="history-empty">Could not load history. Please try again.</div>`;
      return;
    }

    const data = await res.json();

    // Update total checks count on profile card
    document.getElementById("profileCount").textContent = data.length;

    if (data.length === 0) {
      container.innerHTML = `<div class="history-empty">No checks yet. Head to the checker to get started.</div>`;
      return;
    }

    container.innerHTML = data.map(item => buildCard(item)).join("");

  } catch (err) {
    console.error("[Profile] Failed to load history:", err.message);
    container.innerHTML = `<div class="history-empty">Could not reach server.</div>`;
  }
}


// ── Card Builder ──────────────────────────────────────────────
function buildCard(item) {
  const drugs      = formatDrugNames(item.drug1, item.drug2);
  const badge      = buildBadge(item.severity);
  const date       = formatDate(item.created_at);
  const hasSchedule = item.has_schedule;

  const scheduleBtn = hasSchedule
    ? `<button class="schedule-toggle" id="toggle-${item.id}" onclick="toggleSchedule(${item.id})">
         Schedule <span class="toggle-arrow">▾</span>
       </button>`
    : "";

  const schedulePanel = hasSchedule
    ? `<div class="schedule-panel" id="panel-${item.id}">
         <div class="schedule-panel-inner" id="panel-inner-${item.id}">
           <div class="schedule-panel-label">Suggested Schedule</div>
           <div class="schedule-loading" id="schedule-content-${item.id}">Loading…</div>
         </div>
       </div>`
    : "";

  return `
    <div class="history-card" id="card-${item.id}">
      <div class="history-card-main">
        <div class="history-drugs">
          <div class="history-drug-names">${escHtml(drugs)}</div>
          <div class="history-date">${date}</div>
        </div>
        ${badge}
        ${scheduleBtn}
      </div>
      ${schedulePanel}
    </div>
  `;
}


// ── Schedule Toggle (GSAP) ────────────────────────────────────
async function toggleSchedule(id) {
  const panel  = document.getElementById(`panel-${id}`);
  const toggle = document.getElementById(`toggle-${id}`);

  if (!panel || !toggle) return;

  const isOpen = openSchedules.has(id);

  if (isOpen) {
    // Close
    gsap.to(panel, {
      height: 0,
      duration: 0.3,
      ease: "power2.inOut",
      onComplete: () => {
        openSchedules.delete(id);
        toggle.classList.remove("open");
      }
    });
    return;
  }

  // Open — fetch schedule if not yet loaded
  toggle.classList.add("open");
  openSchedules.add(id);

  const contentEl = document.getElementById(`schedule-content-${id}`);
  const isLoaded  = contentEl?.dataset.loaded === "true";

  if (!isLoaded) {
    await fetchAndRenderSchedule(id);
  }

  // Animate open to natural height
  const inner  = document.getElementById(`panel-inner-${id}`);
  const height = inner ? inner.scrollHeight + 42 : "auto"; // 42 = padding top + bottom

  gsap.fromTo(panel,
    { height: 0 },
    { height: height, duration: 0.35, ease: "power2.out" }
  );
}


// ── Schedule Fetch & Render ───────────────────────────────────
async function fetchAndRenderSchedule(id) {
  const contentEl = document.getElementById(`schedule-content-${id}`);
  if (!contentEl) return;

  try {
    const res  = await fetch(`${API_BASE}/user/history/${id}/schedule`, {
      headers: Auth.headers()
    });

    const data = await res.json();

    contentEl.dataset.loaded = "true";

    if (!res.ok || !data) {
      contentEl.innerHTML = `<p class="no-schedule-msg">Schedule not available.</p>`;
      return;
    }

    let html = "";

    if (data.message) {
      html += `<div class="schedule-message">${escHtml(data.message)}</div>`;
    }

    if (data.scheduleData && data.scheduleData.length > 0) {
      html += `<div class="schedule-blocks">`;
      data.scheduleData.forEach(block => {
        html += `
          <div class="schedule-block">
            <div class="schedule-dot ${escHtml(block.color)}"></div>
            <div class="schedule-block-info">
              <div class="schedule-block-drug">${escHtml(block.drug)}</div>
              <div class="schedule-block-time">${escHtml(block.time)}</div>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    contentEl.innerHTML = html || `<p class="no-schedule-msg">No schedule data found.</p>`;

  } catch (err) {
    console.error("[Profile] Schedule fetch failed:", err.message);
    if (contentEl) {
      contentEl.innerHTML = `<p class="no-schedule-msg">Could not load schedule.</p>`;
      contentEl.dataset.loaded = "true";
    }
  }
}


// ── Helpers ───────────────────────────────────────────────────
function formatDrugNames(drug1, drug2) {
  if (!drug1 && !drug2) return "Unknown drugs";
  if (!drug2) return drug1;
  if (!drug1) return drug2;
  return `${drug1} + ${drug2}`;
}

function buildBadge(severity) {
  if (!severity) return `<span class="severity-badge none">No data</span>`;

  const lower = severity.toLowerCase();
  let cls = "none";

  if (lower.includes("contraindicated")) cls = "contraindicated";
  else if (lower.includes("major"))      cls = "major";
  else if (lower.includes("moderate"))   cls = "moderate";
  else if (lower.includes("minor"))      cls = "minor";

  return `<span class="severity-badge ${cls}">${escHtml(severity)}</span>`;
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