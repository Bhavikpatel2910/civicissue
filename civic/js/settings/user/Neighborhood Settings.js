/* =========================================
   TEAM-SPARK — Neighborhood Settings
========================================= */

const API = "http://localhost:5000/api";
const session = JSON.parse(localStorage.getItem("citizenSession"));

if (!session || !session.token) {
  window.location.href = "/civic/html/auth/LoginPage.html";
}

/* ============================
   ELEMENTS
============================ */
const addressInput = document.querySelector(".search-box input");
const radiusSlider = document.getElementById("radiusSlider");
const radiusValue = document.getElementById("radiusValue");
const saveBtn = document.querySelector(".primary.full");
const toggles = document.querySelectorAll(".switch input");
const avatar = document.querySelector(".avatar");

/* ============================
   MAP
============================ */
let lat = 23.03;
let lng = 72.55;
let radius = 2.5;

// Fake map animation
const circle = document.querySelector(".radius-circle");
function updateCircle() {
  const size = radius * 60;
  circle.style.width = size + "px";
  circle.style.height = size + "px";
}

/* ============================
   LOAD SETTINGS
============================ */
async function loadSettings() {
  try {
    const res = await fetch(API + "/neighborhood", {
      headers: {
        Authorization: "Bearer " + session.token
      }
    });

    if (res.status === 401) {
      localStorage.removeItem("citizenSession");
      return window.location.href = "/civic/html/auth/LoginPage.html";
    }

    const data = await res.json();

    addressInput.value = data.address || "";
    lat = data.lat;
    lng = data.lng;
    radius = data.radius || 2.5;

    toggles[0].checked = data.notifyReports;
    toggles[1].checked = data.notifyEvents;

    radiusSlider.value = radius;
    radiusValue.innerText = radius + " km";
    updateCircle();

  } catch (err) {
    console.error("LOAD SETTINGS ERROR:", err);
  }
}

/* ============================
   RADIUS
============================ */
radiusSlider.oninput = () => {
  radius = radiusSlider.value;
  radiusValue.innerText = radius + " km";
  updateCircle();
};

/* ============================
   SEARCH LOCATION
============================ */
addressInput.onchange = async () => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${addressInput.value}`
    );

    const data = await res.json();
    if (!data.length) return alert("Location not found");

    lat = data[0].lat;
    lng = data[0].lon;

  } catch {
    alert("Location search failed");
  }
};

/* ============================
   SAVE
============================ */
saveBtn.onclick = async () => {
  saveBtn.innerText = "Saving...";
  saveBtn.disabled = true;

  try {
    const res = await fetch(API + "/neighborhood", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.token
      },
      body: JSON.stringify({
        address: addressInput.value,
        lat,
        lng,
        radius,
        notifyReports: toggles[0].checked,
        notifyEvents: toggles[1].checked
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    alert("Neighborhood settings saved");

  } catch (err) {
    alert(err.message || "Save failed");
  }

  saveBtn.innerText = "Save Area Settings";
  saveBtn.disabled = false;
};

/* ============================
   LOGOUT
============================ */
avatar.onclick = () => {
  if (confirm("Logout?")) {
    localStorage.removeItem("citizenSession");
    window.location.href = "/civic/html/auth/LoginPage.html";
  }
};

/* ============================
   START
============================ */
loadSettings();
