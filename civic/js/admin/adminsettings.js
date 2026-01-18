/* =====================================================
   ADMIN SETTINGS – SMART CITY (FIXED & SECURE)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const API_BASE = "http://localhost:5000/api/admin";

  /* ======================
     AUTH GUARD
  ====================== */
  let session = null;

  try {
    session = JSON.parse(localStorage.getItem("citizenSession"));
  } catch {
    session = null;
  }


  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    "Content-Type": "application/json"
  };

  /* ---------- ELEMENTS ---------- */
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const departmentInput = document.getElementById("department");
  const languageSelect = document.getElementById("language");
  const notificationCheck = document.getElementById("notifications");

  const saveBtn = document.getElementById("saveBtn");
  const passBtn = document.getElementById("passBtn");

  const oldPassword = document.getElementById("oldPassword");
  const newPassword = document.getElementById("newPassword");

  /* ======================
     FORCE LOGOUT
  ====================== */
  function forceLogout() {
    localStorage.removeItem("citizenSession");
    window.location.replace("/civic/html/auth/adminLogin.html");
  }

  /* ======================
     LOAD SETTINGS
  ====================== */
  async function loadSettings() {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        headers: authHeaders
      });

      if (res.status === 401 || res.status === 403) {
        forceLogout();
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to load settings (${res.status})`);
      }

      const data = await res.json();

      nameInput.value = data.name || "";
      emailInput.value = data.email || "";
      departmentInput.value = data.department || "";
      languageSelect.value = data.language || "English";
      notificationCheck.checked = data.notifications ?? true;

    } catch (err) {
      console.error("SETTINGS LOAD ERROR:", err.message);
      alert("Failed to load admin settings");
    }
  }

  loadSettings();

  /* ======================
     SAVE SETTINGS
  ====================== */
  saveBtn.addEventListener("click", async () => {
    if (!nameInput.value || !emailInput.value) {
      alert("Name and Email are required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          department: departmentInput.value.trim(),
          language: languageSelect.value,
          notifications: notificationCheck.checked
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(" Settings saved successfully");

    } catch (err) {
      console.error("SAVE SETTINGS ERROR:", err.message);
      alert("Failed to save settings");
    }
  });

  /* ======================
     CHANGE PASSWORD
  ====================== */
  passBtn.addEventListener("click", async () => {
    if (!oldPassword.value || !newPassword.value) {
      alert("Please fill both password fields");
      return;
    }

    if (newPassword.value.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/change-password`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          oldPassword: oldPassword.value,
          newPassword: newPassword.value
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(" Password changed successfully");
      oldPassword.value = "";
      newPassword.value = "";

    } catch (err) {
      console.error("PASSWORD CHANGE ERROR:", err.message);
      alert("Password change failed");
    }
  });

  console.log(" Admin Settings Loaded");

});
