/* =========================================
   TEAM-SPARK — Privacy & Security
========================================= */

const API = "http://localhost:5000/api";
const session = JSON.parse(localStorage.getItem("citizenSession"));

if (!session || !session.token) {
  window.location.href = "/civic/html/auth/LoginPage.html";
}

/* ============================
   ELEMENTS
============================ */
const twoFA = document.querySelectorAll(".switch input")[0];
const locationToggle = document.querySelectorAll(".switch input")[1];
const anonymousToggle = document.querySelectorAll(".switch input")[2];

const currentPass = document.querySelectorAll("input[type=password]")[0];
const newPass = document.querySelectorAll("input[type=password]")[1];
const updateBtn = document.querySelector(".form-grid .primary");

const logoutAllBtn = document.querySelector(".link.primary");
const exportBtn = document.querySelector(".download .primary");
const avatar = document.querySelector(".avatar");

/* ============================
   LOAD SETTINGS
============================ */
async function loadSecurity() {
  try {
    const res = await fetch(API + "/security", {
      headers: {
        Authorization: "Bearer " + session.token
      }
    });

    if (res.status === 401) {
      localStorage.removeItem("citizenSession");
      return window.location.href = "/civic/html/auth/LoginPage.html";
    }

    const data = await res.json();

    twoFA.checked = data.twoFA;
    locationToggle.checked = data.allowLocation;
    anonymousToggle.checked = data.anonymous;

  } catch (err) {
    console.error("SECURITY LOAD ERROR:", err);
  }
}

/* ============================
   TOGGLES
============================ */
twoFA.onchange = () => saveSecurity();
locationToggle.onchange = () => saveSecurity();
anonymousToggle.onchange = () => saveSecurity();

async function saveSecurity() {
  try {
    await fetch(API + "/security", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.token
      },
      body: JSON.stringify({
        twoFA: twoFA.checked,
        allowLocation: locationToggle.checked,
        anonymous: anonymousToggle.checked
      })
    });
  } catch {
    alert("Failed to save security settings");
  }
}

/* ============================
   PASSWORD CHANGE
============================ */
updateBtn.onclick = async () => {
  if (!currentPass.value || !newPass.value) {
    return alert("Enter both passwords");
  }

  try {
    const res = await fetch(API + "/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.token
      },
      body: JSON.stringify({
        current: currentPass.value,
        password: newPass.value
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    alert("Password updated");
    currentPass.value = "";
    newPass.value = "";

  } catch (err) {
    alert(err.message || "Password change failed");
  }
};

/* ============================
   LOGOUT ALL DEVICES
============================ */
logoutAllBtn.onclick = async () => {
  if (!confirm("Logout all devices?")) return;

  try {
    await fetch(API + "/logout-all", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + session.token
      }
    });

    localStorage.removeItem("citizenSession");
    window.location.href = "/civic/html/auth/LoginPage.html";

  } catch {
    alert("Failed to logout devices");
  }
};

/* ============================
   EXPORT DATA
============================ */
exportBtn.onclick = async () => {
  try {
    const res = await fetch(API + "/export-data", {
      headers: {
        Authorization: "Bearer " + session.token
      }
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "UrbanFix_Data.zip";
    a.click();
  } catch {
    alert("Download failed");
  }
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
   INIT
============================ */
loadSecurity();
