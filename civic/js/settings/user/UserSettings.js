/* ============================================
   User Settings — Civic Platform
============================================ */

/* ---------- ELEMENTS ---------- */
const form = document.getElementById("settingsForm");
const toast = document.getElementById("toast");
const themeToggle = document.getElementById("themeToggle");

const inputs = {
  firstName: document.getElementById("firstName"),
  lastName: document.getElementById("lastName"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),

  notifEmail: document.getElementById("notifEmail"),
  notifPush: document.getElementById("notifPush"),
  notifSms: document.getElementById("notifSms"),

  publicProfile: document.getElementById("publicProfile"),
  showActivity: document.getElementById("showActivity"),
  shareData: document.getElementById("shareData"),

  themeLight: document.querySelector('input[value="light"]'),
  themeDark: document.querySelector('input[value="dark"]')
};

/* ---------- LOAD SETTINGS ---------- */
function loadSettings() {
  const saved = JSON.parse(localStorage.getItem("userSettings"));

  if (!saved) return;

  inputs.firstName.value = saved.firstName || "";
  inputs.lastName.value = saved.lastName || "";
  inputs.email.value = saved.email || "";
  inputs.phone.value = saved.phone || "";

  inputs.notifEmail.checked = saved.notifEmail || false;
  inputs.notifPush.checked = saved.notifPush || false;
  inputs.notifSms.checked = saved.notifSms || false;

  inputs.publicProfile.checked = saved.publicProfile || false;
  inputs.showActivity.checked = saved.showActivity || false;
  inputs.shareData.checked = saved.shareData || false;

  if (saved.theme === "dark") {
    inputs.themeDark.checked = true;
    document.body.classList.add("dark");
  } else {
    inputs.themeLight.checked = true;
    document.body.classList.remove("dark");
  }
}

/* ---------- SAVE SETTINGS ---------- */
form.addEventListener("submit", e => {
  e.preventDefault();

  const settings = {
    firstName: inputs.firstName.value,
    lastName: inputs.lastName.value,
    email: inputs.email.value,
    phone: inputs.phone.value,

    notifEmail: inputs.notifEmail.checked,
    notifPush: inputs.notifPush.checked,
    notifSms: inputs.notifSms.checked,

    publicProfile: inputs.publicProfile.checked,
    showActivity: inputs.showActivity.checked,
    shareData: inputs.shareData.checked,

    theme: inputs.themeDark.checked ? "dark" : "light"
  };

  localStorage.setItem("userSettings", JSON.stringify(settings));

  applyTheme(settings.theme);
  showToast("Settings saved successfully ✔");
});

/* ---------- RESET ---------- */
document.getElementById("resetBtn").onclick = () => {
  localStorage.removeItem("userSettings");
  location.reload();
};

/* ---------- THEME ---------- */
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    themeToggle.innerText = "☀";
  } else {
    document.body.classList.remove("dark");
    themeToggle.innerText = "🌙";
  }
}

/* ---------- THEME TOGGLE ---------- */
themeToggle.onclick = () => {
  const dark = document.body.classList.toggle("dark");
  applyTheme(dark ? "dark" : "light");

  const settings = JSON.parse(localStorage.getItem("userSettings")) || {};
  settings.theme = dark ? "dark" : "light";
  localStorage.setItem("userSettings", JSON.stringify(settings));
};

/* ---------- TOAST ---------- */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* ---------- INIT ---------- */
loadSettings();
