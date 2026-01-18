

  /* ======================
     SAFE AUTH GUARD
  ====================== */
  let session = null;

  try {
    session = JSON.parse(localStorage.getItem("citizenSession"));
  } catch {
    session = null;
  }

  const TOKEN = session.token;

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
  const departmentChartEl = document.getElementById("departmentChart");

  let reports = [];
  let previousReportIds = new Set();

  let map = null;
  let markerLayer = null;

  let zoneChart = null;
  let statusChart = null;
  let departmentChart = null;

  /* ======================
     FETCH REPORTS
====================== */
  async function loadReports(showNotify = false) {
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

      const newReports = await res.json();

      detectNewReports(newReports, showNotify);

      reports = newReports;
      normalizeReports();
      renderTable();
      renderCharts();
      initMap();

    } catch (err) {
      console.error("REPORT ANALYTICS ERROR:", err);
    }
  }

  /* ======================
     NEW REPORT DETECTOR
====================== */
  function detectNewReports(newReports, notify) {
    if (!notify) {
      previousReportIds = new Set(newReports.map(r => r._id));
      return;
    }

    const incoming = newReports.filter(
      r => !previousReportIds.has(r._id)
    );

    if (incoming.length > 0) {
      showToast(` ${incoming.length} new report(s) received`);
      playSound();
    }

    previousReportIds = new Set(newReports.map(r => r._id));
  }

  /* ======================
     NORMALIZE DATA
====================== */
  function normalizeReports() {
    reports = reports.map(r => ({
      ...r,
      status: (r.status || "Unknown").toString().trim(),
      zone: r.zone || r.area || "General",
      department: r.department || "Unassigned"
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
    const departmentCount = {};

    reports.forEach(r => {
      zoneCount[r.zone] = (zoneCount[r.zone] || 0) + 1;
      statusCount[r.status] = (statusCount[r.status] || 0) + 1;
      departmentCount[r.department] =
        (departmentCount[r.department] || 0) + 1;
    });

    zoneChart?.destroy();
    statusChart?.destroy();
    departmentChart?.destroy();

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
      options: { responsive: true, maintainAspectRatio: false }
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
      options: { responsive: true, maintainAspectRatio: false }
    });

    if (departmentChartEl) {
      departmentChart = new Chart(departmentChartEl, {
        type: "bar",
        data: {
          labels: Object.keys(departmentCount),
          datasets: [{
            label: "Reports by Department",
            data: Object.values(departmentCount),
            backgroundColor: "#10b981"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } }
        }
      });
    }
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

      const [lat, lng] = r.location.split(",").map(Number);
      if (!lat || !lng) return;

      L.marker([lat, lng])
        .addTo(markerLayer)
        .bindPopup(`
          <strong>${r.title}</strong><br>
          ${r.department}<br>
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
     TOAST + SOUND
====================== */
  function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function playSound() {
    const audio = new Audio("/civic/assets/notify.mp3");
    audio.play().catch(() => {});
  }

  /* ======================
     LIVE AUTO REFRESH
====================== */
  loadReports(false); // initial load

  setInterval(() => {
    loadReports(true); // notify enabled
  }, 30000); // 30 sec

  console.log("Reports Analytics Loaded (Live + Department Enabled)");

});
