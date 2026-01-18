// ===============================
// USER DASHBOARD – SESSION & DATA
// ===============================

/* ===============================
   CONFIG
================================ */
const API_BASE = "http://localhost:5000/api"; // FIXED
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/* ===============================
   SAFE LOGIN REDIRECT
================================ */
function redirectToLogin() {
  window.location.replace("/civic/html/auth/index.html");
}

/* ===============================
   SESSION LOAD (SAFE)
================================ */
let session = null;

try {
  session = JSON.parse(localStorage.getItem("citizenSession"));
} catch {
  session = null;
}

if (!session || !session.token) {
  redirectToLogin();
  return; //  VERY IMPORTANT
}

/* ===============================
   UPDATE LAST ACTIVE
================================ */
session.lastActive = Date.now();
localStorage.setItem("citizenSession", JSON.stringify(session));

/* ===============================
   AUTO LOGOUT ON IDLE
================================ */
function checkSessionExpiry() {
  const s = JSON.parse(localStorage.getItem("citizenSession"));
  if (!s) return;

  if (Date.now() - s.lastActive > SESSION_TIMEOUT) {
    alert("Session expired. Please login again.");
    logout();
  }
}

["click", "mousemove", "keydown", "scroll"].forEach(evt => {
  document.addEventListener(evt, () => {
    const s = JSON.parse(localStorage.getItem("citizenSession"));
    if (!s) return;
    s.lastActive = Date.now();
    localStorage.setItem("citizenSession", JSON.stringify(s));
  });
});

setInterval(checkSessionExpiry, 60000);

/* ===============================
   LOGOUT
================================ */
function logout() {
  localStorage.removeItem("citizenSession");
  redirectToLogin();
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);

/* ===============================
   USER NAME DISPLAY
================================ */
document.querySelectorAll(".font-bold").forEach(el => {
  if (el.textContent.toLowerCase().includes("alex")) {
    el.textContent = session.name || "User";
  }
});

const welcomeHeading = document.querySelector("h1");
if (welcomeHeading && session.name) {
  welcomeHeading.innerHTML = `Welcome back, ${session.name.split(" ")[0]}!`;
}

/* ===============================
   FETCH DASHBOARD DATA FIXED
================================ */
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/user-dashboard`, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });

    if (res.status === 401) {
      logout();
      return; //  STOP EXECUTION
    }

    if (!res.ok) {
      throw new Error(`Dashboard fetch failed (${res.status})`);
    }

    const data = await res.json();
    updateStats(data);
    updateActivity(data.reports || []);

  } catch (err) {
    console.error("Dashboard API error:", err.message);
    showFallback();
  }
}

loadDashboard();

/* ===============================
   UPDATE STATS
================================ */
function updateStats(data) {
  const numbers = document.querySelectorAll(".text-3xl.font-black");
  if (numbers.length >= 3) {
    numbers[0].textContent = data.total ?? 0;
    numbers[1].textContent = data.resolved ?? 0;
    numbers[2].textContent = data.active ?? 0;
  }
}

/* ===============================
   UPDATE ACTIVITY
================================ */
function updateActivity(reports) {
  const container = document.querySelector(".lg\\:col-span-2 .bg-white");
  if (!container) return;

  container.innerHTML = "";

  if (!reports.length) {
    container.innerHTML = `
      <div class="p-6 text-gray-400 text-center">
        No recent activity
      </div>
    `;
    return;
  }

  reports.forEach(r => {
    const div = document.createElement("div");
    div.className = "p-6 border-b hover:bg-gray-50 transition";

    div.innerHTML = `
      <div class="flex justify-between mb-2">
        <h4 class="font-bold">${r.title || "Report"}</h4>
        <span class="text-xs text-gray-400">
          ${new Date(r.createdAt || Date.now()).toLocaleString()}
        </span>
      </div>
      <span class="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">
        ${r.status || "Submitted"}
      </span>
    `;

    container.appendChild(div);
  });
}

/* ===============================
   FALLBACK
================================ */
function showFallback() {
  updateStats({ total: 0, resolved: 0, active: 0 });
  updateActivity([]);
}

console.log("User Dashboard Loaded Successfully");
