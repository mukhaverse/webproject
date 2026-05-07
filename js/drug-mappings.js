

(function() {
  const user = Auth.getUser();
  if (!user || user.role !== "admin") {
    window.location.href = "/";
  }
})();


document.addEventListener("DOMContentLoaded", () => {
  loadPending();
  loadResolved();
});





async function loadPending() {
  const tbody = document.getElementById("pendingBody");

  try {
    const res  = await fetch(`${API_BASE}/admin/mappings/pending`, {
      headers: Auth.headers()
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed");

    updateStatus(data.length);

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty">No pending drugs.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(d => `
      <tr id="row-${d.id}">
        <td><strong>${escHtml(d.drug_name)}</strong></td>
        <td>${new Date(d.attempted_at).toLocaleString()}</td>
        <td>
          <input
            type="text"
            id="input-${d.id}"
            placeholder="e.g. Acetylsalicylic acid"
          >
        </td>
        <td>
          <button onclick="resolve(${d.id}, '${escHtml(d.drug_name)}')">Save</button>
          <div class="msg" id="msg-${d.id}"></div>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty">Failed to load: ${err.message}</td></tr>`;
  }
}





async function loadResolved() {
  const tbody = document.getElementById("resolvedBody");

  try {
    const res  = await fetch(`${API_BASE}/admin/mappings/resolved`, {
      headers: Auth.headers()
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed");

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty">No resolved mappings yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(m => `
      <tr>
        <td>${escHtml(m.original)}</td>
        <td><strong>${escHtml(m.mapped)}</strong></td>
        <td>${escHtml(m.resolved_by_name || "Admin")}</td>
        <td>${new Date(m.created_at).toLocaleString()}</td>
      </tr>
    `).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty">Failed to load: ${err.message}</td></tr>`;
  }
}






async function resolve(id, drugName) {
  const input  = document.getElementById(`input-${id}`);
  const msgEl  = document.getElementById(`msg-${id}`);
  const mapped = input.value.trim();

  msgEl.className = "msg";
  msgEl.textContent = "";

  if (!mapped) {
    msgEl.className = "msg error";
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
      msgEl.className = "msg error";
      msgEl.textContent = data.error || "Failed to save.";
      return;
    }


    // Remove the resolved row from pending and reload resolved table
    const row = document.getElementById(`row-${id}`);
    if (row) row.remove();

    loadResolved();
    updateStatusAfterResolve();

  } catch (err) {
    msgEl.className = "msg error";
    msgEl.textContent = "Could not reach server.";
  }
}





function updateStatus(pendingCount) {
  const el = document.getElementById("status");
  if (!el) return;
  el.textContent = pendingCount === 0
    ? "All drugs resolved."
    : `${pendingCount} drug${pendingCount > 1 ? "s" : ""} waiting to be mapped.`;
}

function updateStatusAfterResolve() {
  const remaining = document.querySelectorAll("#pendingBody tr[id^='row-']").length;
  updateStatus(remaining);
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