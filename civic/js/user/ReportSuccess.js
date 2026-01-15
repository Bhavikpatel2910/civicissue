/* ===============================
   CityFix – Report Success Logic
================================ */

// 1️⃣ Load session
const session = JSON.parse(localStorage.getItem("citizenSession"));
const lastReport = JSON.parse(localStorage.getItem("lastSubmittedReport"));

if (!session || !lastReport) {
  window.location.href = "/civic/html/auth/LoginPage.html";
}

/* ===============================
   Populate Report Summary
================================ */

document.querySelector(".id").textContent = `Report ID: ${lastReport.reportId}`;
document.querySelector(".details h3").textContent = lastReport.title;
document.querySelector(".location").textContent = lastReport.location;
document.querySelector(".time").innerHTML = `
  <span class="material-symbols-outlined">schedule</span>
  Submitted just now
`;

/* ===============================
   XP & Rank Animation
================================ */

const earnedXP = 50;
const oldXP = lastReport.oldXP || 770;
const newXP = oldXP + earnedXP;

document.querySelector(".value").textContent = `+${earnedXP}`;
document.querySelector(".xp").textContent = `${newXP} / 1000 XP`;

const fill = document.querySelector(".progress-bar .fill");
const percent = Math.min((newXP / 1000) * 100, 100);

setTimeout(() => {
  fill.style.width = percent + "%";
}, 300);

/* ===============================
   Toast auto-hide
================================ */

setTimeout(() => {
  const toast = document.getElementById("toast");
  if (toast) toast.style.opacity = "0";
}, 6000);

/* ===============================
   Buttons
================================ */

document.querySelector(".primary").onclick = () => {
  window.location.href =
    "/civic/html/user/ReportProgress.html?id=" + lastReport.mongoId;
};

document.querySelector(".secondary").onclick = () => {
  window.location.href = "/civic/html/user/UserDashboard.html";
};

/* ===============================
   Edit Report
================================ */

document.querySelector(".footer-note a").onclick = e => {
  e.preventDefault();
  window.location.href =
    "/civic/html/user/EditReport.html?id=" + lastReport.mongoId;
};

/* ===============================
   Security: prevent back to submit
================================ */

history.pushState(null, null, location.href);
window.onpopstate = () => {
  history.go(1);
};
