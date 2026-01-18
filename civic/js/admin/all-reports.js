/* =====================================================
   REPORT MANAGEMENT – ADMIN FRONTEND
   (FINAL + DEPARTMENT FILTER)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ======================
     API CONFIG
  ====================== */
  const API_BASE = "http://localhost:5000/api/admin/reports";

  /* ======================
     AUTH GUARD
  ====================== */
  let session = null;

  try {
    session = JSON.parse(localStorage.getItem("citizenSession"));
  } catch {
    session = null;
  }



  const authHeaders = {
    Authorization: `Bearer ${session.token}`
  };

  /* ======================
     ELEMENTS
  ====================== */
  const reportTable = document.getElementById("reportTable");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const priorityFilter = document.getElementById("priorityFilter");

  //  Department Filter (NEW)
  const departmentFilter = document.getElementById("departmentFilter");

  if (!reportTable) {
    console.warn(" reportTable not found");
    return;
  }

  /* ======================
     FETCH REPORTS
  ====================== */
  async function loadReports() {
    try {
      const params = new URLSearchParams({
        search: searchInput?.value.trim() || "",
        status: statusFilter?.value || "all",
        priority: priorityFilter?.value || "all",
        department: departmentFilter?.value || "all"
      });

      const res = await fetch(`${API_BASE}?${params.toString()}`, {
        headers: authHeaders
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("citizenSession");
        window.location.replace("/civic/html/auth/adminLogin.html");
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reports = await res.json();
      renderReports(reports);

    } catch (err) {
      console.error(" Load reports error:", err.message);
      reportTable.innerHTML =
        `<tr><td colspan="8">Failed to load reports</td></tr>`;
    }
  }

  /* ======================
     RENDER TABLE
  ====================== */
  function renderReports(data) {
    reportTable.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      reportTable.innerHTML =
        `<tr><td colspan="8">No reports found</td></tr>`;
      return;
    }

    data.forEach(r => {
      const status = (r.status || "new").toLowerCase();
      const priority = (r.priority || "low").toLowerCase();

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${r._id.slice(-6)}</td>
        <td><strong>${r.title || "—"}</strong></td>
        <td>${r.category || "—"}</td>
        <td>${r.location || "—"}</td>
        <td class="priority ${priority}">
          ${priority.toUpperCase()}
        </td>
        <td class="status ${status}">
          ${status.replace("-", " ").toUpperCase()}
        </td>
        <td>${new Date(r.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="action-btn" data-id="${r._id}">
            <span class="material-symbols-outlined">visibility</span>
          </button>
        </td>
      `;
      reportTable.appendChild(tr);
    });

    attachViewHandlers();
  }

  /* ======================
     VIEW BUTTON HANDLER
  ====================== */
  function attachViewHandlers() {
    document.querySelectorAll(".action-btn").forEach(btn => {
      btn.onclick = () => {
        window.location.href =
          `/civic/html/admin/manage-issue.html?id=${btn.dataset.id}`;
      };
    });
  }

  /* ======================
     EVENTS
  ====================== */
  searchInput?.addEventListener("input", debounce(loadReports, 400));
  statusFilter?.addEventListener("change", loadReports);
  priorityFilter?.addEventListener("change", loadReports);
  departmentFilter?.addEventListener("change", loadReports);

  /* ======================
     DEBOUNCE
  ====================== */
  function debounce(fn, delay) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  /* ======================
     INIT
  ====================== */
  loadReports();
  console.log(" All Reports page loaded with department filter");

});
