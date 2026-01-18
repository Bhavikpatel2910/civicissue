/* =====================================================
   ADMIN DASHBOARD – REAL BACKEND CONNECTED
===================================================== */

const API_BASE = "http://localhost:5000/api";

/* ======================
   SESSION + AUTH
====================== */
let session = null;

try {
  session = JSON.parse(localStorage.getItem("citizenSession"));
} catch {
  session = null;
}


const AUTH_HEADERS = {
  Authorization: `Bearer ${session.token}`
};

/* ======================
   CONFIG
====================== */
const tenant = {
  id: "ahmedabad",
  name: "Ahmedabad Municipal Corporation"
};

const SLA = {
  responseHours: 24,
  resolutionHours: 72
};

let issues = [];

/* ======================
   INIT
====================== */
document.getElementById("tenantName").innerText = tenant.name;
document.getElementById("userRole").innerText = session.role;

applyRBAC();
loadIssues();

/* ======================
   LOAD REPORTS
====================== */
async function loadIssues() {
  try {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: AUTH_HEADERS
    });

    if (res.status === 401) {
      localStorage.removeItem("citizenSession");
      window.location.replace("/civic/html/auth/adminLogin.html");
      return;
    }

    const data = await res.json();

    issues = data.map(r => ({
      id: r._id,
      title: r.title,
      priority: r.priority || "low",
      submittedDate: new Date(r.createdAt).getTime(),
      status: normalizeStatus(r.status)
    }));

    render();
    checkSLABreaches();
    detectAnomaly();

  } catch (err) {
    console.error("Dashboard load error:", err.message);
  }
}

/* ======================
   STATUS NORMALIZER
====================== */
function normalizeStatus(status = "") {
  return status.toLowerCase().replace(" ", "-");
}

/* ======================
   RENDER
====================== */
function render() {
  renderStats();
  renderIssues();
}

function renderStats() {
  document.getElementById("activeIssues").innerText =
    issues.filter(i => i.status !== "resolved").length;

  document.getElementById("urgentIssues").innerText =
    issues.filter(i => i.priority === "high").length;

  document.getElementById("resolvedToday").innerText =
    issues.filter(i => i.status === "resolved").length;
}

function renderIssues() {
  const list = document.getElementById("issueList");
  list.innerHTML = "";

  issues.forEach(i => {
    const div = document.createElement("div");
    div.className = "issue";
    div.innerHTML = `
      <div class="left">
        <div class="title">${i.title}</div>
        <div class="meta">${i.id}</div>
      </div>
      <div class="status ${i.status}">
        ${i.status.replace("-", " ").toUpperCase()}
      </div>
    `;
    list.appendChild(div);
  });
}

/* ======================
   SLA CHECK
====================== */
function checkSLABreaches() {
  const now = Date.now();

  const breached = issues.filter(i => {
    const hours = (now - i.submittedDate) / 36e5;
    return (
      (i.status === "pending" && hours > SLA.responseHours) ||
      (i.status !== "resolved" && hours > SLA.resolutionHours)
    );
  });

  const banner = document.getElementById("slaBanner");
  if (breached.length) {
    banner.innerText = `${breached.length} SLA breaches detected`;
    banner.classList.add("visible");
  } else {
    banner.classList.remove("visible");
  }
}

/* ======================
   ANOMALY DETECTION
====================== */
function detectAnomaly() {
  const history = [10, 12, 11, 13, 12, 11, 12];
  const today = issues.length;

  const avg = history.reduce((a, b) => a + b, 0) / history.length;
  const variance =
    history.reduce((s, v) => s + (v - avg) ** 2, 0) / history.length;
  const std = Math.sqrt(variance);

  if (Math.abs(today - avg) > 2 * std) {
    document.getElementById("statActive").classList.add("anomaly");
  }
}

/* ======================
   RBAC
====================== */
function applyRBAC() {
  document.querySelectorAll("[data-role]").forEach(el => {
    if (el.dataset.role !== session.role) {
      el.style.display = "none";
    }
  });
}

/* ======================
   UPDATE REPORT STATUS
====================== */
function updateReport(reportId, status, note = "") {
  fetch(`${API_BASE}/reports/${reportId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...AUTH_HEADERS
    },
    body: JSON.stringify({ status, note })
  })
    .then(res => {
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    })
    .then(() => {
      alert("Status updated");
      loadIssues();
    })
    .catch(err => alert(err.message));
}

/* ======================
   EXPORT PDF
====================== */
document.getElementById("exportPdfBtn").onclick = async () => {
  const canvas = await html2canvas(document.body, { scale: 2 });
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("landscape");
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, 280, 150);
  pdf.save("admin-dashboard.pdf");
};

/* ======================
   MANUAL SYNC
====================== */
document.getElementById("syncBtn").onclick = () => {
  loadIssues();
  alert("Synced with server");
};
