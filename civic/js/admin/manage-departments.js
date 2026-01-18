/* =====================================================
   CITY DEPARTMENT MANAGEMENT – ADMIN (FINAL CLEAN)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     AUTH CHECK
  =============================== */
  let session = null;

  try {
    session = JSON.parse(localStorage.getItem("citizenSession"));
  } catch {
    session = null;
  }


  const TOKEN = session.token;
  const API_BASE = "http://localhost:5000/api/admin";

  /* ===============================
     ELEMENTS
  =============================== */
  const deptGrid = document.querySelector(".dept-grid");
  const newDeptBtn = document.querySelector(".new-dept");
  const searchInput = document.querySelector(".top-actions input");
  const notificationIcon = document.querySelector(
    ".top-actions span.material-symbols-outlined"
  );

  let departments = [];

  /* ===============================
     RENDER DEPARTMENTS
  =============================== */
  function renderDepartments(data) {
    if (!deptGrid) return;

    deptGrid.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      deptGrid.innerHTML =
        "<p class='empty'>No departments found.</p>";
      return;
    }

    data.forEach(dept => {
      const sla = Number(dept.sla ?? 100);
      const staff = dept.staffCount ?? dept.staff ?? 0;
      const orders = dept.orders ?? 0;

      const card = document.createElement("div");
      card.className = `dept-card ${sla < 80 ? "warning" : ""}`;

      card.innerHTML = `
        <h3>${dept.name}</h3>
        <p class="code">${dept.code}</p>

        <div class="meta">
          <span>Active Staff</span>
          <strong>${staff}</strong>
        </div>

        <div class="meta">
          <span>Open Orders</span>
          <strong>${orders}</strong>
        </div>

        <div class="sla">
          <div class="sla-bar ${sla < 80 ? "warning" : ""}" style="width:0%"></div>
        </div>

        <button data-code="${dept.code}">
          Manage Settings
        </button>
      `;

      deptGrid.appendChild(card);

      // Animate SLA bar
      setTimeout(() => {
        const bar = card.querySelector(".sla-bar");
        if (bar) bar.style.width = `${sla}%`;
      }, 80);
    });

    attachManageHandlers();
  }

  /* ===============================
     LOAD DEPARTMENTS
  =============================== */
  async function loadDepartments() {
    try {
      const res = await fetch(`${API_BASE}/departments`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("citizenSession");
        window.location.replace("/civic/html/auth/adminLogin.html");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load departments");
      }

      departments = Array.isArray(data) ? data : [];
      renderDepartments(departments);

    } catch (err) {
      console.error("LOAD DEPARTMENTS ERROR:", err);
      alert("Failed to load departments");
    }
  }

  /* ===============================
     MANAGE SETTINGS
  =============================== */
  function attachManageHandlers() {
    document.querySelectorAll(".dept-card button").forEach(btn => {
      btn.addEventListener("click", () => {
        const code = btn.dataset.code;
        alert(`Managing settings for department: ${code}`);

        // Future:
        // window.location.href =
        // `/civic/html/admin/department-settings.html?code=${code}`;
      });
    });
  }

  /* ===============================
     CREATE NEW DEPARTMENT
  =============================== */
  newDeptBtn?.addEventListener("click", async () => {
    const name = prompt("Enter Department Name:");
    if (!name?.trim()) return;

    const code = prompt("Enter Department Code:");
    if (!code?.trim()) return;

    if (departments.some(d =>
      d.code.toLowerCase() === code.toLowerCase()
    )) {
      alert("Department code already exists");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim()
        })
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("citizenSession");
        window.location.replace("/civic/html/auth/adminLogin.html");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to create department");
        return;
      }

      departments.push(data.department);
      renderDepartments(departments);

      alert("Department created successfully");

    } catch (err) {
      console.error("CREATE DEPARTMENT ERROR:", err);
      alert("Server error while creating department");
    }
  });

  /* ===============================
     SEARCH FILTER
  =============================== */
  searchInput?.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase().trim();

    const filtered = departments.filter(dept =>
      dept.name.toLowerCase().includes(value) ||
      dept.code.toLowerCase().includes(value)
    );

    renderDepartments(filtered);
  });

  /* ===============================
     NOTIFICATIONS
  =============================== */
  notificationIcon?.addEventListener("click", () => {
    alert("No new notifications");
  });

  /* ===============================
     INIT
  =============================== */
  loadDepartments();

  console.log(" Manage Departments loaded successfully");

});
