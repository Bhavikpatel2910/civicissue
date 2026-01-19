/* ========================================================
   FIELD STAFF DASHBOARD – DYNAMIC DATA & ACTIONS
======================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ======================
     SESSION & AUTH GUARD
  ====================== */
  let staffSession = null;
  try {
    // A mock session object. In a real app, this would be set on login.
    const mockSession = {
      token: "staff_mock_token_12345",
      role: "staff",
      name: "Marcus Chen",
      profilePicture: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjc3d7WGyVMjWmlEhG7d8ImkWeHORl7W7ne5c69GP7F0VILNrQTLZN4RmWMNUxeZ862dTqZCHXM4PAFY0miy-hxx-GOUoe82ddvzfqdnaH8InkCdfQkTBXGkxCaKqzRGmFIkM0F2CPDDn6nwnrJwQ9Q6xaerdsFbky09KZBfCqDXKIfW94BFRn6v8ckFWRJReImoASxSHQZ39i5o3nPN-hrUnvTx0Ry9TmcoTiNjfCTYIH6rkuymFtnU0j8A7g2z_lTESesdVmZnbD",
      shiftStart: new Date().getTime() // Simulate shift started now
    };
    localStorage.setItem("staffSession", JSON.stringify(mockSession));

    staffSession = JSON.parse(localStorage.getItem("staffSession"));
  } catch {
    staffSession = null;
  }

  // If no session, or role is not staff, redirect to login
  if (!staffSession || staffSession.role !== "staff") {
    // window.location.replace("/civic/html/auth/StaffLogin.html");
    console.log("Redirecting to login..."); // For demo without actual redirect
    return;
  }

  const authHeaders = {
    Authorization: `Bearer ${staffSession.token}`
  };


  /* ======================
     ELEMENT SELECTORS
  ====================== */
  const staffNameEl = document.querySelector(".text-right p.text-sm.font-bold");
  const profileContainer = document.querySelector(".flex.items-center.gap-4.border-l");
  const profileImageEl = document.querySelector(".bg-center.bg-no-repeat.aspect-square");

  // Timer elements
  const timerHoursEl = document.querySelector(".flex.gap-4 > div:nth-child(1) p.text-3xl");
  const timerMinutesEl = document.querySelector(".flex.gap-4 > div:nth-child(3) p.text-3xl");
  const timerSecondsEl = document.querySelector(".flex.gap-4 > div:nth-child(5) p.text-3xl");

  // Priority Task elements
  const priorityTitleEl = document.querySelector("h3.text-2xl.font-800");
  const priorityDescriptionEl = document.querySelector("p.text-base.mb-6");
  const priorityLocationEl = document.querySelector(".space-y-3 > div:nth-child(1) span:last-child");
  const priorityLevelEl = document.querySelector(".space-y-3 > div:nth-child(2) span:last-child");

  // Summary Widget elements
  const tasksCompletedEl = document.querySelector(".grid-cols-1.md\\:grid-cols-3 > div:nth-child(1) p.text-3xl");
  const tasksProgressBar = document.querySelector(".grid-cols-1.md\\:grid-cols-3 > div:nth-child(1) .bg-blue-500");
  const zoneLoadEl = document.querySelector(".grid-cols-1.md\\:grid-cols-3 > div:nth-child(2) p.text-3xl");
  const teamMessagesEl = document.querySelector(".grid-cols-1.md\\:grid-cols-3 > div:nth-child(3) p.text-3xl");


  /* ======================
     LOGOUT
  ====================== */
  profileContainer?.addEventListener("click", () => {
    if (confirm("Clock out and end your shift?")) {
      localStorage.removeItem("staffSession");
      // window.location.replace("/civic/html/auth/StaffLogin.html");
      console.log("Logged out.");
    }
  });


  /* ======================
     SHIFT TIMER
  ====================== */
  function startShiftTimer() {
    const shiftStartTime = staffSession.shiftStart;
    if (!shiftStartTime) return;

    setInterval(() => {
      const now = new Date().getTime();
      const duration = now - shiftStartTime;

      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((duration % (1000 * 60)) / 1000);

      if (timerHoursEl) timerHoursEl.textContent = String(hours).padStart(2, '0');
      if (timerMinutesEl) timerMinutesEl.textContent = String(minutes).padStart(2, '0');
      if (timerSecondsEl) timerSecondsEl.textContent = String(seconds).padStart(2, '0');

    }, 1000);
  }


  /* ======================
     LOAD PROFILE & DATA
  ====================== */
  async function loadStaffProfile() {
    // Mock API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          name: staffSession.name || "Field Staff",
          profilePicture: staffSession.profilePicture
        });
      }, 200);
    });
  }

  async function loadDashboardData() {
    // Mock API call for dashboard stats
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          priorityTask: {
            title: "Water Main Leak - 123 Maple St",
            description: "System pressure drop detected in Zone 4. Immediate intervention required to prevent pavement erosion. Service shut-off required for 12 residential units.",
            location: "Northwest Quadrant, Sector G",
            level: "Critical (Category 1)"
          },
          tasksCompleted: 4,
          tasksTotal: 6,
          zoneLoad: 12,
          newMessages: 2,
        });
      }, 500);
    });
  }


  /* ======================
     RENDER FUNCTIONS
  ====================== */
  function renderProfile(data) {
    if (staffNameEl) staffNameEl.textContent = data.name;
    if (profileImageEl && data.profilePicture) {
      profileImageEl.style.backgroundImage = `url('${data.profilePicture}')`;
    }
  }

  function renderDashboard(data) {
    // Priority Task
    if (priorityTitleEl) priorityTitleEl.textContent = data.priorityTask.title;
    if (priorityDescriptionEl) priorityDescriptionEl.textContent = data.priorityTask.description;
    if (priorityLocationEl) priorityLocationEl.textContent = data.priorityTask.location;
    if (priorityLevelEl) priorityLevelEl.textContent = data.priorityTask.level;

    // Summary Widgets
    if (tasksCompletedEl) {
      tasksCompletedEl.innerHTML = `${data.tasksCompleted} <span class="text-lg text-[#9aaebc] font-normal">/ ${data.tasksTotal}</span>`;
    }
    if (tasksProgressBar) {
      const percentage = (data.tasksCompleted / data.tasksTotal) * 100;
      tasksProgressBar.style.width = `${percentage}%`;
    }
    if (zoneLoadEl) {
      zoneLoadEl.innerHTML = `${data.zoneLoad} <span class="text-lg text-[#9aaebc] font-normal">Active</span>`;
    }
    if (teamMessagesEl) {
      teamMessagesEl.innerHTML = `${data.newMessages} <span class="text-lg text-accent-orange font-bold uppercase">New</span>`;
    }
  }


  /* ======================
     INITIALIZATION
  ====================== */
  async function init() {
    const profileData = await loadStaffProfile();
    renderProfile(profileData);

    const dashboardData = await loadDashboardData();
    renderDashboard(dashboardData);

    startShiftTimer();

    console.log("Staff Dashboard Initialized.");
  }

  init();
});