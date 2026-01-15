// ===============================
// AUTH SESSION
// ===============================
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const session = JSON.parse(localStorage.getItem("citizenSession"));

if (!session || !session.token) {
  window.location.href = "/civic/html/auth/LoginPage.html";
}

// ===============================
// UPDATE LAST ACTIVE TIME
// ===============================
session.lastActive = Date.now();
localStorage.setItem("citizenSession", JSON.stringify(session));

// ===============================
// AUTO LOGOUT ON IDLE
// ===============================
function checkSession() {
  const s = JSON.parse(localStorage.getItem("citizenSession"));
  if (!s) return;

  if (Date.now() - s.lastActive > SESSION_TIMEOUT) {
    alert("Session expired. Please login again.");
    logout();
  }
}

// update activity time when user interacts
["click","mousemove","keydown","scroll"].forEach(evt => {
  document.addEventListener(evt, () => {
    const s = JSON.parse(localStorage.getItem("citizenSession"));
    if (!s) return;
    s.lastActive = Date.now();
    localStorage.setItem("citizenSession", JSON.stringify(s));
  });
});

setInterval(checkSession, 60000); // check every minute

// ===============================
// LOGOUT
// ===============================
function logout() {
  localStorage.removeItem("citizenSession");
  localStorage.removeItem("token");
  window.location.href = "/civic/html/auth/LoginPage.html";
}

// If you have a logout button
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

// ===============================
// USER NAME
// ===============================
document.querySelectorAll(".font-bold").forEach(el => {
  if (el.textContent === "Alex Johnson") {
    el.textContent = session.name;
  }
});

const welcome = document.querySelector("h1");
if (welcome) {
  welcome.innerHTML = `Welcome back, ${session.name.split(" ")[0]}!`;
}

// ===============================
// FETCH DASHBOARD DATA
// ===============================
fetch("http://localhost:5000/api/user-dashboard", {
  headers: {
    Authorization: session.token
  }
})
.then(res => res.json())
.then(data => {
  updateStats(data);
  updateActivity(data.reports);
})
.catch(() => {
  console.log("Dashboard API offline — showing cached data");
});

// ===============================
// UPDATE STATS
// ===============================
function updateStats(data) {
  const numbers = document.querySelectorAll(".text-3xl.font-black");
  if (numbers.length >= 3) {
    numbers[0].textContent = data.total;
    numbers[1].textContent = data.resolved;
    numbers[2].textContent = data.active;
  }
}

// ===============================
// UPDATE ACTIVITY
// ===============================
function updateActivity(reports) {
  const container = document.querySelector(".lg\\:col-span-2 .bg-white");

  if (!container || !Array.isArray(reports)) return;

  container.innerHTML = "";

  reports.forEach(r => {
    const div = document.createElement("div");
    div.className = "p-6 border-b hover:bg-gray-50 transition";

    div.innerHTML = `
      <div class="flex justify-between mb-2">
        <h4 class="font-bold">${r.title}</h4>
        <span class="text-xs text-gray-400">${r.time || "Recently"}</span>
      </div>
      <span class="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">${r.status}</span>
    `;

    container.appendChild(div);
  });
}

// ===============================
// NAVIGATION FIX
// ===============================
document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    const s = JSON.parse(localStorage.getItem("citizenSession"));
    if (s) {
      s.lastActive = Date.now();
      localStorage.setItem("citizenSession", JSON.stringify(s));
    }
  });
});
