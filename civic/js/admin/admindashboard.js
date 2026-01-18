/* =====================================================
   ADMIN DASHBOARD – AUTH + LIVE DATA HANDLER (FINAL)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const API_BASE = "http://localhost:5000/api/admin";

  /* ======================
     AUTH GUARD (SAFE)
  ====================== */
  let session;

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
  const kpiCards = document.querySelectorAll(".kpis .card h3");
  const profileName = document.querySelector(".profile strong");
  const profileRole = document.querySelector(".profile span");

  /* ======================
     LOGOUT
  ====================== */
  document.querySelector(".profile")?.addEventListener("click", () => {
    if (confirm("Logout from admin panel?")) {
      localStorage.removeItem("citizenSession");
      window.location.replace("/civic/html/auth/adminLogin.html");
    }
  });

  /* ======================
     LOAD PROFILE
  ====================== */
  async function loadAdminProfile() {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: authHeaders
      });

      if (!res.ok) return;

      const data = await res.json();
      if (profileName) profileName.textContent = data.name || "Admin";
      if (profileRole) profileRole.textContent = data.role || "Administrator";

    } catch (err) {
      console.error("Profile error:", err.message);
    }
  }

  /* ======================
     KPI ANIMATION
  ====================== */
  function animateValue(el, value) {
    if (!el) return;
    el.style.transform = "scale(1.1)";
    el.textContent = value;
    setTimeout(() => {
      el.style.transform = "scale(1)";
    }, 200);
  }

  /* ======================
     LOAD DASHBOARD STATS
     (LIVE AUTO UPDATE)
  ====================== */
  async function loadDashboardStats() {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: authHeaders
      });

      if (!res.ok) return;

      const data = await res.json();

      const values = [
        data.totalReports ?? 0,
        data.avgResolution ? `${data.avgResolution} hrs` : "—",
        data.activeCrews ?? 0,
        `${data.satisfaction ?? 0}%`
      ];

      kpiCards.forEach((el, i) => {
        if (el.textContent !== String(values[i])) {
          animateValue(el, values[i]);
        }
      });

    } catch (err) {
      console.error("Stats error:", err.message);
    }
  }

  /* ======================
     MAP INIT (SAFE)
  ====================== */
  function initMap() {
    const mapEl = document.getElementById("map");
    if (!mapEl || typeof L === "undefined") return;

    const map = L.map("map").setView([22.9734, 78.6569], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);
  }

  /* ======================
     INIT
  ====================== */
  loadAdminProfile();
  loadDashboardStats();
  initMap();

  // LIVE KPI REFRESH (Every 5 Seconds)
  setInterval(loadDashboardStats, 5000);

  console.log("Admin Dashboard Loaded with Live KPIs");
});
