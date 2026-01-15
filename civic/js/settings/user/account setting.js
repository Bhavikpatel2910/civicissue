/* ===============================
   TEAM-SPARK — ACCOUNT SETTINGS
================================ */

const API = "http://localhost:5000/api";
const session = JSON.parse(localStorage.getItem("citizenSession"));

if (!session || !session.token) {
  window.location.href = "/civic/html/auth/LoginPage.html";
}

/* ===============================
   ELEMENTS
================================ */
const nameInput = document.querySelector('input[type="text"]');
const emailInput = document.querySelector('input[type="email"]');
const phoneInput = document.querySelector('input[type="tel"]');
const neighborhoodSelect = document.querySelector("select");

const avatar = document.querySelector(".avatar");
const imageBox = document.querySelector(".image");
const uploadBtn = document.querySelector(".primary.full");
const removeBtn = document.querySelector(".secondary.full");

const saveBtn = document.querySelector(".floating-actions .primary");
const cancelBtn = document.querySelector(".floating-actions .secondary");

/* ===============================
   LOAD USER
================================ */
async function loadProfile() {
  try {
    const res = await fetch(API + "/account", {
      headers: {
        Authorization: "Bearer " + session.token
      }
    });

    if (res.status === 401) {
      localStorage.removeItem("citizenSession");
      return window.location.href = "/civic/html/auth/LoginPage.html";
    }

    const user = await res.json();

    nameInput.value = user.name || "";
    emailInput.value = user.email || "";
    phoneInput.value = user.phone || "";
    neighborhoodSelect.value = user.neighborhood || "";

    if (user.avatar) {
      imageBox.style.backgroundImage = `url(${API}/uploads/${user.avatar})`;
    }

  } catch (err) {
    console.error("LOAD PROFILE ERROR:", err);
    alert("Failed to load profile");
  }
}

/* ===============================
   UPLOAD IMAGE
================================ */
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const form = new FormData();
  form.append("avatar", file);

  try {
    const res = await fetch(API + "/account/avatar", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + session.token
      },
      body: form
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    imageBox.style.backgroundImage = `url(${API}/uploads/${data.avatar})`;
    alert("Profile photo updated");

  } catch (err) {
    alert(err.message || "Upload failed");
  }
};

/* ===============================
   REMOVE AVATAR
================================ */
removeBtn.onclick = async () => {
  if (!confirm("Remove profile picture?")) return;

  try {
    await fetch(API + "/account/avatar", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + session.token
      }
    });

    imageBox.style.backgroundImage = "";
    alert("Profile picture removed");

  } catch {
    alert("Failed to remove image");
  }
};

/* ===============================
   SAVE PROFILE
================================ */
saveBtn.onclick = async () => {
  saveBtn.innerText = "Saving...";
  saveBtn.disabled = true;

  try {
    const res = await fetch(API + "/account", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.token
      },
      body: JSON.stringify({
        name: nameInput.value,
        phone: phoneInput.value,
        neighborhood: neighborhoodSelect.value
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    alert("Profile updated");

  } catch (err) {
    alert(err.message || "Save failed");
  }

  saveBtn.innerText = "Save Changes";
  saveBtn.disabled = false;
};

/* ===============================
   CANCEL
================================ */
cancelBtn.onclick = () => {
  if (confirm("Discard changes?")) {
    loadProfile();
  }
};

/* ===============================
   LOGOUT
================================ */
avatar.onclick = () => {
  if (confirm("Logout?")) {
    localStorage.removeItem("citizenSession");
    window.location.href = "/civic/html/auth/LoginPage.html";
  }
};

/* ===============================
   START
================================ */
loadProfile();
