/* =====================================================
   ADMIN DASHBOARD – AUTH + DATA HANDLER (FINAL)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const API_BASE = "http://localhost:5000/api/admin";

  /* ======================
     AUTH GUARD (STRICT)
  ====================== */
  let session = null;

  try {
    session = JSON.parse(localStorage.getItem("citizenSession"));
  } catch {
    session = null;
  }

  // if (!session || !session.token || session.role !== "admin") {
  //   window.location.replace("/civic/html/auth/adminLogin.html");
  //   return;
  // }

  const authHeaders = {
    Authorization: `Bearer ${session.token}`
  };

  /* ======================
     ELEMENTS (HTML MATCHED)
  ====================== */
  const kpiCards = document.querySelectorAll(".kpis .card h3");
  const profileName = document.querySelector(".profile strong");
  const profileRole = document.querySelector(".profile span");

  /* ======================
     LOGOUT (SIDEBAR PROFILE CLICK)
  ====================== */
  document.querySelector(".profile")?.addEventListener("click", () => {
    if (confirm("Logout from admin panel?")) {
      localStorage.removeItem("citizenSession");
      window.location.replace("/civic/html/auth/adminLogin.html");
    }
  });

  /* ======================
     LOAD ADMIN PROFILE
  ====================== */
  async function loadAdminProfile() {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: authHeaders
      });

      if (res.status === 401 || res.status === 403) {
        forceLogout();
        return;
      }

      if (!res.ok) throw new Error("Profile fetch failed");

      const data = await res.json();

      if (profileName) profileName.textContent = data.name || "Admin";
      if (profileRole) profileRole.textContent = data.role || "Administrator";

    } catch (err) {
      console.error("Admin profile error:", err.message);
    }
  }

  /* ======================
     LOAD DASHBOARD STATS
  ====================== */
  async function loadDashboardStats() {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: authHeaders
      });

      if (res.status === 401 || res.status === 403) {
        forceLogout();
        return;
      }

      if (!res.ok) throw new Error("Stats fetch failed");

      const data = await res.json();

      // KPI order must match HTML
      const values = [
        data.totalReports ?? 0,
        data.avgResolution ?? "—",
        data.activeCrews ?? 0,
        `${data.satisfaction ?? 0}%`
      ];

      kpiCards.forEach((el, i) => {
        el.textContent = values[i] ?? "—";
      });

    } catch (err) {
      console.error("Dashboard stats error:", err.message);
    }
  }

  /* ======================
     MAP INITIALIZATION
  ====================== */
  function initMap() {
    const map = L.map("map").setView([22.9734, 78.6569], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    console.log("Admin map initialized");
  }

  /* ======================
     FORCE LOGOUT
  ====================== */
  function forceLogout() {
    localStorage.removeItem("citizenSession");
    window.location.replace("/civic/html/auth/adminLogin.html");
  }

  /* ======================
     INIT
  ====================== */
  loadAdminProfile();
  loadDashboardStats();
  initMap();

  console.log("Admin Dashboard Loaded Successfully");
});
