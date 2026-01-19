/* =====================================================
   REPORTS – ADMIN ANALYTICS (FINAL | FIXED)
===================================================== */

/* ======================
   AUTH GUARD
====================== */
let session = null;

try {
  session = JSON.parse(localStorage.getItem("citizenSession"));
} catch {
  session = null;
}

// if (!session || session.role !== "admin" || !session.token) {
//   window.location.replace("/civic/html/auth/adminLogin.html");
// }

/* ======================
   DOM READY
====================== */
document.addEventListener("DOMContentLoaded", () => {

  const TOKEN = session.token;
  const API = "http://localhost:5000/api/admin";

  /* ---------- ELEMENTS ---------- */
  const tableBody = document.getElementById("reportTable");
  const mapView = document.getElementById("mapView");
  const listView = document.getElementById("listView");

  const mapBtn = document.getElementById("mapBtn");
  const listBtn = document.getElementById("listBtn");

  const zoneChartEl = document.getElementById("zoneChart");
  const statusChartEl = document.getElementById("statusChart");

  let reports = [];
  let map = null;
  let markerLayer = null;
  let zoneChart = null;
  let statusChart = null;

  /* ======================
     FETCH REPORTS
====================== */
  async function loadReports() {
    try {
      const res = await fetch(`${API}/reports`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem("citizenSession");
        window.location.replace("/civic/html/auth/adminLogin.html");
        return;
      }

      if (!res.ok) throw new Error("Fetch failed");

      reports = await res.json();

      normalizeReports();
      renderTable();
      renderCharts();
      initMap();

    } catch (err) {
      console.error("REPORT ANALYTICS ERROR:", err);
      alert("Unable to load reports analytics");
    }
  }

  /* ======================
     NORMALIZE DATA
====================== */
  function normalizeReports() {
    reports = reports.map(r => ({
      ...r,
      status: (r.status || "Unknown").toString().trim(),
      zone: r.zone || r.area || "General"
    }));
  }

  /* ======================
     TABLE
====================== */
  function renderTable() {
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!reports.length) {
      tableBody.innerHTML =
        `<tr><td colspan="5">No reports found</td></tr>`;
      return;
    }

    reports.forEach(r => {
      tableBody.innerHTML += `
        <tr>
          <td>${r._id || "-"}</td>
          <td>${r.title || "-"}</td>
          <td>${r.zone}</td>
          <td>${r.status}</td>
          <td>${new Date(r.createdAt || Date.now()).toLocaleDateString()}</td>
        </tr>
      `;
    });
  }

  /* ======================
     CHARTS
====================== */
  function renderCharts() {
    const zoneCount = {};
    const statusCount = {};

    reports.forEach(r => {
      zoneCount[r.zone] = (zoneCount[r.zone] || 0) + 1;
      statusCount[r.status] = (statusCount[r.status] || 0) + 1;
    });

    zoneChart?.destroy();
    statusChart?.destroy();

    zoneChart = new Chart(zoneChartEl, {
      type: "bar",
      data: {
        labels: Object.keys(zoneCount),
        datasets: [{
          label: "Reports",
          data: Object.values(zoneCount),
          backgroundColor: "#4f46e5"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    statusChart = new Chart(statusChartEl, {
      type: "doughnut",
      data: {
        labels: Object.keys(statusCount),
        datasets: [{
          data: Object.values(statusCount),
          backgroundColor: [
            "#2563eb",
            "#f59e0b",
            "#16a34a",
            "#6b7280"
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  /* ======================
     MAP
====================== */
  function initMap() {
    if (!map) {
      map = L.map("map").setView([23.02, 72.57], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(map);

      markerLayer = L.layerGroup().addTo(map);
    }

    markerLayer.clearLayers();

    reports.forEach(r => {
      if (!r.location) return;

      const [lat, lng] = r.location
        .split(",")
        .map(v => Number(v.trim()));

      if (!lat || !lng) return;

      L.marker([lat, lng])
        .addTo(markerLayer)
        .bindPopup(`
          <strong>${r.title || "Report"}</strong><br>
          ${r.zone}<br>
          Status: ${r.status}
        `);
    });
  }

  /* ======================
     VIEW TOGGLE
====================== */
  mapBtn?.addEventListener("click", () => {
    listView.classList.add("hidden");
    mapView.classList.remove("hidden");

    mapBtn.classList.add("active");
    listBtn.classList.remove("active");

    setTimeout(() => map?.invalidateSize(), 200);
  });

  listBtn?.addEventListener("click", () => {
    mapView.classList.add("hidden");
    listView.classList.remove("hidden");

    listBtn.classList.add("active");
    mapBtn.classList.remove("active");
  });

  /* ======================
     INIT
====================== */
  loadReports();
  console.log("Reports Analytics Loaded Successfully");

});
