/* =====================================================
   ADMIN MAP – SMART CITY (LEAFLET | AUTO REFRESH | FIXED)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     AUTH CHECK (SAFE & STRICT)
  =============================== */
  let session = null;

  try {
    session = JSON.parse(localStorage.getItem("citizenSession"));
  } catch {
    session = null;
  }

  if (!session || session.role !== "admin" || !session.token) {
    localStorage.removeItem("citizenSession");
    window.location.replace("/civic/html/auth/adminLogin.html");
    return;
  }

  const TOKEN = session.token;
  const API_BASE = "http://localhost:5000/api/admin";

  /* ===============================
     MAP INITIALIZATION
  =============================== */
  if (!window.L) {
    alert("Map library failed to load");
    return;
  }

  const map = L.map("map", {
    zoomControl: true,
    attributionControl: true
  }).setView([22.9734, 78.6569], 5); // India

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  /* ===============================
     STATUS COLORS
  =============================== */
  const STATUS_COLOR = {
    critical: "#e53935",
    warning: "#fb8c00",
    info: "#1e88e5",
    resolved: "#43a047"
  };

  /* ===============================
     MARKER LAYER
  =============================== */
  const markerLayer = L.layerGroup().addTo(map);

  /* ===============================
     LOAD ISSUES
  =============================== */
  async function loadIssues() {
    try {
      const res = await fetch(`${API_BASE}/issues/map`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        forceLogout();
        return;
      }

      if (!res.ok) throw new Error("Map API failed");

      const issues = await res.json();
      renderMarkers(Array.isArray(issues) ? issues : []);

    } catch (err) {
      console.error("MAP LOAD ERROR:", err.message);
    }
  }

  /* ===============================
     RENDER MARKERS
  =============================== */
  function renderMarkers(issues) {
    markerLayer.clearLayers();

    issues.forEach(issue => {
      const lat = issue.latitude ?? issue.lat;
      const lng = issue.longitude ?? issue.lng;
      if (!lat || !lng) return;

      const status = (issue.status || "info").toLowerCase();
      const color = STATUS_COLOR[status] || STATUS_COLOR.info;

      const marker = L.circleMarker([lat, lng], {
        radius: 9,
        color,
        fillColor: color,
        fillOpacity: 0.85
      });

      marker.bindPopup(buildPopup(issue, color));
      marker.addTo(markerLayer);
    });
  }

  /* ===============================
     POPUP TEMPLATE
  =============================== */
  function buildPopup(issue, color) {
    return `
      <div style="min-width:220px">
        <h3 style="margin:0;color:${color}">
          ${issue.title || "Reported Issue"}
        </h3>
        <p>${issue.description || ""}</p>
        <strong>${issue.location || "Unknown"}</strong><br>
        <small>Status: ${(issue.status || "info").toUpperCase()}</small>
        <hr>
        <button onclick="window.__assignCrew('${issue._id}')">🚧 Assign Crew</button>
        <button onclick="window.__resolveIssue('${issue._id}')">Resolve</button>
      </div>
    `;
  }

  /* ===============================
     ADMIN ACTIONS (GLOBAL SAFE)
  =============================== */
  window.__assignCrew = async (id) => {
    try {
      const crew = prompt("Enter crew name:");
      if (!crew) return;

      const res = await fetch(`${API_BASE}/issues/${id}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ crew })
      });

      if (!res.ok) throw new Error();
      alert("Crew assigned");
      loadIssues();

    } catch {
      alert("Failed to assign crew");
    }
  };

  window.__resolveIssue = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/issues/${id}/resolve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });

      if (!res.ok) throw new Error();
      alert("Issue resolved");
      loadIssues();

    } catch {
      alert("Failed to resolve issue");
    }
  };

  /* ===============================
     ADMIN GEOLOCATION
  =============================== */
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = [pos.coords.latitude, pos.coords.longitude];

        L.marker(loc)
          .addTo(map)
          .bindPopup("🧑‍💼 You (Admin)")
          .openPopup();

        map.setView(loc, 10);
      },
      () => console.warn("Admin location denied")
    );
  }

  /* ===============================
     LIVE PULSE EFFECT
  =============================== */
  setInterval(() => {
    const layers = markerLayer.getLayers();
    if (!layers.length) return;

    const random = layers[Math.floor(Math.random() * layers.length)];
    const latlng = random.getLatLng();

    const pulse = L.circle(latlng, {
      radius: 250,
      color: "#999",
      fillOpacity: 0.2
    }).addTo(map);

    setTimeout(() => map.removeLayer(pulse), 1200);
  }, 5000);

  /* ===============================
     AUTO REFRESH (30s)
  =============================== */
  const REFRESH_INTERVAL = 30000;
  let refreshTimer = null;

  function startAutoRefresh() {
    loadIssues();
    refreshTimer = setInterval(loadIssues, REFRESH_INTERVAL);
    console.log("🟢 Map auto-refresh enabled (30s)");
  }

  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    document.hidden ? stopAutoRefresh() : startAutoRefresh();
  });

  /* ===============================
     FORCE LOGOUT
  =============================== */
  function forceLogout() {
    localStorage.removeItem("citizenSession");
    window.location.replace("/civic/html/auth/adminLogin.html");
  }

  /* ===============================
     INIT
  =============================== */
  startAutoRefresh();
  console.log("Admin Smart City Map Loaded (Auto-refresh ON)");

});
