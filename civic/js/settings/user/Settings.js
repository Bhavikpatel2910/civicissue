/* ==========================================
   UrbanConnect — Notification & Area Settings
========================================== */

const API = "http://localhost:5000/api";
const session = JSON.parse(localStorage.getItem("citizenSession"));

if (!session || !session.token) {
  window.location.href = "/civic/html/auth/LoginPage.html";
}

/* ============================
   ELEMENTS
============================ */
const toggles = document.querySelectorAll(".switch input");
const neighborhoodSelect = document.querySelector("select");
const radiusSlider = document.getElementById("radiusSlider");
const radiusValue = document.getElementById("radiusValue");

const saveBtn = document.querySelector(".primary");
const discardBtn = document.querySelector(".secondary");
const logoutBtn = document.querySelector(".logout");
const avatar = document.querySelector(".avatar");

/* ============================
   STATE
============================ */
let originalSettings = {};

/* ============================
   LOAD SETTINGS
============================ */
async function loadSettings() {
  try {
    const res = await fetch(API + "/user-settings", {
      headers: {
        Authorization: "Bearer " + session.token
      }
    });

    if (res.status === 401) {
      localStorage.removeItem("citizenSession");
      return window.location.href = "/civic/html/auth/LoginPage.html";
    }

    const data = await res.json();

    toggles[0].checked = data.reportUpdates;
    toggles[1].checked = data.nearbyAlerts;
    toggles[2].checked = data.monthlySummary;

    neighborhoodSelect.value = data.neighborhood;
    radiusSlider.value = data.radius;
    radiusValue.innerText = (data.radius / 1000).toFixed(1) + " km";

    originalSettings = JSON.stringify(data);

  } catch (err) {
    console.error("SETTINGS LOAD ERROR:", err);
  }
}

/* ============================
   SLIDER UI
============================ */
radiusSlider.oninput = () => {
  radiusValue.innerText = (radiusSlider.value / 1000).toFixed(1) + " km";
};

/* ============================
   SAVE SETTINGS
============================ */
saveBtn.onclick = async () => {
  try {
    const payload = {
      reportUpdates: toggles[0].checked,
      nearbyAlerts: toggles[1].checked,
      monthlySummary: toggles[2].checked,
      neighborhood: neighborhoodSelect.value,
      radius: Number(radiusSlider.value)
    };

    const res = await fetch(API + "/user-settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.token
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    originalSettings = JSON.stringify(payload);
    alert("Settings saved successfully");

  } catch (err) {
    alert(err.message || "Failed to save settings");
  }
};

/* ============================
   DISCARD CHANGES
============================ */
discardBtn.onclick = () => {
  const saved = JSON.parse(originalSettings);

  toggles[0].checked = saved.reportUpdates;
  toggles[1].checked = saved.nearbyAlerts;
  toggles[2].checked = saved.monthlySummary;
  neighborhoodSelect.value = saved.neighborhood;
  radiusSlider.value = saved.radius;
  radiusValue.innerText = (saved.radius / 1000).toFixed(1) + " km";

  alert("Changes discarded");
};

/* ============================
   LOGOUT
============================ */
logoutBtn.onclick = avatar.onclick = () => {
  if (confirm("Logout from UrbanConnect?")) {
    localStorage.removeItem("citizenSession");
    window.location.href = "/civic/html/auth/LoginPage.html";
  }
};

/* ============================
   INIT
============================ */
loadSettings();
